import * as Sentry from "@sentry/browser";

import { baseURL } from "@/app/api/config";
import { client } from "@/app/apiclient/client.gen";

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

client.setConfig({
  baseURL,
  auth: getToken,
});

export default client;
