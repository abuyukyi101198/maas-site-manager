import { http, HttpResponse } from "msw";

import type { SitesSortKey, SortDirection } from "@/app/api/handlers";
import { ExceptionCode } from "@/app/apiclient";
import type {
  GetV1SitesGetData,
  GetV1SitesGetError,
  Site,
  SitesGetResponse,
  GetCoordinatesV1SitesCoordinatesGetError,
  DeleteV1SitesIdDeleteError,
  PatchV1SettingsPatchError,
} from "@/app/apiclient";
import { siteFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

const mockSites = siteFactory.buildList(155);

const mockListGetSitesError: GetV1SitesGetError = {
  error: {
    code: ExceptionCode.NOT_AUTHENTICATED,
    message: "You must be authenticated to access this resource",
  },
};

const mockGetCoordinatesError: GetCoordinatesV1SitesCoordinatesGetError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to access site coordinates",
  },
};

const mockDeleteSitesError: DeleteV1SitesIdDeleteError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to delete this site",
  },
};

const mockPatchSitesError: PatchV1SettingsPatchError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to update this site",
  },
};

const sitesResolvers = {
  listSites: {
    resolved: false,
    handler: (data: Site[] = mockSites) => {
      return http.get(apiUrls.sites, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page"));
        const size = Number(searchParams.get("size"));
        const queryText = searchParams.get("q")?.replace("+", " ");

        const items = [...data];

        const filteredItems = queryText
          ? items.filter((site) => site.name.toLowerCase().includes(queryText?.toLowerCase()))
          : items;

        const sortBy = searchParams.get("sortBy") as NonNullable<GetV1SitesGetData["query"]>["sort_by"];
        if (sortBy) {
          const [field, order] = sortBy.split("-") as [SitesSortKey, SortDirection];
          filteredItems.sort((a, b) => {
            if (order === "asc") {
              return a[field] > b[field] ? 1 : -1;
            }
            return a[field] < b[field] ? 1 : -1;
          });
        }
        const itemsPage = filteredItems.slice((page - 1) * size, page * size);

        const response: SitesGetResponse = {
          items: itemsPage,
          page,
          total: data.length,
          size,
        };
        sitesResolvers.listSites.resolved = true;
        return HttpResponse.json(response);
      });
    },
    error: (error: GetV1SitesGetError = mockListGetSitesError) => {
      return http.get(apiUrls.sites, () => {
        sitesResolvers.listSites.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  sitesCoordinates: {
    resolved: false,
    handler: (data: Site[] = mockSites) => {
      return http.get(apiUrls.sitesCoordinates, () => {
        const response = data.map(({ id, coordinates }) => ({ id, coordinates }));
        return HttpResponse.json(response);
      });
    },
    error: (error: GetCoordinatesV1SitesCoordinatesGetError = mockGetCoordinatesError) => {
      return http.get(apiUrls.sitesCoordinates, () => {
        sitesResolvers.sitesCoordinates.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
  getSite: {
    resolved: false,
    handler: (data: Site[] = mockSites) => {
      return http.get(`${apiUrls.sites}/:id`, ({ params }) => {
        const id = Number(params.id);
        const site = data.find((site) => site.id === id);
        return site ? HttpResponse.json({ ...site }) : HttpResponse.error();
      });
    },
    error: (error: GetV1SitesGetError = mockListGetSitesError) => {
      return http.get(`${apiUrls.sites}/:id`, () => {
        sitesResolvers.getSite.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  deleteSites: {
    resolved: false,
    handler: () => {
      return http.delete(apiUrls.sites, () => {
        return new HttpResponse(null, { status: 204 });
      });
    },
    error: (error: DeleteV1SitesIdDeleteError = mockDeleteSitesError) => {
      return http.delete(`${apiUrls.sites}/:id`, () => {
        sitesResolvers.deleteSites.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
  updateSites: {
    resolved: false,
    handler: () => {
      return http.patch(`${apiUrls.sites}/:id`, async ({ request }) => {
        const site = await { ...request.json() };
        return new HttpResponse(JSON.stringify(site), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });
    },
    error: (error: PatchV1SettingsPatchError = mockPatchSitesError) => {
      return http.patch(`${apiUrls.sites}/:id`, () => {
        sitesResolvers.updateSites.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
};

export { sitesResolvers };
