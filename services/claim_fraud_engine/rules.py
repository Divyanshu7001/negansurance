"""Deterministic guardrail rules for claims."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Protocol

from .models import EvaluationContext, RuleOutcome


class Rule(Protocol):
    """Simple callable contract for rule evaluators."""

    rule_id: str
    description: str
    severity: str
    penalty: float

    def __call__(self, context: EvaluationContext) -> RuleOutcome: ...


@dataclass
class WaitingPeriodRule:
    """Blocks claims filed before the configured waiting period."""

    rule_id: str = "waiting_period"
    description: str = "Claim must occur after policy waiting period"
    severity: str = "block"
    penalty: float = 0.4

    def __call__(self, context: EvaluationContext) -> RuleOutcome:
        delta = context.claim.incident_at - context.policy.start_at
        hours = delta.total_seconds() / 3600
        passed = hours >= context.policy.waiting_period_hours
        message = (
            "Incident within waiting period"
            if not passed
            else "Incident after waiting period"
        )
        return RuleOutcome(
            rule_id=self.rule_id,
            passed=passed,
            severity=self.severity,
            message=message,
            score_penalty=0.0 if passed else self.penalty,
        )


@dataclass
class DuplicateWindowRule:
    """Flags duplicate submissions across the duplicate window horizon."""

    window: timedelta
    max_allowed: int = 1
    rule_id: str = "duplicate_window"
    description: str = "Only one claim allowed in rolling duplicate window"
    severity: str = "warn"
    penalty: float = 0.25

    def __call__(self, context: EvaluationContext) -> RuleOutcome:
        recent_count = len(context.open_claim_ids)
        passed = recent_count < self.max_allowed
        message = (
            f"{recent_count} recent claims in window"
            if not passed
            else "No duplicates in window"
        )
        penalty = 0.0 if passed else self.penalty + 0.1 * recent_count
        return RuleOutcome(
            rule_id=self.rule_id,
            passed=passed,
            severity="block" if not passed and recent_count >= self.max_allowed else self.severity,
            message=message,
            score_penalty=penalty,
        )


@dataclass
class GeoConsistencyRule:
    """Ensures partner location history matches the claim location."""

    drift_threshold: int = 2
    rule_id: str = "geo_consistency"
    description: str = "Claim geohash must align with last known movement"
    severity: str = "warn"
    penalty: float = 0.15

    def __call__(self, context: EvaluationContext) -> RuleOutcome:
        history = context.geo_history_h3
        passed = context.claim.location_h3 in history[-self.drift_threshold :]
        message = (
            "Claim outside recent movement trail"
            if not passed
            else "Claim matches recent locations"
        )
        return RuleOutcome(
            rule_id=self.rule_id,
            passed=passed,
            severity=self.severity,
            message=message,
            score_penalty=0.0 if passed else self.penalty,
        )


DEFAULT_RULES: tuple[Rule, ...] = (
    WaitingPeriodRule(),
    DuplicateWindowRule(window=timedelta(hours=12)),
    GeoConsistencyRule(),
)
