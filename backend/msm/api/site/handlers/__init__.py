from fastapi import APIRouter

from . import (
    enroll,
    report,
)


def api_router() -> APIRouter:
    """Return a router for API routes."""
    router = APIRouter()
    for r in (
        enroll.v1_router,
        report.v1_router,
    ):
        router.include_router(r)
    return router
