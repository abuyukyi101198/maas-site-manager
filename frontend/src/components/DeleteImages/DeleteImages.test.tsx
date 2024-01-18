import DeleteImages from "./DeleteImages";

import { render, screen } from "@/utils/test-utils";

it("renders without crashing", () => {
  render(<DeleteImages />);
  expect(screen.getByRole("heading", { name: "Delete images" })).toBeInTheDocument();
});
