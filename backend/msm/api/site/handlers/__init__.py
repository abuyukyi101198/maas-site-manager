from fastapi import APIRouter

from . import enroll


def api_router() -> APIRouter:
    """Return a router for API routes."""
    router = APIRouter()
    router.include_router(enroll.v1_router)
    return router
