"""Core dataclasses shared across the fraud engine modules."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List


@dataclass(frozen=True)
class PartnerBehaviorSignals:
    """Aggregated behavioral metrics for a delivery partner."""

    partner_id: str
    reliability_score: float  # 0.0 - 1.0
    historical_claim_count: int
    manual_review_ratio: float  # 0.0 - 1.0
    active_device_count: int
    payout_handle_age_days: int
    last_claim_at: datetime | None = None


@dataclass(frozen=True)
class ClaimEvent:
    """Raw claim submission enriched with trigger telemetry."""

    claim_id: str
    policy_id: str
    trigger_type: str
    trigger_confidence: float  # 0.0 - 1.0
    incident_at: datetime
    filed_at: datetime
    declared_loss_hours: float
    evidence_count: int
    location_h3: str
    device_id: str
    payout_handle: str
    metadata: Dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class PolicySnapshot:
    """Policy state at the moment of claim submission."""

    policy_id: str
    partner_id: str
    plan_tier: str
    city: str
    zone: str
    start_at: datetime
    end_at: datetime
    waiting_period_hours: int
    weekly_cap: float
    max_events_per_week: int
    payout_multiplier: float


@dataclass(frozen=True)
class EvaluationContext:
    """Complete context needed by the rules, ML, and graph layers."""

    claim: ClaimEvent
    policy: PolicySnapshot
    partner: PartnerBehaviorSignals
    open_claim_ids: List[str] = field(default_factory=list)
    duplicate_window_hours: int = 12
    geo_history_h3: List[str] = field(default_factory=list)
    linked_device_ids: List[str] = field(default_factory=list)
    linked_payout_handles: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class RuleOutcome:
    rule_id: str
    passed: bool
    severity: str  # info | warn | block
    message: str
    score_penalty: float = 0.0


@dataclass(frozen=True)
class DecisionBreakdown:
    rule_outcomes: List[RuleOutcome]
    ml_score: float
    graph_score: float
    composite_score: float
    explanations: List[str] = field(default_factory=list)


@dataclass(frozen=True)
class DecisionResult:
    decision: str  # approved | needs_review | denied
    recommended_action: str
    payout_amount: float
    breakdown: DecisionBreakdown
