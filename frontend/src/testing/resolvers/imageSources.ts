import { http, HttpResponse } from "msw";

import { ExceptionCode } from "@/app/api";
import type { SortDirection } from "@/app/api/handlers";
import type {
  PostBootSourcesV1BootassetSourcesPostError,
  BootSource,
  BootSourcesPostRequest,
  BootSourcesPostResponse,
  GetBootSourcesV1BootassetSourcesGetError,
  GetBootSourcesV1BootassetSourcesGetResponse,
  PatchBootSourceV1BootassetSourcesIdPatchError,
  DeleteBootSourceV1BootassetSourcesIdDeleteError,
} from "@/app/apiclient";
import { imageSourceFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

type BootSourcesSortKey = keyof Pick<BootSource, "id" | "url" | "priority" | "sync_interval">;

const mockImageSources = imageSourceFactory.buildList(10);

const mockListGetImageSourcesError: GetBootSourcesV1BootassetSourcesGetError = {
  error: {
    code: ExceptionCode.NOT_AUTHENTICATED,
    message: "You must be authenticated to access this resource",
  },
};

const mockPostImageSourcesError: PostBootSourcesV1BootassetSourcesPostError = {
  error: {
    code: ExceptionCode.INVALID_PARAMETERS,
    message: "Invalid parameters provided for image source creation",
  },
};

const mockPatchImageSourcesError: PatchBootSourceV1BootassetSourcesIdPatchError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to update this image source",
  },
};

const mockDeleteImageSourcesError: DeleteBootSourceV1BootassetSourcesIdDeleteError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to delete this image source",
  },
};

const imageSourceResolvers = {
  listImageSources: {
    resolved: false,
    handler: (data: BootSource[] = mockImageSources) => {
      return http.get(apiUrls.imageSources, async ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page")) || 1;
        const size = Number(searchParams.get("size")) || 10;
        const sortBy = searchParams.get("sortBy");
        if (sortBy) {
          const [field, order] = sortBy.split("-") as [BootSourcesSortKey, SortDirection];
          data.sort((a, b) => {
            if (a[field] < b[field]) {
              return order === "asc" ? -1 : 1;
            } else if (a[field] > b[field]) {
              return order === "asc" ? 1 : -1;
            }
            return a.id - b.id;
          });
        }
        const start = (page - 1) * size;
        const end = page * size;
        const itemsPage = data.slice(start, end);
        const response: GetBootSourcesV1BootassetSourcesGetResponse = {
          items: itemsPage,
          page,
          total: data.length,
          size,
        };
        imageSourceResolvers.listImageSources.resolved = true;
        return HttpResponse.json(response);
      });
    },
    error: (error: GetBootSourcesV1BootassetSourcesGetError = mockListGetImageSourcesError) => {
      return http.get(apiUrls.imageSources, () => {
        imageSourceResolvers.listImageSources.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  getImageSource: {
    resolved: false,
    handler: (data: BootSource[] = mockImageSources) => {
      return http.get(`${apiUrls.imageSources}/:id`, ({ params }) => {
        const id = parseInt(params.id as string, 10);
        const imageSource = data.find((imageSource) => imageSource.id === id);
        imageSourceResolvers.getImageSource.resolved = true;
        return imageSource ? HttpResponse.json(imageSource) : HttpResponse.error();
      });
    },
    error: (error: GetBootSourcesV1BootassetSourcesGetError = mockListGetImageSourcesError) => {
      return http.get(`${apiUrls.imageSources}/:id`, () => {
        imageSourceResolvers.getImageSource.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  createImageSource: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.imageSources, async ({ request }) => {
        const { url, keyring, priority, sync_interval } = (await request.json()) as BootSourcesPostRequest;
        const newImageSource = imageSourceFactory.build({
          url,
          keyring,
          priority,
          sync_interval,
        }) as BootSourcesPostResponse;
        imageSourceResolvers.createImageSource.resolved = true;
        return new HttpResponse(JSON.stringify(newImageSource), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });
    },
    error: (error: PostBootSourcesV1BootassetSourcesPostError = mockPostImageSourcesError) => {
      return http.post(apiUrls.imageSources, () => {
        imageSourceResolvers.createImageSource.resolved = true;
        return new HttpResponse(JSON.stringify(error), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      });
    },
  },
  updateImageSource: {
    resolved: false,
    handler: () => {
      return http.patch(`${apiUrls.imageSources}/:id`, async () => {
        imageSourceResolvers.updateImageSource.resolved = true;
        return new HttpResponse(null, { status: 200 });
      });
    },
    error: (error: PatchBootSourceV1BootassetSourcesIdPatchError = mockPatchImageSourcesError) => {
      return http.patch(`${apiUrls.imageSources}/:id`, () => {
        imageSourceResolvers.updateImageSource.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
  deleteImageSource: {
    resolved: false,
    handler: () => {
      return http.delete(`${apiUrls.imageSources}/:id`, async () => {
        imageSourceResolvers.deleteImageSource.resolved = true;
        return new HttpResponse(null, { status: 204 });
      });
    },
    error: (error: DeleteBootSourceV1BootassetSourcesIdDeleteError = mockDeleteImageSourcesError) => {
      return http.delete(`${apiUrls.imageSources}/:id`, () => {
        imageSourceResolvers.deleteImageSource.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
};

export { imageSourceResolvers, mockImageSources };
