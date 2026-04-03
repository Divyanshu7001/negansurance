"""Claim decisioning + fraud scoring orchestration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

from .graph import InteractionGraph
from .ml import DEFAULT_COEFFICIENTS, FeatureProjector, LogisticRiskModel
from .models import DecisionBreakdown, DecisionResult, EvaluationContext, RuleOutcome
from .rules import DEFAULT_RULES, Rule


def _calculate_base_payout(context: EvaluationContext) -> float:
    proportion = min(context.claim.declared_loss_hours / 12, 1.0)
    base = min(context.policy.weekly_cap * proportion, context.policy.weekly_cap)
    return round(base * context.policy.payout_multiplier, 2)


@dataclass
class ClaimDecisioningFraudEngine:
    """Runs rule, ML, and graph layers to reach a claim decision."""

    rules: Sequence[Rule] = DEFAULT_RULES
    projector: FeatureProjector = FeatureProjector()
    model: LogisticRiskModel = LogisticRiskModel(DEFAULT_COEFFICIENTS)
    graph: InteractionGraph = InteractionGraph()
    review_threshold: float = 0.45
    block_threshold: float = 0.8

    def evaluate(self, context: EvaluationContext) -> DecisionResult:
        rule_outcomes = [rule(context) for rule in self.rules]
        blocking = [r for r in rule_outcomes if not r.passed and r.severity == "block"]
        ml_features = self.projector(context)
        ml_score = self.model.predict_proba(ml_features)
        ml_explanations = self.model.explain(ml_features)
        graph_score, graph_explanations = self.graph.score_claim(context)
        rule_penalty = sum(out.score_penalty for out in rule_outcomes)
        composite = min(ml_score * 0.6 + graph_score * 0.25 + rule_penalty * 0.15, 1.0)

        explanations = list(ml_explanations) + graph_explanations
        explanations.extend(
            out.message
            for out in rule_outcomes
            if not out.passed and out.severity != "block"
        )

        if blocking:
            decision = "denied"
            action = "auto_deny"
            payout = 0.0
            explanations.extend(out.message for out in blocking)
        else:
            decision = self._decision_from_score(composite)
            action = self._recommended_action(decision)
            payout = _calculate_base_payout(context) if decision == "approved" else 0.0

        breakdown = DecisionBreakdown(
            rule_outcomes=rule_outcomes,
            ml_score=round(ml_score, 4),
            graph_score=round(graph_score, 4),
            composite_score=round(composite, 4),
            explanations=explanations,
        )
        return DecisionResult(
            decision=decision,
            recommended_action=action,
            payout_amount=payout,
            breakdown=breakdown,
        )

    def _decision_from_score(self, score: float) -> str:
        if score >= self.block_threshold:
            return "denied"
        if score >= self.review_threshold:
            return "needs_review"
        return "approved"

    @staticmethod
    def _recommended_action(decision: str) -> str:
        if decision == "approved":
            return "auto_pay"
        if decision == "needs_review":
            return "manual_review"
        return "auto_deny"
