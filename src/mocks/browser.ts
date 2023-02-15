// src/mocks/browser.js
import { setupWorker, rest } from "msw";

const worker = setupWorker(
  rest.get(
    "/sites",
    // Example of a response resolver that returns
    // a "Content-Type: application/json" response.
    (req, res, ctx) => {
      return res(
        ctx.json({
          items: [
            {
              name: "name",
            },
          ],
          total: 42,
          page: 1,
          size: 20,
        })
      );
    }
  )
);

worker.start();
