from snaphelpers import Snap


def configure_hook(snap: Snap) -> None:
    """The `configure` hook called by the snap."""
    snap.services.restart()
