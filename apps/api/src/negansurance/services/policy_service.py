"""Policy lifecycle management."""

from __future__ import annotations

import uuid
from typing import Any

from ..core import Database
from ..domain import CoveragePlan, Policy, PolicyCreateRequest, PolicyStatus


class PolicyService:
    def __init__(self, database: Database) -> None:
        self._database = database

    async def create_policy(self, payload: PolicyCreateRequest) -> Policy:
        policy_id = f"POL-{uuid.uuid4().hex[:10].upper()}"
        policy = Policy.from_request(policy_id, payload)
        await self._database.execute(
            """
            INSERT INTO policies (
                policy_id,
                partner_id,
                plan,
                city,
                zone,
                status,
                premium,
                max_weekly_payout,
                start_at,
                end_at,
                created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            ON CONFLICT (policy_id) DO NOTHING
            """,
            policy.policy_id,
            policy.partner_id,
            policy.plan.value,
            policy.city,
            policy.zone,
            policy.status.value,
            policy.premium,
            policy.max_weekly_payout,
            policy.start_at,
            policy.end_at,
            policy.created_at,
        )
        return policy

    async def get_policy(self, policy_id: str) -> Policy | None:
        row = await self._database.fetchrow(
            "SELECT * FROM policies WHERE policy_id = $1",
            policy_id,
        )
        if row:
            return self._row_to_policy(row)
        return None

    async def list_policies_for_partner(self, partner_id: str) -> list[Policy]:
        rows = await self._database.fetch(
            "SELECT * FROM policies WHERE partner_id = $1 ORDER BY created_at DESC",
            partner_id,
        )
        return [self._row_to_policy(row) for row in rows]

    def _row_to_policy(self, row: Any) -> Policy:
        return Policy(
            policy_id=row["policy_id"],
            partner_id=row["partner_id"],
            plan=CoveragePlan(row["plan"]),
            city=row["city"],
            zone=row["zone"],
            status=PolicyStatus(row["status"]),
            premium=float(row["premium"]),
            max_weekly_payout=float(row["max_weekly_payout"]),
            start_at=row["start_at"],
            end_at=row["end_at"],
            created_at=row["created_at"],
        )
