import { http, HttpResponse } from "msw";

import type {
  DeleteV1TokensIdDeleteError,
  GetExportV1TokensExportGetError,
  GetV1TokensGetError,
  PostV1TokensPostError,
  Token,
  TokensPostRequest,
  TokensPostResponse,
} from "@/app/apiclient";
import { ExceptionCode } from "@/app/apiclient";
import { tokenFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

const mockTokens = tokenFactory.buildList(155);

const mockCreateTokensError: PostV1TokensPostError = {
  error: {
    code: ExceptionCode.INVALID_PARAMETERS,
    message: "Invalid parameters provided for token creation",
  },
};

const mockListTokensError: GetV1TokensGetError = {
  error: {
    code: ExceptionCode.NOT_AUTHENTICATED,
    message: "You must be authenticated to access this resource",
  },
};

const mockDeleteTokensError: DeleteV1TokensIdDeleteError = {
  error: {
    code: ExceptionCode.MISSING_PERMISSIONS,
    message: "You do not have permission to delete tokens",
  },
};

const mockExportTokensError: GetExportV1TokensExportGetError = {
  error: {
    code: ExceptionCode.MISSING_RESOURCE,
    message: "No tokens found for export",
  },
};

const tokensResolvers = {
  createTokens: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.tokens, async ({ request }) => {
        let tokens;
        const { count, duration } = (await request.json()) as TokensPostRequest;
        if (count && duration) {
          tokens = Array(count).fill(tokenFactory.build());
        } else {
          return new HttpResponse(null, { status: 400 });
        }
        const response: TokensPostResponse = { items: tokens };
        return HttpResponse.json(response);
      });
    },
    error: (error: PostV1TokensPostError = mockCreateTokensError) => {
      return http.post(apiUrls.tokens, () => {
        tokensResolvers.createTokens.resolved = true;
        return new HttpResponse(JSON.stringify(error), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      });
    },
  },
  listTokens: {
    resolved: false,
    handler: (data: Token[] = mockTokens) => {
      return http.get(apiUrls.tokens, ({ request }) => {
        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page"));
        const size = Number(searchParams.get("size"));
        const itemsPage = data.slice((page - 1) * size, page * size);
        const response = {
          items: itemsPage,
          page,
          total: data.length,
        };
        tokensResolvers.listTokens.resolved = true;
        return HttpResponse.json(response);
      });
    },
    error: (error: GetV1TokensGetError = mockListTokensError) => {
      return http.get(apiUrls.tokens, () => {
        tokensResolvers.listTokens.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
  deleteTokens: {
    resolved: false,
    handler: () => {
      return http.delete(apiUrls.tokens, () => {
        return new HttpResponse(null, { status: 204 });
      });
    },
    error: (error: DeleteV1TokensIdDeleteError = mockDeleteTokensError) => {
      return http.delete(apiUrls.tokens, () => {
        tokensResolvers.deleteTokens.resolved = true;
        return HttpResponse.json(error, { status: 403 });
      });
    },
  },
  exportTokens: {
    resolved: false,
    handler: (data: Token[] = mockTokens) => {
      return http.get(apiUrls.tokensExport, ({ request }) => {
        const url = new URL(request.url);
        const idsParam = url.searchParams.getAll("id");

        let filteredTokens = data;
        if (idsParam.length > 0) {
          const requestedIds = idsParam.map((id) => parseInt(id.trim(), 10));
          filteredTokens = data.filter((token) => requestedIds.includes(token.id));
        }

        const csv = [
          "id,value,expired,created",
          ...filteredTokens.map((t) => `${t.id},${t.value},${t.expired},${t.created}`),
        ].join("\n");

        return new HttpResponse(csv, {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
          },
        });
      });
    },
    error: (error: GetExportV1TokensExportGetError = mockExportTokensError) => {
      return http.get(apiUrls.tokensExport, () => {
        tokensResolvers.exportTokens.resolved = true;
        return HttpResponse.json(error, { status: 404 });
      });
    },
  },
};

export { tokensResolvers };
