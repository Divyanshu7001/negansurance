"""Payout status endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ...core.security import enforce_security_headers
from ...domain import PayoutInstruction
from ...services import PayoutService
from ..deps import get_payout_service

router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.get("/{claim_id}", response_model=PayoutInstruction)
async def get_payout(
    claim_id: str,
    payout_service: PayoutService = Depends(get_payout_service),
    _: None = Depends(enforce_security_headers),
) -> PayoutInstruction:
    payout = payout_service.get(claim_id)
    if not payout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payout not found")
    return payout
