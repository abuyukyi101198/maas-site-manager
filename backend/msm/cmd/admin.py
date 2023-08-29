import argparse
import asyncio
from contextlib import (
    aclosing,
    asynccontextmanager,
)
import sys
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncConnection

from ..db import Database
from ..db.models import UserCreate
from ..service import UserService
from ..settings import Settings


def run(cmdline: list[str] | None = None) -> None:
    asyncio.run(_run(cmdline=cmdline))


async def _run(cmdline: list[str] | None) -> None:
    args = _parse_args(cmdline)
    actions = {
        "create-user": _create_user,
    }
    action_args = dict(args._get_kwargs())
    action_args.pop("action")
    await actions[args.action](**action_args)


def _parse_args(args: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="MAAS Site Manager - management tool",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    subparsers = parser.add_subparsers(
        metavar="ACTION",
        dest="action",
        help="action to perform",
    )
    subparsers.required = True

    # actions
    create_user = subparsers.add_parser(
        "create-user",
        help="Create a user",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    create_user.add_argument(
        "username",
        help="Username for the new user",
    )
    create_user.add_argument(
        "email",
        help="User e-mail",
    )
    create_user.add_argument(
        "full_name",
        help="Full name",
    )
    create_user.add_argument(
        "password",
        help="User password",
    )
    create_user.add_argument(
        "--admin",
        help="Make the user an admin",
        action="store_true",
        default=False,
    )
    return parser.parse_args(args)


def _exit_error(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


async def _create_user(
    username: str, email: str, full_name: str, password: str, admin: bool
) -> None:
    async with _database_connection() as conn:
        users = UserService(conn)
        if await users.exists(email=email, username=username):
            _exit_error("User with specified username/email already exists.")

        await users.create(
            UserCreate(
                username=username,
                email=email,
                full_name=full_name,
                password=password,
                is_admin=admin,
            )
        )


@asynccontextmanager
async def _database_connection() -> AsyncIterator[AsyncConnection]:
    settings = Settings()
    db = Database(settings.db_dsn)
    async with aclosing(db), db.transaction() as conn:
        yield conn
