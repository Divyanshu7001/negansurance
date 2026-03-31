"""Identity and KYC models."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class VerificationStatus(str, Enum):
    approved = "approved"
    rejected = "rejected"
    pending = "pending"


class KYCRequest(BaseModel):
    partner_id: str
    full_name: str
    government_id: str
    payout_handle: str
    consent_version: str
    documents: list[str] = Field(default_factory=list)


class KYCResponse(BaseModel):
    partner_id: str
    status: VerificationStatus
    risk_flags: list[str] = Field(default_factory=list)
    reviewed_at: datetime
