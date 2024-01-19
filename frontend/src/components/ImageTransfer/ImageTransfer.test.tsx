import ImageTransfer from "./ImageTransfer";

import { render, screen } from "@/utils/test-utils";

it("renders without crashing", () => {
  render(<ImageTransfer />);

  expect(screen.getByRole("heading", { name: "Transfer images" })).toBeInTheDocument();
});
