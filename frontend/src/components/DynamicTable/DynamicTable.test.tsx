import { render, fireEvent, waitFor } from "@testing-library/react";

import DynamicTable from "./DynamicTable";

import BREAKPOINTS from "@/base/breakpoints";

const offset = 100;

beforeAll(() => {
  // simulate top offset as JSDOM doesn't support getBoundingClientRect
  // - equivalent of another element of height 100px being displayed above the table
  vi.spyOn(window.HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: offset,
    width: 0,
  } as DOMRect);
});

it("sets a fixed table body height based on top offset on large screens", async () => {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(BREAKPOINTS.xSmall);
  await fireEvent(window, new Event("resize"));

  const { container } = render(<DynamicTable.Body className="test-class">Test content</DynamicTable.Body>);
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const tbody = container.querySelector("tbody");
  fireEvent(window, new Event("resize"));

  // does not alter the height on small screens
  expect(tbody).toHaveStyle("height: undefined");

  vi.spyOn(window, "innerWidth", "get").mockReturnValue(BREAKPOINTS.large);
  await fireEvent(window, new Event("resize"));
  await waitFor(() => expect(tbody).toHaveStyle(`height: calc(100vh - ${offset + 1}px)`));
});
