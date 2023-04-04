import * as React from "react";

import * as ReactDOM from "react-dom/client";

import App from "./App";
import { isDev } from "./constants";

/* c8 ignore next 4 */
if (isDev) {
  const { worker } = await import("./mocks/browser");
  await worker.start();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
