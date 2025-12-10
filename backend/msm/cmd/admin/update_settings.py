# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Action to update settings in the database.
"""

from argparse import (
    ArgumentParser,
    Namespace,
)

from msm.apiserver.db.models.settings import SettingsUpdate
from msm.apiserver.service import SettingsService
from msm.cmd import (
    DatabaseAction,
)


class UpdateSettingsAction(DatabaseAction):
    """Action to update settings in the database."""

    name = "update-settings"
    description = "Update settings"

    def register_options(self, parser: ArgumentParser) -> None:
        """Register settings that can be updated."""
        parser.add_argument(
            "--service_url",
            help="The base URL for the API.",
            required=False,
            type=str,
            default=None,
        )

        parser.add_argument(
            "--token_lifetime_minutes",
            help="Lifetime of access tokens in minutes.",
            required=False,
            type=int,
            default=None,
        )

        parser.add_argument(
            "--token_rotation_interval_minutes",
            help="Interval for rotating access tokens in minutes.",
            required=False,
            type=int,
            default=None,
        )

        parser.add_argument(
            "--max_image_upload_size_gb",
            help="Maximum file size for custom image uploads, in GB",
            required=False,
            type=int,
            default=None,
        )

    async def aexecute(self, options: Namespace) -> int:
        """Update settings in the database."""
        await self._update_setting(
            SettingsUpdate(**(dict(options._get_kwargs())))
        )
        return 0

    async def _update_setting(self, request: SettingsUpdate) -> None:
        """Update settings in the database within a transaction."""
        async with self.database_connection() as conn:
            settings = SettingsService(conn)
            await settings.update(request.model_dump(exclude_none=True))
