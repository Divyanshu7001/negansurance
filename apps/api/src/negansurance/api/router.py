"""Aggregate API router factory."""

from __future__ import annotations

from fastapi import APIRouter

from .routes import claims, health, identity, payouts, policies, triggers, users


def build_api_router() -> APIRouter:
    router = APIRouter()
    router.include_router(health.router)
    router.include_router(policies.router)
    router.include_router(claims.router)
    router.include_router(triggers.router)
    router.include_router(identity.router)
    router.include_router(payouts.router)
    router.include_router(users.router)
    return router
