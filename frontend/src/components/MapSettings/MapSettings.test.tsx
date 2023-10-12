import MapSettings from "./MapSettings";

import { render, screen, userEvent } from "@/utils/test-utils";

beforeEach(() => {
  localStorage.setItem("hasAcceptedOsmTos", "false");
});

afterAll(() => {
  localStorage.removeItem("hasAcceptedOsmTos");
});

it("sets the checkbox to checked if the terms have already been accepted", async () => {
  localStorage.setItem("hasAcceptedOsmTos", "true");
  render(<MapSettings />);

  expect(
    screen.getByRole("checkbox", {
      name: "I have read and accept the OpenStreetMap term of service and their fair use policy.",
    }),
  ).toBeChecked();
});

it("does not set the checkbox to checked if the terms have not been accepted", async () => {
  render(<MapSettings />);

  expect(
    screen.getByRole("checkbox", {
      name: "I have read and accept the OpenStreetMap term of service and their fair use policy.",
    }),
  ).not.toBeChecked();
});

it("updates local storage when the form is submitted", async () => {
  render(<MapSettings />);

  await userEvent.click(
    screen.getByRole("checkbox", {
      name: "I have read and accept the OpenStreetMap term of service and their fair use policy.",
    }),
  );

  await userEvent.click(screen.getByRole("button", { name: "Save" }));

  expect(localStorage.getItem("hasAcceptedOsmTos")).toBe("true");
});
