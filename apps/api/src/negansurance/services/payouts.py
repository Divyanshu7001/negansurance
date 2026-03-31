"""Payout orchestration stub service."""

from __future__ import annotations

from datetime import datetime
from typing import Dict

from ..domain import ClaimDecision, ClaimDecisionStatus, PayoutInstruction, PayoutStatus


class PayoutService:
    def __init__(self) -> None:
        self._payouts: Dict[str, PayoutInstruction] = {}

    def enqueue(self, decision: ClaimDecision, destination_handle: str) -> PayoutInstruction:
        status = (
            PayoutStatus.settled
            if decision.status == ClaimDecisionStatus.approved
            else PayoutStatus.failed
        )
        instruction = PayoutInstruction(
            claim_id=decision.claim_id,
            payout_reference=f"PYT-{decision.claim_id[-6:]}",
            destination_handle=destination_handle,
            amount=decision.payout_amount,
            status=status,
            initiated_at=datetime.utcnow(),
            settled_at=datetime.utcnow() if status == PayoutStatus.settled else None,
        )
        self._payouts[decision.claim_id] = instruction
        return instruction

    def get(self, claim_id: str) -> PayoutInstruction | None:
        return self._payouts.get(claim_id)
