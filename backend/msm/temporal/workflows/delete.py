# Copyright 2025 Canonical Ltd.
# See LICENSE file for licensing details.
"""
Workflows for removing images from storage.
"""

from asyncio import gather
from datetime import timedelta

from pydantic import AwareDatetime
from temporalio import workflow

from msm.common.workflows.sync import (
    DELETE_ITEMS_WF_NAME,
    REMOVE_STALE_IMAGES_WF_NAME,
    DeleteItemsParams,
    RemoveStaleImagesParams,
)
import msm.temporal.activities as act

S3_TIMEOUT = timedelta(seconds=15)
MSM_API_TIMEOUT = timedelta(minutes=2)


@workflow.defn(name=DELETE_ITEMS_WF_NAME, sandboxed=False)
class DeleteItemsWorkflow:
    """Efficient bulk deletion workflow for removing multiple boot asset items from S3.

    This workflow provides parallel deletion capabilities for multiple boot asset items
    stored in S3. It's optimized for performance by executing all deletion operations
    concurrently while maintaining proper error handling and completion tracking.
    """

    @workflow.run
    async def run(self, params: DeleteItemsParams) -> None:
        """Execute bulk deletion of boot asset items from S3 storage.

        Args:
            params: Deletion parameters containing S3 configuration and list of
                   boot asset item IDs to delete.
        """
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


@workflow.defn(name=REMOVE_STALE_IMAGES_WF_NAME, sandboxed=False)
class RemoveStaleImagesWorkflow:
    """Intelligent cleanup workflow for removing obsolete boot asset versions.

    This workflow implements sophisticated version lifecycle management by identifying
    and removing asset versions that are no longer needed based on multiple criteria:

    1. **Upstream Removal**: Versions no longer available in the upstream source
    2. **Retention Policy**: Excess versions beyond the configured retention limit
    3. **Completion Status**: Only removes complete versions to maintain availability

    The workflow coordinates between MSM metadata cleanup and S3 storage cleanup
    to ensure consistent state across all system components.
    """

    @workflow.run
    async def run(self, params: RemoveStaleImagesParams) -> None:
        """Execute intelligent cleanup of stale boot asset versions.

        Args:
            params: Cleanup parameters including MSM API details, boot source ID,
                   and retention policy configuration.
        """
        versions: act.GetSourceVersionsResult = (
            await workflow.execute_activity(
                act.GET_SOURCE_VERSIONS_ACTIVITY,
                act.GetSourceVersionsParams(
                    msm_base_url=params.msm_url,
                    msm_jwt=params.msm_jwt,
                    boot_source_id=params.boot_source_id,
                ),
                result_type=act.GetSourceVersionsResult,
                start_to_close_timeout=MSM_API_TIMEOUT,
            )
        )
        last_sync: AwareDatetime = await workflow.execute_activity(
            act.GET_SOURCE_LAST_SYNC_ACTIVITY,
            act.GetSourceLastSyncParams(
                msm_base_url=params.msm_url,
                msm_jwt=params.msm_jwt,
                boot_source_id=params.boot_source_id,
            ),
            result_type=AwareDatetime,
            start_to_close_timeout=MSM_API_TIMEOUT,
        )
        await workflow.execute_activity(
            act.REMOVE_STALE_VERSIONS_ACTIVITY,
            act.RemoveStaleVersionsParams(
                msm_base_url=params.msm_url,
                msm_jwt=params.msm_jwt,
                versions=versions.versions,
                versions_to_keep=params.versions_to_keep,
                source_last_sync=last_sync,
            ),
            start_to_close_timeout=MSM_API_TIMEOUT,
        )
