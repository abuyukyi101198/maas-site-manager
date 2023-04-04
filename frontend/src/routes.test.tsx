import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { allResolvers } from "./mocks/resolvers";
import routes, { routesConfig } from "./routes";

import { render, waitFor, setupServer } from "@/test-utils";

const mockServer = setupServer(...allResolvers);

describe("router", () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterEach(() => {
    mockServer.resetHandlers();
  });
  afterAll(() => {
    mockServer.close();
  });

  it("redirects to the default route", async () => {
    const router = createMemoryRouter(routes);
    render(<RouterProvider router={router} />);

    expect(router.state.location.pathname).toEqual("/");
    await waitFor(() => expect(router.state.location.pathname).toEqual("/sites"));
  });

  Object.values(routesConfig).forEach(({ title, path }) => {
    it(`displays correct document title for ${title} page`, async () => {
      const router = createMemoryRouter(routes, { initialEntries: [path], initialIndex: 0 });
      render(<RouterProvider router={router} />);
      expect(document.title).toBe(`${title} | MAAS Site Manager`);
    });
  });
});
