import SitesViewControl from "./SitesViewControl";

import { routesConfig } from "@/config/routes";
import { renderWithMemoryRouter, screen, userEvent } from "@/utils/test-utils";

describe("sites view control", () => {
  beforeEach(() => {
    localStorage.setItem("hasAcceptedOsmTos", "true");
  });

  afterAll(() => {
    localStorage.removeItem("hasAcceptedOsmTos");
  });

  it("renders a sites view control tablist", () => {
    renderWithMemoryRouter(<SitesViewControl />);

    expect(
      screen.getByRole("tablist", {
        name: /sites view control/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /map/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /table/i })).toBeInTheDocument();
  });

  it("points to the appropriate route for each tab", async () => {
    renderWithMemoryRouter(<SitesViewControl />);

    await expect(screen.getByRole("tab", { name: /map/i })).toHaveAttribute("href", routesConfig.sitesMap.path);
    await expect(screen.getByRole("tab", { name: /table/i })).toHaveAttribute("href", routesConfig.sitesList.path);
  });

  it("disables the map view button if the OSM ToS have not been accepted", async () => {
    localStorage.setItem("hasAcceptedOsmTos", "false");
    renderWithMemoryRouter(<SitesViewControl />);
    expect(screen.getByRole("tab", { name: /map/i })).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(screen.getByRole("tab", { name: /map/i }));

    expect(
      screen.getByRole("tooltip", {
        name: "To enable the map you need to accept the OpenStreetMap TOS in the settings.",
      }),
    ).toBeInTheDocument();
  });

  it("enables the map view button if the OSM ToS have been accepted", () => {
    renderWithMemoryRouter(<SitesViewControl />);
    expect(screen.getByRole("tab", { name: /map/i })).toHaveAttribute("aria-disabled", "false");
  });
});
