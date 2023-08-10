import * as Sentry from "@sentry/browser";

import { FetchHttpRequestWithInterceptors } from "./FetchHttpRequestWithInterceptors";

import { baseURL } from "@/api/config";
import { ApiClient } from "@/api-client";

const getToken = async () => {
  let authToken;
  try {
    const persistedToken = await localStorage.getItem("jwtToken");
    if (persistedToken) {
      authToken = String(JSON.parse(persistedToken));
    }
  } catch (error) {
    Sentry.captureException(new Error("Failed to parse authToken", { cause: error }));
    return "";
  }
  return authToken ?? "";
};

export const apiClient = new ApiClient(
  {
    BASE: baseURL,
    TOKEN: getToken,
  },
  FetchHttpRequestWithInterceptors,
);

export default apiClient;
