import * as React from "react";

import * as Sentry from "@sentry/browser";
import * as ReactDOM from "react-dom/client";

import packageInfo from "../package.json";

import App from "@/App";
import { baseURL } from "@/api";
import { useMockData } from "@/constants";
import { getApiUrl } from "@/utils/test-urls";

/* c8 ignore next 4 */
if (useMockData) {
  const { worker } = await import("./mocks/browser");
  // eslint-disable-next-line no-console
  console.info("msw baseUrl %s", baseURL);
  // eslint-disable-next-line no-console
  console.info("msw API URL %s", getApiUrl(""));
  await worker.start({
    onUnhandledRequest(req) {
      console.info(req.method, req.url.href);
      if (req.url.href.includes(baseURL)) {
        // eslint-disable-next-line no-console
        console.warn("Found an unhandled %s request to %s", req.method, req.url.href);
      }
    },
  });
}

const environment = process.env.NODE_ENV;
const version = packageInfo.version;
const release = import.meta.env.VITE_APP_VERSION;
if (environment !== "test") {
  // eslint-disable-next-line no-console
  console.log(`%cMAAS Site Manager \n${version} ${release}\n${environment}`, "color: #e95420; font-weight: bold;");
}

// https://sentry.is.canonical.com/canonical/maas-site-manager/
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment,
  release,
  beforeSend: (event) => ({
    ...event,
    // send just the pathname of the current page excluding the origin
    // this allows for grouping of errors by route
    tags: { ...event.tags, url: window.location.pathname, version },
  }),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
