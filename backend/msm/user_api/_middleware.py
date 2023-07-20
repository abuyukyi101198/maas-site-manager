from typing import (
    Awaitable,
    Callable,
)

from fastapi import (
    Request,
    Response,
)
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from ..db import Database


class TransactionMiddleware(BaseHTTPMiddleware):
    """Run a request in a transaction, handling commit/rollback.

    This makes the database connection available as `app.state.conn`.
    """

    def __init__(self, app: ASGIApp, db: Database):
        super().__init__(app)
        self.db = db

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        async with self.db.engine.connect() as conn:
            async with conn.begin():
                request.app.state.conn = conn
                response = await call_next(request)
        return response
