from argparse import Namespace

import pytest

from msm.cmd.admin import script
from msm.password import verify_password

from ..fixtures.factory import Factory


@pytest.mark.usefixtures("settings_environ", "db")
class TestAdmin:
    async def test_create_user(self, factory: Factory) -> None:
        action = script._actions["create-user"]
        await action.aexecute(
            Namespace(
                username="admin",
                email="admin@example.net",
                full_name="An Administrator",
                password="secret",
                admin=True,
            )
        )
        [user] = await factory.get("user")
        assert user["username"] == "admin"
        assert user["email"] == "admin@example.net"
        assert user["full_name"] == "An Administrator"
        assert user["is_admin"]
        assert verify_password("secret", user["password"])

    @pytest.mark.parametrize(
        "attr,value",
        [
            ("username", "admin"),
            ("email", "admin@example.net"),
        ],
    )
    async def test_create_user_exists(
        self,
        capsys: pytest.CaptureFixture[str],
        factory: Factory,
        attr: str,
        value: str,
    ) -> None:
        await factory.make_User(**{attr: value})  # type: ignore[arg-type]
        await factory.conn.commit()
        action = script._actions["create-user"]
        with pytest.raises(SystemExit) as error:
            await action.aexecute(
                Namespace(
                    username="admin",
                    email="admin@example.net",
                    full_name="An Administrator",
                    password="secret",
                    admin=True,
                )
            )
        assert error.value.code == 1
        _, err = capsys.readouterr()
        assert err == "User with specified username/email already exists.\n"
