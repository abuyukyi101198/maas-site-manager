from typing import (
    AsyncIterable,
    Iterable,
)

from fastapi import FastAPI
from httpx import AsyncClient
import pytest

from msm.db import Database
from msm.user_api import create_app


@pytest.fixture
def user_app(
    request: pytest.FixtureRequest, db: Database
) -> Iterable[FastAPI]:
    """The API for users."""
    app = create_app(db.dsn)
    app.state.db._engine.echo = request.config.getoption("sqlalchemy_debug")
    yield app


@pytest.fixture
async def user_app_client(user_app: FastAPI) -> AsyncIterable[AsyncClient]:
    """Client for the user API."""
    async with AsyncClient(app=user_app, base_url="http://test") as client:
        yield client
