import { http, HttpResponse } from "msw";

import { ExceptionCode, type PostV1LoginPostError } from "@/app/apiclient";
import { accessTokenFactory } from "@/mocks/factories";
import { apiUrls } from "@/utils/test-urls";

const mockLoginInError: PostV1LoginPostError = {
  error: {
    code: ExceptionCode.INVALID_CREDENTIALS,
    message: "Invalid username or password",
  },
};

const authResolvers = {
  login: {
    resolved: false,
    handler: () => {
      return http.post(apiUrls.login, async () => {
        const accessToken = accessTokenFactory.build();
        authResolvers.login.resolved = true;
        return HttpResponse.json(accessToken);
      });
    },
    error: (error: PostV1LoginPostError = mockLoginInError) => {
      return http.post(apiUrls.login, () => {
        authResolvers.login.resolved = true;
        return HttpResponse.json(error, { status: 401 });
      });
    },
  },
};

export { authResolvers };
