import { createMemoryRouter, RouterProvider } from "react-router-dom";

import urls from "./api/urls";
import { siteFactory } from "./mocks/factories";
import { createMockSitesResolver } from "./mocks/resolvers";
import { createMockGetServer } from "./mocks/server";
import routes from "./routes";
import { render, waitFor } from "./test-utils";

const sites = siteFactory.buildList(1);
const mockServer = createMockGetServer(urls.sites, createMockSitesResolver(sites));

beforeAll(() => {
  mockServer.listen();
});
afterEach(() => {
  mockServer.resetHandlers();
});
afterAll(() => {
  mockServer.close();
});

describe("router", () => {
  it("redirects to the default route", async () => {
    const router = createMemoryRouter(routes);
    render(<RouterProvider router={router} />);

    expect(router.state.location.pathname).toEqual("/");
    await waitFor(() => expect(router.state.location.pathname).toEqual("/sites"));
  });
});
