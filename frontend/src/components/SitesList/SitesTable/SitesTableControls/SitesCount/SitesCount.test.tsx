import SitesCount from "./SitesCount";

import { render, screen } from "@/utils/test-utils";

it("displays plural sites count", () => {
  const total = 11;
  render(<SitesCount isLoading={false} totalSites={total} />);

  expect(screen.getByText("11 MAAS regions")).toBeInTheDocument();
});

it("displays singular sites count", () => {
  const total = 1;
  render(<SitesCount isLoading={false} totalSites={total} />);

  expect(screen.getByText("1 MAAS region")).toBeInTheDocument();
});
