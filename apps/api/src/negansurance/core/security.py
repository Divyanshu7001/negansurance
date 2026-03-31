"""Security helpers: API key validation and lightweight rate limiting."""

from __future__ import annotations

import time
from collections import deque
from typing import Deque, Dict

from functools import lru_cache

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader

from .config import Settings, get_settings

api_key_scheme = APIKeyHeader(name="X-API-Key", auto_error=False)


class RateLimiter:
    """Very small in-memory sliding-window rate limiter per client."""

    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = {}

    def check(self, client_id: str) -> None:
        now = time.monotonic()
        window_start = now - self.window_seconds
        bucket = self._hits.setdefault(client_id, deque())

        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
            )

        bucket.append(now)


@lru_cache(maxsize=4)
def _limiter_for(limit: int) -> RateLimiter:
    return RateLimiter(limit=limit, window_seconds=60)


async def enforce_security_headers(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> None:
    """Validate API key and apply rate limiting per client IP."""

    api_key = await api_key_scheme(request)
    if settings.api_key and api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    client_id = request.client.host if request.client else "anonymous"
    limiter = _limiter_for(settings.rate_limit_per_minute)
    limiter.check(client_id)
