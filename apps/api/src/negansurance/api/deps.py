"""Dependency injection helpers for FastAPI routes."""

from __future__ import annotations

from functools import lru_cache

from ..core import Settings, get_database, get_settings
from ..services import (
    ClaimDecisioningService,
    IdentityService,
    NotificationService,
    PolicyService,
    PayoutService,
    RiskPricingService,
    TriggerMonitoringService,
)


@lru_cache(maxsize=1)
def get_policy_service() -> PolicyService:
    return PolicyService(database=get_database())


@lru_cache(maxsize=1)
def get_risk_pricing_service() -> RiskPricingService:
    return RiskPricingService()


@lru_cache(maxsize=1)
def get_claim_decisioning_service() -> ClaimDecisioningService:
    return ClaimDecisioningService(
        policy_service=get_policy_service(),
        database=get_database(),
    )


@lru_cache(maxsize=1)
def get_trigger_service() -> TriggerMonitoringService:
    return TriggerMonitoringService()


@lru_cache(maxsize=1)
def get_payout_service() -> PayoutService:
    return PayoutService()


@lru_cache(maxsize=1)
def get_identity_service() -> IdentityService:
    return IdentityService()


@lru_cache(maxsize=1)
def get_notification_service() -> NotificationService:
    return NotificationService()


def get_app_settings() -> Settings:
    return get_settings()
