"""Async database utilities backed by asyncpg."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

import asyncpg

from . import get_settings


class Database:
    """Lightweight async wrapper around an asyncpg connection pool."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        if self._pool is None:
            await create_database_if_not_exists(self._dsn)
            self._pool = await asyncpg.create_pool(
                dsn=self._dsn,
                min_size=1,
                max_size=10
            )
            await ensure_schema(self)

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
        print(
            f"Initializing database connection with DSN: {settings.database_url}")
        _database = Database(settings.database_url)
    return _database


async def create_database_if_not_exists(dsn: str):
    parsed = urlparse(dsn)

    db_name = parsed.path.lstrip("/")

    # connect to default postgres DB
    default_dsn = f"{parsed.scheme}://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port}/postgres"

    conn = await asyncpg.connect(default_dsn)

    exists = await conn.fetchval(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        db_name
    )

    if not exists:
        await conn.execute(f'CREATE DATABASE "{db_name}"')
        print(f"✅ Database '{db_name}' created")

    await conn.close()


async def ensure_schema(database: Database) -> None:
    """Create required tables if they do not already exist."""

    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id serial PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone_number TEXT NOT NULL UNIQUE,
            operating_city TEXT NOT NULL,
            average_duty_hours_per_week NUMERIC NOT NULL,
            average_weekly_earnings NUMERIC NOT NULL,
            partner_name TEXT NOT NULL,
            partner_platform_id TEXT NOT NULL,
            is_kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )

    "Have to set the end_date as start_date + 7days before sending in this table to insert"
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS policies (
            policy_id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            partner_name TEXT NOT NULL,
            partner_id TEXT NOT NULL,
            plan TEXT NOT NULL,
            city TEXT NOT NULL,
            premium NUMERIC NOT NULL,
            max_weekly_payout NUMERIC NOT NULL,
            starts_at TIMESTAMPTZ NOT NULL,
            ends_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )

    await database.execute(
        "CREATE INDEX IF NOT EXISTS idx_policies_partner ON policies (partner_id)"
    )
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS claims (
            claim_id TEXT PRIMARY KEY,
            policy_id TEXT NOT NULL,
            partner_id TEXT NOT NULL,
            status TEXT NOT NULL,
            payout_amount NUMERIC NOT NULL,
            decision_payload JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )
        """
    )
    await database.execute(
        "CREATE INDEX IF NOT EXISTS idx_claims_partner ON claims (partner_id)"
    )
