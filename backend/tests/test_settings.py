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
