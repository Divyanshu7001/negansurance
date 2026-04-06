"""Claim domain models and decisions."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field

from .trigger import TriggerType
from .policy import CoveragePlan


class ClaimSubmission(BaseModel):
    policy_id: str
    trigger_type: TriggerType
    incident_at: datetime
    declared_loss_hours: float = Field(ge=0, le=48)
    description: str | None = None
    evidence_urls: List[str] = Field(default_factory=list)
    trigger_confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    device_id: str | None = None
    payout_handle: str | None = None
    location_h3: str | None = None


class ClaimDecisionStatus(str, Enum):
    approved = "approved"
    denied = "denied"
    pending = "pending"
    needs_review = "needs_review"


class ClaimUserInfo(BaseModel):
    partner_id: str
    policy_id: str
    plan: CoveragePlan
    city: str
    zone: str


class ClaimSummary(BaseModel):
    trigger_type: TriggerType
    incident_at: datetime
    filed_at: datetime
    declared_loss_hours: float
    description: str | None = None
    evidence_urls: List[str] = Field(default_factory=list)


class RuleOutcomeBreakdown(BaseModel):
    rule_id: str
    passed: bool
    severity: str
    message: str
    score_penalty: float


class ClaimDecisionBreakdown(BaseModel):
    rule_outcomes: List[RuleOutcomeBreakdown]
    ml_score: float
    graph_score: float
    composite_score: float
    explanations: List[str] = Field(default_factory=list)


class ClaimDecision(BaseModel):
    claim_id: str
    policy_id: str
    status: ClaimDecisionStatus
    payout_amount: float
    denial_reasons: List[str] = Field(default_factory=list)
    decided_at: datetime
    recommended_action: str | None = None
    user_info: ClaimUserInfo | None = None
    claim_summary: ClaimSummary | None = None
    breakdown: ClaimDecisionBreakdown | None = None
