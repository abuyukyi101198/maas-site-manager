from dataclasses import dataclass
from datetime import timedelta
from functools import cached_property
from typing import override

from sqlalchemy.ext.asyncio import AsyncConnection
from temporalio.client import (
    Client as TemporalClient,
    Schedule,
    ScheduleActionStartWorkflow,
    ScheduleIntervalSpec,
    ScheduleOverlapPolicy,
    SchedulePolicy,
    ScheduleSpec,
)
from temporallib.client import Client, Options  # type: ignore
from temporallib.encryption import EncryptionOptions  # type: ignore

from msm.jwt import TokenAudience, TokenPurpose
from msm.service.base import Service
from msm.service.config import ConfigService
from msm.service.s3 import S3Params
from msm.service.settings import SettingsService
from msm.service.token import TokenService


@dataclass
class MsmApiWorkflowParams:
    msm_url: str
    msm_jwt: str


@dataclass
class SyncUpstreamSourceParams(MsmApiWorkflowParams):
    boot_source_id: int
    s3_params: S3Params


@dataclass
class RefreshUpstreamSourceParams(MsmApiWorkflowParams):
    boot_source_id: int


WORKER_TOKEN_DURATION = timedelta(days=365 * 5)


class TemporalService(Service):
    """Service for managing Temporal workflows and schedules.

    This service provides functionality to interact with Temporal workflows,
    including creating, managing, and scheduling workflows for upstream source
    synchronization and refresh operations.
    """

    SYNC_UPSTREAM_SOURCE_WF_NAME = "SyncUpstreamSource"
    REFRESH_UPSTREAM_SOURCE_WF_NAME = "RefreshUpstreamSource"

    def __init__(
        self,
        connection: AsyncConnection,
        config: ConfigService,
        tokens: TokenService,
        settings: SettingsService,
    ):
        super().__init__(connection)
        self.tokens = tokens
        self.config = config
        self.settings = settings

    @cached_property
    def options(self) -> Options:
        return Options(encryption=EncryptionOptions())

    async def get_client(self) -> TemporalClient:
        """Connect to Temporal client.

        Returns:
            TemporalClient: An authenticated Temporal client instance.
        """
        client: TemporalClient = await Client.connect(
            client_opt=self.options,
        )
        return client

    async def get_worker_credentials(self) -> tuple[str, str]:
        """Get service URL and worker token for authentication.

        Returns:
            tuple[str, str]: A tuple containing the service URL and worker token value.
        """
        service_url = await self.settings.get_service_url()
        _, tokens = await self.tokens.get(audience=[TokenAudience.WORKER])
        token = next(iter(tokens))
        return service_url, token.value

    async def schedule_create(
        self,
        scheduler_id: str,
        workflow: str,
        workflow_id: str,
        param: MsmApiWorkflowParams,
        interval: int,
    ) -> str:
        """Create a scheduled workflow.

        Args:
            scheduler_id: Unique identifier for the scheduler
            workflow: Name of the workflow to schedule
            workflow_id: Unique identifier for the workflow instance
            param: Parameters to pass to the workflow
            interval: Interval in minutes between workflow executions

        Returns:
            str: The ID of the created schedule handle
        """
        client = await self.get_client()

        hdl = await client.create_schedule(
            scheduler_id,
            Schedule(
                action=ScheduleActionStartWorkflow(
                    workflow,
                    param,
                    id=workflow_id,
                    task_queue=self.options.queue or "not-set",
                ),
                spec=ScheduleSpec(
                    intervals=[
                        ScheduleIntervalSpec(every=timedelta(minutes=interval))
                    ]
                ),
                policy=SchedulePolicy(
                    overlap=ScheduleOverlapPolicy.BUFFER_ONE,
                ),
            ),
        )
        return hdl.id

    async def schedule_cancel(self, scheduler_id: str) -> None:
        """Cancel a scheduled workflow.

        Args:
            scheduler_id: Unique identifier for the scheduler to cancel
        """
        client = await self.get_client()
        hdl = client.get_schedule_handle(scheduler_id)
        await hdl.delete()

    async def schedule_pause(
        self, scheduler_id: str, note: str | None = None
    ) -> None:
        """Pause a scheduled workflow.

        Args:
            scheduler_id: Unique identifier for the scheduler to pause
            note: Optional note explaining the reason for pausing
        """
        client = await self.get_client()
        hdl = client.get_schedule_handle(scheduler_id)
        await hdl.pause(note=note)

    async def schedule_resume(
        self, scheduler_id: str, note: str | None = None
    ) -> None:
        """Resume a paused scheduled workflow.

        Args:
            scheduler_id: Unique identifier for the scheduler to resume
            note: Optional note explaining the reason for resuming
        """
        client = await self.get_client()
        hdl = client.get_schedule_handle(scheduler_id)
        await hdl.unpause(note=note)

    async def schedule_fire(
        self, scheduler_id: str, force: bool = False
    ) -> None:
        """Fire a scheduled workflow immediately.

        Args:
            scheduler_id: Unique identifier for the scheduler to fire
            force: If True, cancel other running instances; if False, buffer the execution
        """
        client = await self.get_client()
        hdl = client.get_schedule_handle(scheduler_id)
        await hdl.trigger(
            overlap=ScheduleOverlapPolicy.CANCEL_OTHER if force else None
        )

    @override
    async def ensure(self) -> None:
        """Prepare Site Manager to schedule Temporal workflows."""
        await super().ensure()

        # Cancel all existing schedulers
        client = await self.get_client()
        async for schedule in await client.list_schedules():
            hdl = client.get_schedule_handle(schedule.id)
            await hdl.delete()

        # renew JWT credentials for the workers
        cnt, tokens = await self.tokens.get(audience=[TokenAudience.WORKER])
        if cnt:
            _ = await self.tokens.delete_many([t.id for t in tokens])

        config = await self.config.get()
        service_url = await self.settings.get_service_url()
        _ = await self.tokens.create(
            issuer=config.service_identifier,
            secret_key=config.token_secret_key,
            service_url=service_url,
            audience=TokenAudience.WORKER,
            purpose=TokenPurpose.ACCESS,
            duration=WORKER_TOKEN_DURATION,
        )
