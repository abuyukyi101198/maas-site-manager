import { vi } from "vitest";

import RemoveRegions from "./index";

import { render, screen, userEvent } from "@/test-utils";

vi.mock("@/context", () => ({
  useAppContext: () => ({
    rowSelection: {
      "1": true,
      "2": true,
    },
  }),
}));

it("if the correct phrase has been entered the 'Remove' button becomes enabled.", async () => {
  render(<RemoveRegions />);
  expect(screen.getByRole("button", { name: /Remove/i })).toBeDisabled();
  await userEvent.type(screen.getByRole("textbox"), "remove 2 regions");
  expect(screen.queryByText(/Confirmation string is not correct/i)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Remove/i })).toBeEnabled();
});

it("if the confirmation string is not correct and the user unfoxuses the input field a error state is shown.", async () => {
  render(<RemoveRegions />);
  expect(screen.getByRole("button", { name: /Remove/i })).toBeDisabled();
  await userEvent.type(screen.getByRole("textbox"), "incorrect string{tab}");
  expect(screen.getByText(/Confirmation string is not correct/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Remove/i })).toBeDisabled();
});
