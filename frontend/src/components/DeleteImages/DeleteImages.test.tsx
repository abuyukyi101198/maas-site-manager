import { DeleteImages } from "./DeleteImages";

import { render, screen } from "@/utils/test-utils";

it("displays delete confirmation", () => {
  render(<DeleteImages count={2} />);
  expect(screen.getByText(new RegExp("Are you sure you want to delete 2 images?", "s"))).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete 2 images" })).toBeInTheDocument();
});
