from asyncio import gather
from datetime import timedelta

from temporalio import workflow

from msm.common.workflows.sync import (
    DELETE_ITEMS_WF_NAME,
    DeleteItemsParams,
)
import msm.temporal.activities as act

S3_TIMEOUT = timedelta(seconds=15)


@workflow.defn(name=DELETE_ITEMS_WF_NAME, sandboxed=False)
class DeleteItemsWorkflow:
    """Delete Items from S3 storage."""

    @workflow.run
    async def run(self, params: DeleteItemsParams) -> None:
        hdls = [
            workflow.execute_activity(
                act.DELETE_ITEM_ACTIVITY,
                act.DeleteItemParams(
                    s3_params=params.s3_params,
                    boot_asset_item_id=id,
                ),
                start_to_close_timeout=S3_TIMEOUT,
            )
            for id in params.item_ids
        ]
        await gather(*hdls)
