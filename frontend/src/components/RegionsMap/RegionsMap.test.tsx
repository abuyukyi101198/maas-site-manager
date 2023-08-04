import urls from "@/api/urls";
import RegionsMap from "@/components/RegionsMap";
import { siteFactory } from "@/mocks/factories";
import { createMockSitesCoordinatesResolver } from "@/mocks/resolvers";
import { createMockGetServer } from "@/mocks/server";
import { renderWithMemoryRouter, screen } from "@/utils/test-utils";

const sites = siteFactory.buildList(2);
const mockServer = createMockGetServer(urls.sitesCoordinates, createMockSitesCoordinatesResolver(sites));

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

it("renders map with controls", () => {
  renderWithMemoryRouter(<RegionsMap />);

  expect(screen.getByRole("region", { name: /regions map/i })).toBeInTheDocument();
  expect(screen.getByRole("searchbox")).toBeInTheDocument();
});
