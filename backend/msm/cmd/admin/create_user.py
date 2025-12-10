# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Action to create a user.
"""

from argparse import (
    ArgumentParser,
    Namespace,
)

from msm.apiserver.db.models import UserCreate
from msm.apiserver.service import UserService
from msm.cmd import (
    DatabaseAction,
    do_exit,
)


class CreateUserAction(DatabaseAction):
    """Action to create a user."""

    name = "create-user"
    description = "Create a user"

    def register_options(self, parser: ArgumentParser) -> None:
        """Register user parameters."""
        parser.add_argument(
            "username",
            help="Username for the new user",
        )
        parser.add_argument(
            "email",
            help="User e-mail",
        )
        parser.add_argument(
            "password",
            help="User password",
        )
        parser.add_argument(
            "full_name",
            help="Full name",
            default="",
            nargs="?",
        )
        parser.add_argument(
            "--admin",
            help="Make the user an admin",
            action="store_true",
            default=False,
        )

    async def aexecute(self, options: Namespace) -> int:
        """Create a user in the database."""
        await self._create_user(
            options.username,
            options.email,
            options.full_name,
            options.password,
            options.admin,
        )
        return 0

    async def _create_user(
        self,
        username: str,
        email: str,
        full_name: str,
        password: str,
        admin: bool,
    ) -> None:
        """Create a user in the database within a transaction."""
        async with self.database_connection() as conn:
            users = UserService(conn)
            if await users.exists(email=email, username=username):
                do_exit(
                    "User with specified username/email already exists.",
                    code=1,
                )

            await users.create(
                UserCreate(
                    username=username,
                    email=email,
                    full_name=full_name,
                    password=password,
                    is_admin=admin,
                )
            )
