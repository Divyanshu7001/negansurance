"""Identity + KYC endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ...core.security import enforce_security_headers
from ...domain import KYCRequest, KYCResponse
from ...services import IdentityService
from ..deps import get_identity_service

router = APIRouter(prefix="/identity", tags=["identity"])


@router.post("/kyc", response_model=KYCResponse)
async def verify_identity(
    payload: KYCRequest,
    identity_service: IdentityService = Depends(get_identity_service),
    _: None = Depends(enforce_security_headers),
) -> KYCResponse:
    return identity_service.verify(payload)
