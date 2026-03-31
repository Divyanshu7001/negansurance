"""Policy and premium endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ...core.security import enforce_security_headers
from ...domain import Policy, PolicyCreateRequest, PremiumQuote, PremiumQuoteRequest
from ...services import PolicyService, RiskPricingService
from ..deps import get_policy_service, get_risk_pricing_service

router = APIRouter(prefix="/policies", tags=["policies"])


@router.post(
    "/quote",
    response_model=PremiumQuote,
    status_code=status.HTTP_200_OK,
)
async def generate_quote(
    payload: PremiumQuoteRequest,
    service: RiskPricingService = Depends(get_risk_pricing_service),
    _: None = Depends(enforce_security_headers),
) -> PremiumQuote:
    return service.generate_quote(payload)


@router.post("", response_model=Policy, status_code=status.HTTP_201_CREATED)
async def create_policy(
    payload: PolicyCreateRequest,
    policy_service: PolicyService = Depends(get_policy_service),
    _: None = Depends(enforce_security_headers),
) -> Policy:
    policy = await policy_service.create_policy(payload)
    return policy


@router.get("/{policy_id}", response_model=Policy)
async def get_policy(
    policy_id: str,
    policy_service: PolicyService = Depends(get_policy_service),
    _: None = Depends(enforce_security_headers),
) -> Policy:
    policy = await policy_service.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return policy
