# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Base implementations for MSM Temporal activities.
"""

import ssl

from httpx import AsyncClient, Timeout

from msm import __version__


class BaseActivity:
    """Base class for MSM Temporal activities."""

    def __init__(self, user_agent: str | None = None) -> None:
        self.client = self._create_client(user_agent)

    def _create_client(self, user_agent: str | None = None) -> AsyncClient:
        """Create an HTTP client with appropriate settings.

        Args:
            user_agent: Custom user agent string. If None, defaults to
                       "maas-site-manager/{version}".

        Returns:
            Configured AsyncClient instance with SSL verification, timeout settings,
            and user agent header.
        """
        user_agent = user_agent or f"maas-site-manager/{__version__}"
        ctx = ssl.create_default_context(capath="/etc/ssl/certs/")
        return AsyncClient(
            trust_env=True,
            headers={"User-Agent": user_agent},
            verify=ctx,
            timeout=Timeout(60 * 60, read=120),
        )

    def _get_header(self, jwt: str) -> dict[str, str]:
        """Create authorization header with JWT token.

        Args:
            jwt: JWT token for authentication.

        Returns:
            Dictionary containing the Authorization header with bearer token.
        """
        return {"Authorization": f"bearer {jwt}"}


def compose_url(prefix: str, path: str) -> str:
    """Compose a URL from a prefix and path.

    Safely joins a URL prefix with a path, ensuring proper formatting by
    removing trailing slashes from the prefix.

    Args:
        prefix: Base URL prefix.
        path: Path to append to the prefix.

    Returns:
        Combined URL string.
    """
    return "/".join(
        [
            prefix.rstrip("/"),
            path.lstrip("/"),
        ]
    )


def get_selection_key(os: str, release: str, arch: str) -> str:
    """Get a selection key for OS, release, and architecture."""
    return f"{os}---{release}---{arch}"
