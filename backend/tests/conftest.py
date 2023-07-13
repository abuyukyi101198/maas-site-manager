import pytest

from .fixtures.db import (
    db,
    db_connection,
    db_setup,
    fixture,
)

__all__ = [
    "db",
    "db_connection",
    "db_setup",
    "fixture",
]


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--sqlalchemy-debug",
        help="print out SQLALchemy queries",
        action="store_true",
    )
