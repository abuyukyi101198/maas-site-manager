import DeleteOrKeepImages from "./DeleteOrKeepImages";

import { render, screen } from "@/utils/test-utils";

it("displays a correect message and action buttons", () => {
  render(<DeleteOrKeepImages />);

  expect(screen.getByRole("heading", { name: /Delete images/i })).toBeInTheDocument();
  expect(screen.getByText(/Do you want to delete images/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Delete images/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Keep images/i })).toBeInTheDocument();
});
