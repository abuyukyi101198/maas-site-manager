from dataclasses import dataclass
from datetime import timedelta

from activities.images import S3Params, compose_url  # type: ignore
from activities.simplestream import (  # type: ignore
    FETCH_SS_ASSETS_ACTIVITY,
    FETCH_SS_INDEXES,
    GET_BOOT_SOURCE_ACTIVITY,
    LOAD_PRODUCT_MAP_ACTIVITY,
    PATCH_AVAILABLE_ASSETS_ACTIVITY,
    FetchAssetListParams,
    FetchAssetListResult,
    FetchSsIndexesParams,
    FetchSsIndexesResult,
    GetBootSourceParams,
    GetBootSourceResult,
    LoadProductMapParams,
    LoadProductMapResult,
    PatchAssetListParams,
)
from management.objectstore import MSMImageStore  # type: ignore
from temporalio import workflow

SYNC_UPSTREAM_SOURCE_WF_NAME = "SyncUpstreamSource"
REFRESH_UPSTREAM_SOURCE_WF_NAME = "RefreshUpstreamSource"

SS_DOWNLOAD_TIMEOUT = timedelta(minutes=5)


@dataclass
class SyncUpstreamSourceParams:
    msm_url: str
    msm_jwt: str
    boot_source_id: int
    s3_params: S3Params


@dataclass
class RefreshUpstreamSourceParams:
    msm_url: str
    msm_jwt: str
    boot_source_id: int


@workflow.defn(name=SYNC_UPSTREAM_SOURCE_WF_NAME, sandboxed=False)
class SyncUpstreamSourceWorkflow:
    @workflow.run
    async def run(self, params: SyncUpstreamSourceParams) -> bool:
        # download the source data from API
        source = GetBootSourceResult.from_dict(
            await workflow.execute_activity(
                GET_BOOT_SOURCE_ACTIVITY,
                GetBootSourceParams(
                    msm_base_url=params.msm_url,
                    msm_jwt=params.msm_jwt,
                    boot_source_id=params.boot_source_id,
                ),
                start_to_close_timeout=timedelta(seconds=30),
            )
        )
        # download upstream Index file and extract the products indexes
        indexes = FetchSsIndexesResult.from_dict(
            await workflow.execute_activity(
                FETCH_SS_INDEXES,
                FetchSsIndexesParams(
                    index_url=source.index_url,
                    keyring=source.keyring,
                ),
                start_to_close_timeout=SS_DOWNLOAD_TIMEOUT,
            )
        )
        store = MSMImageStore(
            msm_base_url=params.msm_url,
            msm_jwt=params.msm_jwt,
            s3_params=params.s3_params,
        )

        for product_url in indexes.products:
            workflow.logger.info("Processing product URL: %s", product_url)

            product_items = LoadProductMapResult.from_dict(
                await workflow.execute_activity(
                    LOAD_PRODUCT_MAP_ACTIVITY,
                    LoadProductMapParams(
                        index_url=product_url,
                        selections=source.selections,
                        keyring=source.keyring,
                    ),
                    start_to_close_timeout=SS_DOWNLOAD_TIMEOUT,
                )
            )
            for item in product_items.items:
                workflow.logger.debug(
                    "Processing item: %s with SHA256: %s",
                    item["path"],
                    item["sha256"][:12],
                )
                await store.insert(
                    item,
                    compose_url(indexes.base_url, item["path"]),
                    params.boot_source_id,
                    indexes.signed,
                )
            workflow.logger.info(
                "Processed %d items", len(product_items.items)
            )

        await store.finalize()
        return True


@workflow.defn(name=REFRESH_UPSTREAM_SOURCE_WF_NAME, sandboxed=False)
class RefreshUpstreamSourceWorkflow:
    @workflow.run
    async def run(self, params: RefreshUpstreamSourceParams) -> bool:
        # download the source data from API
        source = GetBootSourceResult.from_dict(
            await workflow.execute_activity(
                GET_BOOT_SOURCE_ACTIVITY,
                GetBootSourceParams(
                    msm_base_url=params.msm_url,
                    msm_jwt=params.msm_jwt,
                    boot_source_id=params.boot_source_id,
                ),
                start_to_close_timeout=timedelta(seconds=30),
            )
        )
        # download upstream Index file and extract the available products
        assets = FetchAssetListResult.from_dict(
            await workflow.execute_activity(
                FETCH_SS_ASSETS_ACTIVITY,
                FetchAssetListParams(
                    index_url=source.index_url,
                    keyring=source.keyring,
                ),
                start_to_close_timeout=SS_DOWNLOAD_TIMEOUT,
            )
        )

        # patch the available asset list
        await workflow.execute_activity(
            PATCH_AVAILABLE_ASSETS_ACTIVITY,
            PatchAssetListParams(
                msm_base_url=params.msm_url,
                msm_jwt=params.msm_jwt,
                boot_source_id=params.boot_source_id,
                available=assets,
            ),
            start_to_close_timeout=SS_DOWNLOAD_TIMEOUT,
        )

        workflow.logger.info(
            "Refreshed boot-source %d with %d items",
            params.boot_source_id,
            len(assets.assets),
        )

        return True
