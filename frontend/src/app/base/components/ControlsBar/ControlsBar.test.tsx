import ControlsBar from "./ControlsBar";

import { render, screen } from "@/utils/test-utils";

it("displays ControlsBar.Left and ControlsBar.Right", () => {
  render(
    <ControlsBar>
      <ControlsBar.Left>left</ControlsBar.Left>
      <ControlsBar.Right>right</ControlsBar.Right>
    </ControlsBar>,
  );

  expect(screen.getByText("left")).toBeInTheDocument();
  expect(screen.getByText("right")).toBeInTheDocument();
});
