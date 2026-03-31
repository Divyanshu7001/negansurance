"""Async database utilities backed by asyncpg."""

from __future__ import annotations

from typing import Any

import asyncpg

from . import get_settings


class Database:
    """Lightweight async wrapper around an asyncpg connection pool."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(dsn=self._dsn, min_size=1, max_size=10)

    async def disconnect(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def execute(self, query: str, *args: Any) -> str:
        pool = self._require_pool()
        async with pool.acquire() as connection:
            return await connection.execute(query, *args)

    async def fetchrow(self, query: str, *args: Any) -> asyncpg.Record | None:
        pool = self._require_pool()
        async with pool.acquire() as connection:
            return await connection.fetchrow(query, *args)

    async def fetch(self, query: str, *args: Any) -> list[asyncpg.Record]:
        pool = self._require_pool()
        async with pool.acquire() as connection:
            records = await connection.fetch(query, *args)
            return list(records)

    def _require_pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database pool has not been initialized")
        return self._pool


_database: Database | None = None


def get_database() -> Database:
    global _database
    if _database is None:
        settings = get_settings()
        _database = Database(settings.database_url)
    return _database


async def ensure_schema(database: Database) -> None:
    """Create required tables if they do not already exist."""

    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS policies (
            policy_id TEXT PRIMARY KEY,
            partner_id TEXT NOT NULL,
            plan TEXT NOT NULL,
            city TEXT NOT NULL,
            zone TEXT NOT NULL,
            status TEXT NOT NULL,
            premium NUMERIC NOT NULL,
            max_weekly_payout NUMERIC NOT NULL,
            start_at TIMESTAMPTZ NOT NULL,
            end_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )
        """
    )
    await database.execute(
        "CREATE INDEX IF NOT EXISTS idx_policies_partner ON policies (partner_id)"
    )
