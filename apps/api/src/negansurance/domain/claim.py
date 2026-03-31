"""Claim domain models and decisions."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field

from .trigger import TriggerType


class ClaimSubmission(BaseModel):
    policy_id: str
    trigger_type: TriggerType
    incident_at: datetime
    declared_loss_hours: float = Field(ge=0, le=48)
    description: str | None = None
    evidence_urls: List[str] = Field(default_factory=list)


class ClaimDecisionStatus(str, Enum):
    approved = "approved"
    denied = "denied"
    pending = "pending"


class ClaimDecision(BaseModel):
    claim_id: str
    policy_id: str
    status: ClaimDecisionStatus
    payout_amount: float
    denial_reasons: List[str] = Field(default_factory=list)
    decided_at: datetime
