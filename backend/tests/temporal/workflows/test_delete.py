from datetime import timedelta
import uuid

import pytest
from temporalio import activity
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from msm.common.workflows.sync import (
    DeleteItemsParams,
    S3Params,
)
from msm.temporal.activities.images import (
    DELETE_ITEM_ACTIVITY,
    DeleteItemParams,
)
from msm.temporal.workflows import DeleteItemsWorkflow

TEST_WF_TIMEOUT = timedelta(seconds=30)


@pytest.fixture
def s3_params() -> S3Params:
    return S3Params(
        endpoint="https://radosgw.ceph.example.com",
        access_key="test-access",
        secret_key="test-secret",
        bucket="test-bucket",
        path="images/",
    )


@pytest.fixture
def wf_params(s3_params: S3Params) -> DeleteItemsParams:
    return DeleteItemsParams(
        s3_params=s3_params,
        item_ids=[1, 2, 3],
    )


class TestDeleteItemsWorkflow:
    @pytest.mark.asyncio
    async def test_delete_items(
        self,
        wf_params: DeleteItemsParams,
    ) -> None:
        item_ids = []

        @activity.defn(name=DELETE_ITEM_ACTIVITY)
        async def delete_item_activity(
            params: DeleteItemParams,
        ) -> None:
            nonlocal item_ids
            item_ids.append(params.boot_asset_item_id)
            return

        # Act
        async with await WorkflowEnvironment.start_time_skipping() as env:
            async with Worker(
                env.client,
                task_queue="msm-queue",
                debug_mode=True,
                workflows=[DeleteItemsWorkflow],
                activities=[
                    delete_item_activity,
                ],
            ) as worker:
                await env.client.execute_workflow(
                    DeleteItemsWorkflow.run,
                    wf_params,
                    id=f"workflow-{uuid.uuid4()}",
                    task_queue=worker.task_queue,
                    run_timeout=TEST_WF_TIMEOUT,
                )
        item_ids.sort()
        assert item_ids == wf_params.item_ids
