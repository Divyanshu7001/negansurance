"""Claim submission + decision heuristics."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, TYPE_CHECKING, List

from services.claim_fraud_engine import (
    ClaimDecisioningFraudEngine,
    ClaimEvent,
    DecisionBreakdown,
    EvaluationContext,
    PartnerBehaviorSignals,
    PolicySnapshot,
)

from ..core import Database
from ..domain import (
    ClaimDecision,
    ClaimDecisionBreakdown,
    ClaimDecisionStatus,
    ClaimSubmission,
    ClaimSummary,
    ClaimUserInfo,
    Policy,
)
from ..domain.claim import RuleOutcomeBreakdown

if TYPE_CHECKING:
    from .policy_service import PolicyService


class ClaimDecisioningService:
    def __init__(self, policy_service: "PolicyService", database: Database) -> None:
        self._policy_service = policy_service
        self._database = database
        self._engine = ClaimDecisioningFraudEngine()
        self._claims: Dict[str, ClaimDecision] = {}

    async def submit_claim(self, payload: ClaimSubmission) -> ClaimDecision:
        policy = await self._policy_service.get_policy(payload.policy_id)
        if policy is None:
            raise ValueError("Policy not found")

        filed_at = datetime.utcnow()
        claim_id = self._generate_claim_id()
        context = self._build_context(claim_id, policy, payload, filed_at)
        engine_result = self._engine.evaluate(context)
        status = self._map_status(engine_result.decision)
        breakdown = self._build_breakdown(engine_result.breakdown)
        denial_reasons: List[str] = []
        if status == ClaimDecisionStatus.denied:
            denial_reasons = breakdown.explanations or ["Auto-denied by decision engine"]

        claim_summary = (
            self._build_claim_summary(payload, filed_at)
            if status == ClaimDecisionStatus.approved
            else None
        )
        user_info = self._build_user_info(policy) if claim_summary else None
        decision = ClaimDecision(
            claim_id=claim_id,
            policy_id=payload.policy_id,
            status=status,
            payout_amount=engine_result.payout_amount,
            denial_reasons=denial_reasons,
            decided_at=filed_at,
            recommended_action=engine_result.recommended_action,
            user_info=user_info,
            claim_summary=claim_summary,
            breakdown=breakdown,
        )
        self._claims[decision.claim_id] = decision
        if status == ClaimDecisionStatus.approved and user_info and claim_summary:
            await self._persist_approved_claim(decision)
        return decision

    def get(self, claim_id: str) -> ClaimDecision | None:
        return self._claims.get(claim_id)

    async def _persist_approved_claim(self, decision: ClaimDecision) -> None:
        if not decision.user_info or not decision.claim_summary:
            return
        payload = {
            "user": json.loads(decision.user_info.json()),
            "claim": json.loads(decision.claim_summary.json()),
            "breakdown": json.loads(decision.breakdown.json()) if decision.breakdown else None,
            "recommended_action": decision.recommended_action,
        }
        await self._database.execute(
            """
            INSERT INTO claims (
                claim_id,
                policy_id,
                partner_id,
                status,
                payout_amount,
                decision_payload,
                created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (claim_id) DO NOTHING
            """,
            decision.claim_id,
            decision.policy_id,
            decision.user_info.partner_id,
            decision.status.value,
            decision.payout_amount,
            json.dumps(payload),
            decision.decided_at,
        )

    def _build_context(
        self,
        claim_id: str,
        policy: Policy,
        payload: ClaimSubmission,
        filed_at: datetime,
    ) -> EvaluationContext:
        policy_snapshot = PolicySnapshot(
            policy_id=policy.policy_id,
            partner_id=policy.partner_id,
            plan_tier=policy.plan.value,
            city=policy.city,
            zone=policy.zone,
            start_at=policy.start_at,
            end_at=policy.end_at,
            waiting_period_hours=12,
            weekly_cap=policy.max_weekly_payout,
            max_events_per_week=2,
            payout_multiplier=self._plan_multiplier(policy),
        )

        location_h3 = payload.location_h3 or f"zone-{policy.zone.lower()}"
        device_id = payload.device_id or f"device-{policy.partner_id.lower()}"
        payout_handle = payload.payout_handle or f"upi:{policy.partner_id.lower()}"
        claim_event = ClaimEvent(
            claim_id=claim_id,
            policy_id=policy.policy_id,
            trigger_type=payload.trigger_type.value,
            trigger_confidence=payload.trigger_confidence,
            incident_at=payload.incident_at,
            filed_at=filed_at,
            declared_loss_hours=payload.declared_loss_hours,
            evidence_count=len(payload.evidence_urls),
            location_h3=location_h3,
            device_id=device_id,
            payout_handle=payout_handle,
            metadata={"description": payload.description or ""},
        )

        partner_signals = PartnerBehaviorSignals(
            partner_id=policy.partner_id,
            reliability_score=self._reliability_score(policy),
            historical_claim_count=self._historical_claim_count(policy.partner_id),
            manual_review_ratio=0.12,
            active_device_count=1,
            payout_handle_age_days=180,
            last_claim_at=self._last_claim_timestamp(policy.partner_id),
        )

        open_claim_ids = self._recent_claim_ids(policy.partner_id)
        geo_history = self._geo_history(location_h3)

        return EvaluationContext(
            claim=claim_event,
            policy=policy_snapshot,
            partner=partner_signals,
            open_claim_ids=open_claim_ids,
            duplicate_window_hours=12,
            geo_history_h3=geo_history,
            linked_device_ids=[],
            linked_payout_handles=[],
        )

    def _build_breakdown(self, breakdown: DecisionBreakdown) -> ClaimDecisionBreakdown:
        return ClaimDecisionBreakdown(
            rule_outcomes=[
                RuleOutcomeBreakdown(
                    rule_id=out.rule_id,
                    passed=out.passed,
                    severity=out.severity,
                    message=out.message,
                    score_penalty=out.score_penalty,
                )
                for out in breakdown.rule_outcomes
            ],
            ml_score=breakdown.ml_score,
            graph_score=breakdown.graph_score,
            composite_score=breakdown.composite_score,
            explanations=list(breakdown.explanations),
        )

    @staticmethod
    def _map_status(engine_decision: str) -> ClaimDecisionStatus:
        if engine_decision == "approved":
            return ClaimDecisionStatus.approved
        if engine_decision == "denied":
            return ClaimDecisionStatus.denied
        return ClaimDecisionStatus.needs_review

    def _build_claim_summary(
        self, payload: ClaimSubmission, filed_at: datetime
    ) -> ClaimSummary:
        return ClaimSummary(
            trigger_type=payload.trigger_type,
            incident_at=payload.incident_at,
            filed_at=filed_at,
            declared_loss_hours=payload.declared_loss_hours,
            description=payload.description,
            evidence_urls=payload.evidence_urls,
        )

    def _build_user_info(self, policy: Policy) -> ClaimUserInfo:
        return ClaimUserInfo(
            partner_id=policy.partner_id,
            policy_id=policy.policy_id,
            plan=policy.plan,
            city=policy.city,
            zone=policy.zone,
        )

    def _recent_claim_ids(self, partner_id: str) -> List[str]:
        horizon = datetime.utcnow() - timedelta(hours=12)
        return [
            claim.claim_id
            for claim in self._claims.values()
            if claim.user_info and claim.user_info.partner_id == partner_id and claim.decided_at >= horizon
        ]

    def _historical_claim_count(self, partner_id: str) -> int:
        return sum(
            1
            for claim in self._claims.values()
            if claim.user_info and claim.user_info.partner_id == partner_id
        )

    def _last_claim_timestamp(self, partner_id: str) -> datetime | None:
        timestamps = [
            claim.decided_at
            for claim in self._claims.values()
            if claim.user_info and claim.user_info.partner_id == partner_id
        ]
        return max(timestamps) if timestamps else None

    def _geo_history(self, current: str) -> List[str]:
        return [current]

    @staticmethod
    def _plan_multiplier(policy: Policy) -> float:
        if policy.plan.value == "pro":
            return 0.95
        if policy.plan.value == "plus":
            return 0.9
        return 0.8

    @staticmethod
    def _reliability_score(policy: Policy) -> float:
        if policy.plan.value == "pro":
            return 0.92
        if policy.plan.value == "plus":
            return 0.87
        return 0.8

    @staticmethod
    def _generate_claim_id() -> str:
        return f"CLM-{uuid.uuid4().hex[:10].upper()}"
