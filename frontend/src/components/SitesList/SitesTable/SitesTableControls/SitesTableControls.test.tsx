import SitesTableControls from "./SitesTableControls";

import { renderWithMemoryRouter, screen } from "@/utils/test-utils";

it("displays correct total number of sites", () => {
  renderWithMemoryRouter(
    <SitesTableControls
      allColumns={[]}
      data={{ items: [], total: 3, page: 1, size: 0 }}
      isLoading={false}
      setSearchText={() => {}}
    />,
  );

  expect(screen.getByRole("heading", { name: /3 MAAS region/i })).toBeInTheDocument();
});

it("displays a search input", () => {
  renderWithMemoryRouter(
    <SitesTableControls
      allColumns={[]}
      data={{ items: [], total: 1, page: 1, size: 0 }}
      isLoading={false}
      setSearchText={() => {}}
    />,
  );
  expect(
    screen.getByRole("searchbox", {
      name: /search and filter/i,
    }),
  ).toBeInTheDocument();
});

it("displays the sites view control tabs", () => {
  renderWithMemoryRouter(
    <SitesTableControls
      allColumns={[]}
      data={{ items: [], total: 1, page: 1, size: 0 }}
      isLoading={false}
      setSearchText={() => {}}
    />,
  );

  expect(
    screen.getByRole("tablist", {
      name: /sites view control/i,
    }),
  ).toBeInTheDocument();
});
