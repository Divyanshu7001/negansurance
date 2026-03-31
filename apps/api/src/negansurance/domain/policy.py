"""Policy-centered domain models."""

from __future__ import annotations

from datetime import datetime, timedelta
from enum import Enum
from typing import List, Literal

from pydantic import BaseModel, Field


class CoveragePlan(str, Enum):
    basic = "basic"
    plus = "plus"
    pro = "pro"


class PolicyStatus(str, Enum):
    draft = "draft"
    active = "active"
    expired = "expired"
    cancelled = "cancelled"


class PremiumQuoteRequest(BaseModel):
    partner_id: str
    city_tier: Literal["tier_a", "tier_b", "tier_c"]
    zone_risk_multiplier: float = Field(ge=0.5, le=1.5)
    demand_seasonality_multiplier: float = Field(ge=0.8, le=1.3)
    personal_consistency_multiplier: float = Field(ge=0.8, le=1.2)
    base_plan_rate: float = Field(gt=0)
    plan: CoveragePlan


class PremiumAdjustment(BaseModel):
    label: str
    value: float
    rationale: str


class PremiumQuote(BaseModel):
    partner_id: str
    plan: CoveragePlan
    weekly_premium: float
    max_payout: float
    explanations: List[PremiumAdjustment]
    valid_until: datetime


class PolicyCreateRequest(BaseModel):
    partner_id: str
    plan: CoveragePlan
    city: str
    zone: str
    premium_quote: PremiumQuote
    start_at: datetime
    policy_window_hours: int = Field(default=168)


class Policy(BaseModel):
    policy_id: str
    partner_id: str
    plan: CoveragePlan
    city: str
    zone: str
    status: PolicyStatus
    premium: float
    max_weekly_payout: float
    start_at: datetime
    end_at: datetime
    created_at: datetime

    @classmethod
    def from_request(cls, policy_id: str, payload: PolicyCreateRequest) -> "Policy":
        end_at = payload.start_at + timedelta(hours=payload.policy_window_hours)
        return cls(
            policy_id=policy_id,
            partner_id=payload.partner_id,
            plan=payload.plan,
            city=payload.city,
            zone=payload.zone,
            status=PolicyStatus.active,
            premium=payload.premium_quote.weekly_premium,
            max_weekly_payout=payload.premium_quote.max_payout,
            start_at=payload.start_at,
            end_at=end_at,
            created_at=datetime.utcnow(),
        )
