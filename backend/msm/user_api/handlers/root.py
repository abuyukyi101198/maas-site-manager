from fastapi import Request
from pydantic import BaseModel


class RootGetResponse(BaseModel):
    """Root handler response."""

    version: str


async def get(request: Request) -> RootGetResponse:
    """Root endpoint."""
    return RootGetResponse(version=request.app.version)
