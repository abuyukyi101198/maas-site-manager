import { http, HttpResponse } from "msw";

import type { Image, UpstreamImage, UpstreamImageSource } from "@/app/api";
import type { ImagesSortKey, SortDirection } from "@/app/api/handlers";
import type {
  DeleteImagesV1BootassetItemsIdDeleteError,
  GetBootAssetsV1BootassetsGetError,
  PostImagesV1ImagesPostError,
} from "@/app/apiclient";
import { ExceptionCode } from "@/app/apiclient";
import { imageFactory, upstreamImageFactory, upstreamImageSourceFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

const mockImages = imageFactory.buildList(30);
const mockUpstreamImages = upstreamImageFactory.buildList(150);

const mockListImagesError: GetBootAssetsV1BootassetsGetError = {
  error: {
    code: ExceptionCode.NOT_AUTHENTICATED,
    message: "You must be authenticated to access this resource",
  },
};

const mockDeleteImagesError: DeleteImagesV1BootassetItemsIdDeleteError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to delete images",
  },
};

const mockPostImagesError: PostImagesV1ImagesPostError = {
  error: {
    code: ExceptionCode.INVALID_PARAMETERS,
    message: "Invalid parameters provided for image upload",
  },
};

const imagesResolvers = {
  listImages: {
    resolved: false,
    handler: (data: Image[] = mockImages) => {
      return http.get(apiUrls.bootAssets, async ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page"));
        const size = Number(searchParams.get("size"));
        const sortBy = searchParams.get("sortBy");
        if (sortBy) {
          const [field, order] = sortBy.split("-") as [ImagesSortKey, SortDirection];
          data.sort((a, b) => {
            if (a.os < b.os) {
              return -1;
            } else if (a.os > b.os) {
              return 1;
            } else {
              if (a[field]! < b[field]!) {
                return order === "asc" ? -1 : 1;
              } else if (a[field]! > b[field]!) {
                return order === "asc" ? 1 : -1;
              } else {
                return 0;
              }
            }
          });
        }

        const start = (page - 1) * size;
        const end = page * size;
        const itemsPage = data.slice(start, end);

        const response = {
          items: itemsPage,
          page,
          total: data.length,
          size,
        };

        imagesResolvers.listImages.resolved = true;
        return HttpResponse.json(response);
      });
    },
    error: (error: GetBootAssetsV1BootassetsGetError = mockListImagesError) => {
      return http.get(apiUrls.bootAssets, () => {
        imagesResolvers.listImages.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  listUpstreamImages: {
    resolved: false,
    handler: (data: UpstreamImage[] = mockUpstreamImages) => {
      return http.get(apiUrls.upstreamImages, () => {
        const response = {
          items: data,
          total: data.length,
        };
        imagesResolvers.listUpstreamImages.resolved = true;
        return HttpResponse.json(response);
      });
    },
  },
  getImageSource: {
    resolved: false,
    handler: (data: Omit<UpstreamImageSource, "credentials"> = upstreamImageSourceFactory.build()) => {
      return http.get(apiUrls.upstreamImageSource, () => {
        const response = data;
        imagesResolvers.getImageSource.resolved = true;
        return HttpResponse.json(response);
      });
    },
  },
  updateUpstreamImageSource: {
    resolved: false,
    handler: () => {
      return http.patch(apiUrls.upstreamImageSource, async () => {
        imagesResolvers.updateUpstreamImageSource.resolved = true;
        return new HttpResponse(null, { status: 200 });
      });
    },
  },
  selectUpstreamImages: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.upstreamImages, async () => {
        imagesResolvers.selectUpstreamImages.resolved = true;
        return new HttpResponse(null, { status: 200 });
      });
    },
  },
  deleteImages: {
    resolved: false,
    handler: () => {
      return http.delete(`${apiUrls.bootAssets}/:id`, async ({ request }) => {
        imagesResolvers.deleteImages.resolved = true;
        const ids = await request.json();

        if (Array.isArray(ids) && ids.length > 0) {
          return new HttpResponse(null, { status: 204 });
        }
        return new HttpResponse(null, { status: 400 });
      });
    },
    error: (error: DeleteImagesV1BootassetItemsIdDeleteError = mockDeleteImagesError) => {
      return http.delete(`${apiUrls.bootAssets}/:id`, () => {
        imagesResolvers.deleteImages.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
  uploadImage: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.images, async () => {
        imagesResolvers.uploadImage.resolved = true;
        return new HttpResponse(null, { status: 201 });
      });
    },
    error: (error: PostImagesV1ImagesPostError = mockPostImagesError) => {
      return http.post(apiUrls.images, () => {
        imagesResolvers.uploadImage.resolved = true;
        return HttpResponse.json(error, { status: 400 });
      });
    },
  },
};

export { imagesResolvers };
