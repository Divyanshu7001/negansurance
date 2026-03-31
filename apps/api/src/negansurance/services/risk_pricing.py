"""Risk pricing heuristics for weekly premium quotes."""

from __future__ import annotations

from datetime import datetime, timedelta

from ..domain import CoveragePlan, PremiumAdjustment, PremiumQuote, PremiumQuoteRequest


class RiskPricingService:
    CITY_MULTIPLIERS = {
        "tier_a": 0.95,
        "tier_b": 1.1,
        "tier_c": 1.35,
    }

    PLAN_CAPS = {
        CoveragePlan.basic: 900,
        CoveragePlan.plus: 1500,
        CoveragePlan.pro: 2200,
    }

    def generate_quote(self, payload: PremiumQuoteRequest) -> PremiumQuote:
        city_multiplier = self.CITY_MULTIPLIERS[payload.city_tier]
        raw_premium = (
            payload.base_plan_rate
            * city_multiplier
            * payload.zone_risk_multiplier
            * payload.demand_seasonality_multiplier
            * payload.personal_consistency_multiplier
        )
        weekly_premium = round(max(raw_premium, 25), 2)

        explanations = [
            PremiumAdjustment(
                label="City tier",
                value=city_multiplier,
                rationale=f"{payload.city_tier.replace('_', ' ').title()} disruption profile",
            ),
            PremiumAdjustment(
                label="Zone risk",
                value=payload.zone_risk_multiplier,
                rationale="Hyperlocal disruption volatility",
            ),
            PremiumAdjustment(
                label="Demand seasonality",
                value=payload.demand_seasonality_multiplier,
                rationale="Upcoming events/weather patterns",
            ),
            PremiumAdjustment(
                label="Consistency",
                value=payload.personal_consistency_multiplier,
                rationale="Attendance reliability guardrail",
            ),
        ]

        return PremiumQuote(
            partner_id=payload.partner_id,
            plan=payload.plan,
            weekly_premium=weekly_premium,
            max_payout=self.PLAN_CAPS[payload.plan],
            explanations=explanations,
            valid_until=datetime.utcnow() + timedelta(hours=24),
        )
