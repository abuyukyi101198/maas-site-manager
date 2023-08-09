from pathlib import Path

from snaphelpers import Snap

from msm.settings import Settings

from ._config import NginxConfig


def configure_hook(snap: Snap) -> None:
    """The `configure` hook called by the snap."""
    _generate_config(snap)
    snap.services.restart()


def _generate_config(snap: Snap) -> None:
    settings = Settings()
    nginx_config = NginxConfig(
        base_dir=snap.paths.snap,
        data_dir=snap.paths.data,
        port=settings.user_api_port,
        user_api_socket=Path(settings.user_api_socket),
    )
    nginx_config.write(snap.paths.data / "nginx.conf")
