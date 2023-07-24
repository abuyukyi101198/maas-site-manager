import Map from "./Map";

import { render, screen } from "@/utils/test-utils";

it("renders the map with controls", async () => {
  render(<Map id="map-container" />);
  // expect tile images tags to use openstreetmap as the source
  expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  await screen.getAllByRole("img").forEach(async (img) => {
    await expect(img).toHaveAttribute("src", expect.stringContaining("tile.openstreetmap.org"));
  });
  expect(screen.getByRole("button", { name: /Zoom in/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Zoom out/ })).toBeInTheDocument();
});

it("displays open street map attribution", () => {
  render(<Map id="map-container" />);

  expect(
    screen.getByRole("link", {
      name: /openstreetmap/i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", {
      name: /openstreetmap/i,
    }),
  ).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
});
