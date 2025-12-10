# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
MSM CLI script for admin tasks.
"""

from msm.cmd.admin.create_user import CreateUserAction
from msm.cmd.admin.update_settings import UpdateSettingsAction
from msm.cmd.script import Script


class AdminScript(Script):
    """CLI script to manage MAAS Site Manager admin tasks."""

    name = "maas-site-manager"
    description = "MAAS Site Manager - management tool"

    actions = frozenset([CreateUserAction, UpdateSettingsAction])


# script entry point
script = AdminScript()
