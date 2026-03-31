"""Identity verification service."""

from __future__ import annotations

from datetime import datetime

from ..domain import KYCRequest, KYCResponse, VerificationStatus


class IdentityService:
    def verify(self, payload: KYCRequest) -> KYCResponse:
        risk_flags: list[str] = []
        status = VerificationStatus.approved

        if payload.payout_handle.endswith("9999"):
            status = VerificationStatus.pending
            risk_flags.append("manual_review_required")

        if len(payload.government_id) < 6:
            status = VerificationStatus.rejected
            risk_flags.append("invalid_document")

        return KYCResponse(
            partner_id=payload.partner_id,
            status=status,
            risk_flags=risk_flags,
            reviewed_at=datetime.utcnow(),
        )
