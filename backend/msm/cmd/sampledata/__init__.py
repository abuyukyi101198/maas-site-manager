# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
MSM CLI script for sample data generation and deletion.
"""

from msm.cmd.sampledata.fixtures import DeleteFixturesAction, FixturesAction
from msm.cmd.script import Script


class SampledataScript(Script):
    """CLI script to generate and purge sample data for MAAS Site Manager."""

    name = "maas-site-manager-sampledata"
    description = "Generate and purge sample data for MAAS Site Manager"

    actions = frozenset([FixturesAction, DeleteFixturesAction])


# script entry point
script = SampledataScript()
