import UploadImage from "./UploadImage";

import { render, screen } from "@/utils/test-utils";

it("renders without crashing", () => {
  render(<UploadImage />);
  expect(screen.getByRole("heading", { name: "Upload image" })).toBeInTheDocument();
});
