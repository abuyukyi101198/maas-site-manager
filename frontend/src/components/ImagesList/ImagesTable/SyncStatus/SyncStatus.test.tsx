import { rest } from "msw";
import { setupServer } from "msw/node";

import SyncStatus from "./SyncStatus";

import { siteFactory, imageFactory } from "@/mocks/factories";
import { createMockSitesResolver } from "@/mocks/resolvers";
import { createMockGetServer } from "@/mocks/server";
import { apiUrls } from "@/utils/test-urls";
import { renderWithMemoryRouter, screen, waitFor } from "@/utils/test-utils";

const sites = siteFactory.buildList(5);
const mockServer = createMockGetServer(apiUrls.sites, createMockSitesResolver(sites));

beforeAll(() => {
  mockServer.listen();
});

afterEach(() => {
  mockServer.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  mockServer.close();
});
const server = setupServer(
  rest.get("/api/sites", (req, res, ctx) => {
    return res(ctx.json({ total: 5 }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays SyncedStatus when image is synced", async () => {
  const image = imageFactory.build({
    downloaded: 100,
  });

  renderWithMemoryRouter(<SyncStatus image={image} />);
  await waitFor(() => expect(screen.getByText("Synced to MAAS sites")).toBeInTheDocument());
});

test("displays QueuedStatus when image is queued", () => {
  const image = imageFactory.build({
    downloaded: 0,
  });

  renderWithMemoryRouter(<SyncStatus image={image} />);
  expect(screen.getByText("Queued for download")).toBeInTheDocument();
});

test("displays DownloadingStatus when image is downloading", () => {
  const image = imageFactory.build({
    downloaded: 1,
  });

  renderWithMemoryRouter(<SyncStatus image={image} />);
  expect(screen.getByText("Downloading 1%")).toBeInTheDocument();
});
