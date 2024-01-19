import ImageServer from "./ImageServer";

import { render, screen } from "@/utils/test-utils";

it("renders without crashing", () => {
  render(<ImageServer />);

  expect(screen.getByRole("heading", { name: "Image server" })).toBeInTheDocument();
});
