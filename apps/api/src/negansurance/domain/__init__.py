"""Domain models shared across API modules."""

from .claim import (
    ClaimDecision,
    ClaimDecisionBreakdown,
    ClaimDecisionStatus,
    ClaimSubmission,
    ClaimSummary,
    ClaimUserInfo,
)
from .identity import KYCRequest, KYCResponse, VerificationStatus
from .payout import PayoutInstruction, PayoutStatus
from .policy import (
    CoveragePlan,
    Policy,
    PolicyCreateRequest,
    PolicyStatus,
    PremiumAdjustment,
    PremiumQuote,
    PremiumQuoteRequest,
)
from .trigger import TriggerEvent, TriggerType

__all__ = [
    "CoveragePlan",
    "Policy",
    "PolicyCreateRequest",
    "PolicyStatus",
    "PremiumAdjustment",
    "VerificationStatus",
    "PremiumQuote",
    "PremiumQuoteRequest",
    "ClaimSubmission",
    "ClaimDecision",
    "ClaimDecisionStatus",
    "ClaimDecisionBreakdown",
    "ClaimSummary",
    "ClaimUserInfo",
    "TriggerEvent",
    "TriggerType",
    "PayoutInstruction",
    "PayoutStatus",
    "KYCRequest",
    "KYCResponse",
]
