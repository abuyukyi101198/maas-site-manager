from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from activities.download_upstream_activities import (  # type: ignore
        DOWNLOAD_ASSET_ACTIVITY,
        UPDATE_BYTES_SYNCED_ACTIVITY,
        DownloadAssetParams,
        DownloadUpstreamImageParams,
        UpdateBytesSyncedParams,
    )

DOWNLOAD_UPSTREAM_IMAGE_WF_NAME = "DownloadUpstreamImage"


@workflow.defn(name=DOWNLOAD_UPSTREAM_IMAGE_WF_NAME)
class DownloadUpstreamImage:
    @workflow.run
    async def run(self, params: DownloadUpstreamImageParams) -> bool:
        bytes_synced = await workflow.execute_activity(
            DOWNLOAD_ASSET_ACTIVITY,
            DownloadAssetParams(
                ss_url=params.ss_url,
                boot_asset_item_id=params.boot_asset_item_id,
                s3_params=params.s3_params,
            ),
            start_to_close_timeout=timedelta(hours=2),
        )
        result = await workflow.execute_activity(
            UPDATE_BYTES_SYNCED_ACTIVITY,
            UpdateBytesSyncedParams(
                msm_url=params.msm_url,
                msm_jwt=params.msm_jwt,
                bytes_synced=bytes_synced,
            ),
            start_to_close_timeout=timedelta(minutes=1),
        )
        # mypy doesn't let you do `return x == y  # type: ignore`
        if result == 200:
            return True
        return False
