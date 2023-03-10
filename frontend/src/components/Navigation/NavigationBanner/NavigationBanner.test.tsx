import { BrowserRouter } from "react-router-dom";

import NavigationBanner from "./NavigationBanner";

import { screen, render } from "@/test-utils";

describe("Navigation Banner", () => {
  it("displays a link to the homepage", () => {
    render(
      <BrowserRouter>
        <NavigationBanner />
      </BrowserRouter>,
    );

    expect(screen.getByRole("link", { name: /Homepage/ })).toBeInTheDocument();
  });
});
