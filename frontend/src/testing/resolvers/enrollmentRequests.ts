import { http, HttpResponse } from "msw";

import type { PendingSite, PendingSitesPostRequest } from "@/app/api";
import type { GetPendingV1SitesPendingGetError, PostPendingV1SitesPendingPostError } from "@/app/apiclient";
import { ExceptionCode } from "@/app/apiclient";
import { enrollmentRequestFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

const mockEnrollmentRequests = enrollmentRequestFactory.buildList(155);

const mockListEnrollmentRequestsError: GetPendingV1SitesPendingGetError = {
  error: {
    code: ExceptionCode.NOT_AUTHENTICATED,
    message: "You must be authenticated to access this resource",
  },
};

const mockPostEnrollmentRequestsError: PostPendingV1SitesPendingPostError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to manage enrollment requests",
  },
};

const enrollmentRequestsResolvers = {
  listEnrollmentRequests: {
    resolved: false,
    handler: (data: PendingSite[] = mockEnrollmentRequests) => {
      return http.get(apiUrls.enrollmentRequests, async ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page"));
        const size = Number(searchParams.get("size"));
        const itemsPage = data.slice((page - 1) * size, page * size);
        const response = {
          items: itemsPage,
          page,
          total: data.length,
        };
        enrollmentRequestsResolvers.listEnrollmentRequests.resolved = true;
        return HttpResponse.json(response);
      });
    },
    error: (error: GetPendingV1SitesPendingGetError = mockListEnrollmentRequestsError) => {
      return http.get(apiUrls.enrollmentRequests, () => {
        enrollmentRequestsResolvers.listEnrollmentRequests.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  postEnrollmentRequests: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.enrollmentRequests, async ({ request }) => {
        const { ids, accept } = (await request.json()) as PendingSitesPostRequest;
        enrollmentRequestsResolvers.postEnrollmentRequests.resolved = true;
        if (ids && typeof accept === "boolean") {
          return new HttpResponse(null, { status: 204 });
        } else {
          return new HttpResponse(null, { status: 400 });
        }
      });
    },
    error: (error: PostPendingV1SitesPendingPostError = mockPostEnrollmentRequestsError) => {
      return http.post(apiUrls.enrollmentRequests, () => {
        enrollmentRequestsResolvers.postEnrollmentRequests.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
};

export { enrollmentRequestsResolvers };
