"""Claim submission endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status

from ...core.security import enforce_security_headers
from ...domain import ClaimDecision, ClaimSubmission, PayoutInstruction
from ...services import ClaimDecisioningService, PayoutService
from ..deps import get_claim_decisioning_service, get_payout_service


class InitiatePayoutRequest(BaseModel):
    destination_handle: str = Field(min_length=4)


router = APIRouter(prefix="/claims", tags=["claims"])


@router.post("", response_model=ClaimDecision, status_code=status.HTTP_201_CREATED)
async def submit_claim(
    payload: ClaimSubmission,
    claim_service: ClaimDecisioningService = Depends(get_claim_decisioning_service),
    _: None = Depends(enforce_security_headers),
) -> ClaimDecision:
    try:
        decision = await claim_service.submit_claim(payload)
        return decision
    except ValueError as exc:  # pragma: no cover - placeholder
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/{claim_id}", response_model=ClaimDecision)
async def get_claim(
    claim_id: str,
    claim_service: ClaimDecisioningService = Depends(get_claim_decisioning_service),
    _: None = Depends(enforce_security_headers),
) -> ClaimDecision:
    decision = claim_service.get(claim_id)
    if not decision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
    return decision


@router.post("/{claim_id}/payouts", response_model=PayoutInstruction)
async def queue_payout(
    claim_id: str,
    payload: InitiatePayoutRequest,
    claim_service: ClaimDecisioningService = Depends(get_claim_decisioning_service),
    payout_service: PayoutService = Depends(get_payout_service),
    _: None = Depends(enforce_security_headers),
) -> PayoutInstruction:
    decision = claim_service.get(claim_id)
    if not decision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
    if decision.payout_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Claim has no payable amount",
        )
    return payout_service.enqueue(decision, payload.destination_handle)
