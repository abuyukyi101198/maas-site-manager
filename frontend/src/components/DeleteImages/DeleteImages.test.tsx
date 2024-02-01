import { DeleteImages } from "./DeleteImages";

import { getByTextContent, render, screen } from "@/utils/test-utils";

it("displays delete confirmation", () => {
  render(<DeleteImages count={2} onCancel={vi.fn()} onDelete={vi.fn()} />);
  expect(getByTextContent(new RegExp("Are you sure you want to delete 2 images?", "s"))).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete 2 images" })).toBeInTheDocument();
});

it("can display an error message", () => {
  render(<DeleteImages count={2} error={Error("Uh oh!")} onCancel={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getByText("Uh oh!")).toBeInTheDocument();
});
