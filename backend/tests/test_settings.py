import pytest
from pytest_mock import MockerFixture

from msm.settings import (
    Settings,
    SnapSettingsSource,
)


class TestSettings:
    def test_from_environ(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("MSM_DB_USER", "myuser")
        monkeypatch.setenv("MSM_DB_NAME", "mydb")
        settings = Settings()
        assert settings.db_user == "myuser"
        assert settings.db_name == "mydb"

    def test_from_snap(self, mocker: MockerFixture) -> None:
        mocker.patch.object(
            SnapSettingsSource, "_get_snap_configs"
        ).return_value = {
            "db.user": "myuser",
            "db.name": "mydb",
        }
        settings = Settings()
        assert settings.db_user == "myuser"
        assert settings.db_name == "mydb"

    @pytest.mark.parametrize(
        "async_engine,engine",
        [(True, "postgresql+asyncpg"), (False, "postgresql+psycopg")],
    )
    def test_db_dsn(
        self, monkeypatch: pytest.MonkeyPatch, async_engine: bool, engine: str
    ) -> None:
        monkeypatch.setenv("MSM_DB_USER", "myuser")
        monkeypatch.setenv("MSM_DB_NAME", "mydb")
        settings = Settings()
        assert (
            str(settings.db_dsn(async_engine=async_engine))
            == f"{engine}://myuser@localhost:5432/mydb"
        )
