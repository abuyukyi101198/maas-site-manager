from contextlib import asynccontextmanager
from typing import (
    Any,
    AsyncGenerator,
    Callable,
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import handlers
from .. import PACKAGE
from ..db import Database
from ..settings import SETTINGS


def create_app(database: Database | None = None) -> FastAPI:
    """Create the FastAPI WSGI application."""
    db = database or Database(str(SETTINGS.db_dsn))

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
        await db.ensure_schema()
        yield
        await db.engine.dispose()

    app = FastAPI(
        title="MAAS Site Manager",
        name=PACKAGE.name,
        version=PACKAGE.version,
        lifespan=lifespan,
    )
    app.state.db = db
    app.add_middleware(
        CORSMiddleware,
        allow_origins=SETTINGS.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def route(
        path: str,
        methods: list[str],
        handler: Callable[..., Any],
        **kwargs: Any,
    ) -> None:
        app.router.add_api_route(path, handler, methods=methods, **kwargs)

    route("/", ["GET"], handlers.root.get)
    route("/login", ["POST"], handlers.login.post)
    route("/requests", ["GET"], handlers.sites.pending_get)
    route("/requests", ["POST"], handlers.sites.pending_post, status_code=204)
    route("/sites", ["GET"], handlers.sites.get)
    route("/sites/{site_id}", ["GET"], handlers.sites.get_id)
    route("/tokens", ["GET"], handlers.tokens.get)
    route("/tokens", ["POST"], handlers.tokens.post)
    route("/tokens/export", ["GET"], handlers.tokens.export_get)
    route("/users/me", ["GET"], handlers.users.me_get)
    route("/users/me", ["PATCH"], handlers.users.me_patch)
    route("/users/me/password", ["PATCH"], handlers.users.password_patch)
    route("/users", ["GET"], handlers.users.get)
    route("/users", ["POST"], handlers.users.post)
    route("/users/{user_id}", ["GET"], handlers.users.get_id)
    route("/users/{user_id}", ["PATCH"], handlers.users.patch)
    route(
        "/users/{user_id}", ["DELETE"], handlers.users.delete, status_code=204
    )
    return app
