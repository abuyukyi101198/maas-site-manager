import AddImageSourceForm from "./AddImageSourceForm";

import { render, screen, userEvent } from "@/utils/test-utils";

it("requires the URL field when adding an image source", () => {
  render(<AddImageSourceForm />);

  expect(screen.getByRole("textbox", { name: "URL" })).toBeRequired();
});

it("checks 'Automatically sync images' by defualt", () => {
  render(<AddImageSourceForm />);

  expect(screen.getByRole("checkbox", { name: "Automatically sync images" })).toBeChecked();
});

it("enables the submit button once a valid URL is entered", async () => {
  render(<AddImageSourceForm />);

  expect(screen.getByRole("button", { name: "Save" })).toBeAriaDisabled();

  await userEvent.type(screen.getByRole("textbox", { name: "URL" }), "http://example.com");
  await userEvent.tab();

  expect(screen.getByRole("button", { name: "Save" })).not.toBeAriaDisabled();
});

it("does not show a caution message for the URL", () => {
  render(<AddImageSourceForm />);

  expect(
    screen.queryByText(
      "Changing to an image server with different images might remove some images from MAAS Site Manager and MAAS.",
    ),
  ).not.toBeInTheDocument();
});

it.todo("shows an error message when submission fails");
