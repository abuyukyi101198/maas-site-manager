from typing import Iterator

import pytest

from .db import DBConfig


@pytest.fixture
def settings_environ(
    monkeypatch: pytest.MonkeyPatch, db_setup: DBConfig
) -> Iterator[dict[str, str]]:
    """Set and return environment variables for application settings."""
    environ = db_setup.settings_environ
    for key, value in environ.items():
        monkeypatch.setenv(key, value)
    yield environ
