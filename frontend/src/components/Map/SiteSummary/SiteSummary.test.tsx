import { rest } from "msw";

import SiteSummary from "./SiteSummary";

import { siteFactory, statsFactory } from "@/mocks/factories";
import { createMockSiteResolver } from "@/mocks/resolvers";
import { apiUrls } from "@/utils/test-urls";
import { renderWithMemoryRouter, waitFor, screen, setupServer, userEvent } from "@/utils/test-utils";

const stats = statsFactory.build();
const site = siteFactory.build({ url: "https://example.com", stats });
const mockServer = setupServer(rest.get(`${apiUrls.sites}/:id`, createMockSiteResolver([site])));

beforeAll(() => {
  mockServer.listen();
});

afterEach(() => {
  mockServer.resetHandlers();
});

afterAll(() => {
  mockServer.close();
});

it("displays data for a site", async () => {
  renderWithMemoryRouter(<SiteSummary id={site.id} />);

  await waitFor(() => {
    expect(screen.getByText(site.name)).toBeInTheDocument();
  });

  expect(screen.getByRole("link", { name: site.url })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(site.connection_status, "i"))).toBeInTheDocument();
  expect(screen.getByText(stats.machines_total)).toBeInTheDocument();

  await userEvent.click(screen.getByTestId("popover-container"));

  expect(screen.getByTestId("deployed")).toHaveTextContent(stats.machines_deployed.toString());
  expect(screen.getByTestId("allocated")).toHaveTextContent(stats.machines_allocated.toString());
  expect(screen.getByTestId("ready")).toHaveTextContent(stats.machines_ready.toString());
  expect(screen.getByTestId("error")).toHaveTextContent(stats.machines_error.toString());
});
