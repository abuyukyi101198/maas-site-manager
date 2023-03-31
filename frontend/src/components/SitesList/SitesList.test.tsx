import SitesList from "./SitesList";

import urls from "@/api/urls";
import { siteFactory } from "@/mocks/factories";
import { createMockSitesResolver } from "@/mocks/resolvers";
import { createMockGetServer } from "@/mocks/server";
import { render, renderWithMemoryRouter, screen, userEvent, waitFor, within } from "@/test-utils";

const sites = siteFactory.buildList(2);
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

it("displays loading text", () => {
  render(<SitesList />);

  expect(within(screen.getByRole("table", { name: /sites/i })).getByText(/loading/i)).toBeInTheDocument();
});

it("displays populated sites table", async () => {
  render(<SitesList />);

  expect(screen.getByRole("table", { name: /sites/i })).toBeInTheDocument();

  await waitFor(() => expect(screen.getAllByRole("rowgroup")).toHaveLength(2));
  const tableBody = screen.getAllByRole("rowgroup")[1];
  expect(within(tableBody).getAllByRole("row")).toHaveLength(sites.length);
  within(tableBody)
    .getAllByRole("row")
    .forEach((row, i) => expect(row).toHaveTextContent(new RegExp(sites[i].name, "i")));
});

it("remove button is disabled if no row is selected", async () => {
  renderWithMemoryRouter(<SitesList />);
  expect(screen.getByRole("button", { name: /Remove/i })).toBeDisabled();
});

it("remove button is enabled if some rows are selected", async () => {
  renderWithMemoryRouter(<SitesList />);
  await userEvent.click(screen.getByRole("checkbox", { name: /select all/i }));
  await waitFor(() => expect(screen.getByRole("button", { name: /Remove/i })).toBeEnabled());
});
