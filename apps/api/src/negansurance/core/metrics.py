"""Prometheus metrics primitives."""

from __future__ import annotations

from typing import Optional

from fastapi import Request, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    Counter,
    Histogram,
    generate_latest,
)

registry = CollectorRegistry()

http_requests_total = Counter(
    "negansurance_http_requests_total",
    "Number of HTTP requests processed",
    labelnames=("method", "path", "status"),
    registry=registry,
)

http_request_latency_ms = Histogram(
    "negansurance_http_request_latency_ms",
    "Request latency in milliseconds",
    labelnames=("method", "path"),
    registry=registry,
)


def observe_request(method: str, path: str, status_code: int, duration_ms: float) -> None:
    http_requests_total.labels(method, path, str(status_code)).inc()
    http_request_latency_ms.labels(method, path).observe(duration_ms)


async def metrics_endpoint(_: Optional[Request] = None) -> Response:
    return Response(generate_latest(registry), media_type=CONTENT_TYPE_LATEST)
