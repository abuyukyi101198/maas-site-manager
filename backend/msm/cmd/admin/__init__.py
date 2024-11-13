from msm.cmd.admin.create_user import CreateUserAction
from msm.cmd.admin.update_settings import UpdateSettingsAction
from msm.cmd.script import Script


class AdminScript(Script):
    name = "maas-site-manager"
    description = "MAAS Site Manager - management tool"

    actions = frozenset([CreateUserAction, UpdateSettingsAction])


# script entry point
script = AdminScript()
