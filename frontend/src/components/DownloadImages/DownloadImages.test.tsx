import DownloadImages from "./DownloadImages";

import { render, screen } from "@/utils/test-utils";

it("renders without crashing", () => {
  render(<DownloadImages />);
  expect(screen.getByRole("heading", { name: "Download images" })).toBeInTheDocument();
});
