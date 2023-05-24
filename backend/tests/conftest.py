import pytest

from .fixtures.app import (
    authenticated_user_app_client,
    user_app,
    user_app_client,
)
from .fixtures.db import (
    db,
    db_setup,
    fixture,
    session,
)

__all__ = [
    "authenticated_user_app_client",
    "db",
    "db_setup",
    "fixture",
    "session",
    "user_app",
    "user_app_client",
]


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--sqlalchemy-debug",
        help="print out SQLALchemy queries",
        action="store_true",
    )
