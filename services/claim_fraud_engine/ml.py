"""Lightweight ML-style scoring utilities."""

from __future__ import annotations

from dataclasses import dataclass
from math import exp
from typing import Dict, Tuple

from .models import EvaluationContext


class FeatureProjector:
    """Transforms contextual data into numeric features."""

    def __call__(self, context: EvaluationContext) -> Dict[str, float]:
        claim = context.claim
        partner = context.partner
        features: Dict[str, float] = {
            "trigger_confidence": claim.trigger_confidence,
            "reliability": partner.reliability_score,
            "evidence_density": min(claim.evidence_count / max(claim.declared_loss_hours, 1.0), 3.0),
            "duplicate_pressure": min(len(context.open_claim_ids) / 2, 1.0),
            "manual_review_ratio": partner.manual_review_ratio,
            "device_cluster_size": min(len(context.linked_device_ids) / 5, 1.0),
            "payout_ratio": min(claim.declared_loss_hours / 12, 1.0),
        }
        return features


@dataclass
class LogisticRiskModel:
    """Deterministic logistic-risk scorer with explainability hooks."""

    coefficients: Dict[str, float]
    intercept: float = -1.1

    def predict_proba(self, features: Dict[str, float]) -> float:
        z = self.intercept
        for name, weight in self.coefficients.items():
            z += weight * features.get(name, 0.0)
        return 1.0 / (1.0 + exp(-z))

    def explain(self, features: Dict[str, float]) -> Tuple[str, ...]:
        insights = []
        for name, weight in self.coefficients.items():
            contribution = weight * features.get(name, 0.0)
            if abs(contribution) < 0.05:
                continue
            tendency = "increases" if contribution > 0 else "reduces"
            insights.append(f"Feature {name} {tendency} risk by {contribution:.2f}")
        return tuple(insights)


DEFAULT_COEFFICIENTS: Dict[str, float] = {
    "trigger_confidence": -2.0,
    "reliability": -1.5,
    "evidence_density": -0.6,
    "duplicate_pressure": 1.3,
    "manual_review_ratio": 1.8,
    "device_cluster_size": 1.2,
    "payout_ratio": 0.9,
}
