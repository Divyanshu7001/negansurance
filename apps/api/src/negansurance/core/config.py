"""Application configuration primitives."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import List

from pydantic import BaseModel, Field
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseModel):
    """Runtime configuration with sane defaults for local development."""

    project_name: str = Field(default="Negansurance API")
    environment: str = Field(default="local")
    version: str = Field(default="0.1.0")
    api_prefix: str = Field(default="/api/v1")
    documentation_url: str = Field(default="/docs")
    redoc_url: str = Field(default="/redoc")
    openapi_url: str = Field(default="/openapi.json")
    request_id_header: str = Field(default="X-Request-ID")
    cors_origins: List[str] = Field(default_factory=list)
    allowed_hosts: List[str] = Field(default_factory=lambda: ["*"])
    default_region: str = Field(default="india-central")
    api_key: str = Field(default="local-dev-key")
    rate_limit_per_minute: int = Field(default=120)
    metrics_namespace: str = Field(default="negansurance_api")
    enable_https_redirect: bool = Field(default=False)
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/postgres"
    )

    class Config:
        frozen = True


def _read_list(value: str | None) -> List[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _determine_database_url() -> str:
    direct = os.getenv("DATABASE_URL")
    print(f"Direct DATABASE_URL from env: {direct}")
    if direct:
        return direct

    supabase_password = os.getenv("SUPABASE_PASSWORD")
    if supabase_password:
        template = os.getenv(
            "SUPABASE_DB_TEMPLATE",
            "postgresql://postgres:{password}@db.nafuwfitrqrlcleuppjv.supabase.co:5432/postgres",
        )
        return template.format(password=supabase_password)

    # for local setup
    # return "postgresql://{user_name}:{password}@localhost:5432/{database_name}"
    return "postgresql://priyanshoon:postgres@localhost:5432/negansurance"


def load_settings() -> Settings:
    """Load settings from environment variables with defaults."""

    return Settings(
        project_name=os.getenv("PROJECT_NAME", "Negansurance API"),
        environment=os.getenv("ENVIRONMENT", "local"),
        version=os.getenv("API_VERSION", "0.1.0"),
        api_prefix=os.getenv("API_PREFIX", "/api/v1"),
        documentation_url=os.getenv("DOCUMENTATION_URL", "/docs"),
        redoc_url=os.getenv("REDOC_URL", "/redoc"),
        openapi_url=os.getenv("OPENAPI_URL", "/openapi.json"),
        request_id_header=os.getenv("REQUEST_ID_HEADER", "X-Request-ID"),
        cors_origins=_read_list(os.getenv("CORS_ORIGINS")),
        allowed_hosts=_read_list(os.getenv("ALLOWED_HOSTS")) or ["*"],
        default_region=os.getenv("DEFAULT_REGION", "india-central"),
        api_key=os.getenv("NEGANSURANCE_API_KEY", "local-dev-key"),
        rate_limit_per_minute=int(os.getenv("RATE_LIMIT_PER_MIN", "120")),
        metrics_namespace=os.getenv("METRICS_NAMESPACE", "negansurance_api"),
        enable_https_redirect=os.getenv("ENABLE_HTTPS_REDIRECT", "0") == "1",
        database_url=_determine_database_url(),
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached accessor so dependency injection reuses the same settings instance."""

    return load_settings()
