# Claim Decisioning & Fraud Engine

Composable Python service that merges deterministic rules, lightweight ML scoring, and graph-based linkage checks before releasing claim payouts. Designed for synchronous evaluation inside the FastAPI app or offline replay pipelines.

## Pipeline

1. **Context assembly** – hydrate `EvaluationContext` with claim payload, policy snapshot, partner behavior metrics, and graph link hints.
2. **Rules layer** – `WaitingPeriodRule`, `DuplicateWindowRule`, and `GeoConsistencyRule` run first and can block/penalize risky claims with clear reason codes.
3. **ML layer** – `FeatureProjector` builds explainable features which the `LogisticRiskModel` converts into a calibrated fraud probability.
4. **Graph layer** – `InteractionGraph` inspects partner ↔ device ↔ payout linkages plus prior flags to add collusion risk.
5. **Decision mixer** – combines scores + rule penalties into a composite score and recommends `approved`, `needs_review`, or `denied` action with payout guidance.

## Quick Start

```python
from datetime import datetime, timedelta

from services.claim_fraud_engine import (
    ClaimDecisioningFraudEngine,
    ClaimEvent,
    EvaluationContext,
    PartnerBehaviorSignals,
    PolicySnapshot,
)

engine = ClaimDecisioningFraudEngine()

context = EvaluationContext(
    claim=ClaimEvent(
        claim_id="CLM-1",
        policy_id="POL-1",
        trigger_type="rain",
        trigger_confidence=0.92,
        incident_at=datetime.utcnow(),
        filed_at=datetime.utcnow(),
        declared_loss_hours=6,
        evidence_count=3,
        location_h3="8a9c1bb",
        device_id="dev-123",
        payout_handle="upi:abc",
    ),
    policy=PolicySnapshot(
        policy_id="POL-1",
        partner_id="partner-99",
        plan_tier="plus",
        city="blr",
        zone="koramangala",
        start_at=datetime.utcnow() - timedelta(days=5),
        end_at=datetime.utcnow() + timedelta(days=2),
        waiting_period_hours=12,
        weekly_cap=1500.0,
        max_events_per_week=2,
        payout_multiplier=0.8,
    ),
    partner=PartnerBehaviorSignals(
        partner_id="partner-99",
        reliability_score=0.87,
        historical_claim_count=1,
        manual_review_ratio=0.1,
        active_device_count=1,
        payout_handle_age_days=120,
    ),
)

decision = engine.evaluate(context)
print(decision.decision, decision.payout_amount, decision.breakdown.explanations)
```

## Operational Notes

- Persist the graph edges in Redis/Postgres so the `InteractionGraph` can be reconstructed quickly inside API pods.
- Keep coefficients versioned; the default logistic model is deterministic for offline testing but can be replaced with a serialized model server.
- Emit `DecisionBreakdown` slices into analytics/observability for reviewer transparency and guardrail tuning.
