import EditImageSourceForm from "./EditImageSourceForm";

import { fakeBootSources } from "@/components/ImageSourceList/ImageSourceList";
import { BootSourceContext } from "@/context/BootSourceContext";
import { render, screen, userEvent } from "@/utils/test-utils";

const renderEditForm = () => {
  return render(
    <BootSourceContext.Provider value={{ selected: fakeBootSources.items[1].id, setSelected: jest.fn() }}>
      <EditImageSourceForm />
    </BootSourceContext.Provider>,
  );
};

it("shows the source's URL in the form title", () => {
  renderEditForm();

  expect(screen.getByRole("heading", { name: `Edit ${fakeBootSources.items[1].url}` })).toBeInTheDocument();
});

it("pre-fills the form with the source's details", () => {
  renderEditForm();

  expect(screen.getByRole("textbox", { name: "URL" })).toHaveValue(fakeBootSources.items[1].url);
  expect(screen.getByRole("textbox", { name: "GPG key" })).toHaveValue(fakeBootSources.items[1].keyring);
  expect(screen.getByRole("checkbox", { name: "Automatically sync images" })).toBeChecked(); // sync interval is > 0 on this boot source
  expect(screen.getByRole("textbox", { name: "Priority" })).toHaveValue(fakeBootSources.items[1].priority.toString());
});

it("shows a caution for changing the URL", async () => {
  renderEditForm();

  expect(
    screen.getByText(
      "Changing to an image server with different images might remove some images from MAAS Site Manager and MAAS.",
    ),
  ).toBeInTheDocument();
});

it("enables the submit button after a field has changed", async () => {
  renderEditForm();

  expect(screen.getByRole("button", { name: "Save" })).toBeAriaDisabled();

  await userEvent.click(screen.getByRole("checkbox", { name: "Automatically sync images" }));

  expect(screen.getByRole("button", { name: "Save" })).not.toBeAriaDisabled();
});

it.todo("shows an error message when submission fails");
