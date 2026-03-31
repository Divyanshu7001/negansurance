"""Payout orchestration models."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class PayoutStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    settled = "settled"
    failed = "failed"


class PayoutInstruction(BaseModel):
    claim_id: str
    payout_reference: str
    destination_handle: str
    amount: float
    status: PayoutStatus
    initiated_at: datetime
    settled_at: datetime | None = None
