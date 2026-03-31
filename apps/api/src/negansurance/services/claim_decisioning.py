"""Claim submission + decision heuristics."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Dict, TYPE_CHECKING

from ..domain import (
    ClaimDecision,
    ClaimDecisionStatus,
    ClaimSubmission,
    Policy,
)

if TYPE_CHECKING:
    from .policy_service import PolicyService


class ClaimDecisioningService:
    def __init__(self, policy_service: "PolicyService") -> None:
        self._policy_service = policy_service
        self._claims: Dict[str, ClaimDecision] = {}

    async def submit_claim(self, payload: ClaimSubmission) -> ClaimDecision:
        policy = await self._policy_service.get_policy(payload.policy_id)
        if policy is None:
            raise ValueError("Policy not found")

        status, payout, reasons = self._evaluate(policy, payload)
        decision = ClaimDecision(
            claim_id=f"CLM-{uuid.uuid4().hex[:10].upper()}",
            policy_id=payload.policy_id,
            status=status,
            payout_amount=payout,
            denial_reasons=reasons,
            decided_at=datetime.utcnow(),
        )
        self._claims[decision.claim_id] = decision
        return decision

    def get(self, claim_id: str) -> ClaimDecision | None:
        return self._claims.get(claim_id)

    def _evaluate(
        self, policy: Policy, payload: ClaimSubmission
    ) -> tuple[ClaimDecisionStatus, float, list[str]]:
        reasons: list[str] = []
        if payload.incident_at < policy.start_at:
            reasons.append("Incident predates active policy window")
        if payload.incident_at > policy.end_at + timedelta(hours=2):
            reasons.append("Incident outside covered window")

        if reasons:
            return ClaimDecisionStatus.denied, 0.0, reasons

        proportion = min(payload.declared_loss_hours / 12, 1)
        base_cap = policy.max_weekly_payout * 0.35
        payout = round(min(base_cap * proportion, policy.max_weekly_payout), 2)
        if payout <= 0:
            reasons.append("Declared loss too low for payout")
            return ClaimDecisionStatus.denied, 0.0, reasons

        return ClaimDecisionStatus.approved, payout, []
