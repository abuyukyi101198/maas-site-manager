from msm.cmd.sampledata.fixtures import DeleteFixturesAction, FixturesAction
from msm.cmd.script import Script


class SampledataScript(Script):
    name = "maas-site-manager-sampledata"
    description = "Generate and purge sample data for MAAS Site Manager"

    actions = frozenset([FixturesAction, DeleteFixturesAction])


# script entry point
script = SampledataScript()
