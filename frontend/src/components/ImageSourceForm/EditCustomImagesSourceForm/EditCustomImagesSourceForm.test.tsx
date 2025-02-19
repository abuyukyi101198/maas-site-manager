import EditCustomImagesSourceForm from "./EditCustomImagesSourceForm";

import { fakeBootSources } from "@/components/ImageSourceList/ImageSourceList";
import { AppLayoutContext } from "@/context";
import { BootSourceContext } from "@/context/BootSourceContext";
import { render, screen, userEvent } from "@/utils/test-utils";

const renderForm = () => {
  return render(
    <BootSourceContext.Provider value={{ selected: fakeBootSources.items[0].id, setSelected: jest.fn() }}>
      <EditCustomImagesSourceForm />
    </BootSourceContext.Provider>,
  );
};

it("pre-fills the priority field with the source's priority", () => {
  renderForm();

  expect(screen.getByRole("textbox", { name: "Priority" })).toHaveValue(fakeBootSources.items[0].priority.toString());
});

it("requires the priority field", () => {
  renderForm();

  expect(screen.getByRole("textbox", { name: "Priority" })).toBeRequired();
});

it("enables the submit button when a valid priority is entered", async () => {
  renderForm();

  expect(screen.getByRole("button", { name: "Save" })).toBeAriaDisabled();

  const priorityInput = screen.getByRole("textbox", { name: "Priority" });
  await userEvent.clear(priorityInput);
  await userEvent.type(priorityInput, "100");

  expect(screen.getByRole("button", { name: "Save" })).not.toBeAriaDisabled();
});

it("closes the side panel and resets selected source when 'Cancel' is clicked", async () => {
  const setSelected = vi.fn();
  const setSidebar = vi.fn();

  render(
    <AppLayoutContext.Provider value={{ sidebar: null, setSidebar, previousSidebar: null }}>
      <BootSourceContext.Provider value={{ selected: 1, setSelected }}>
        <EditCustomImagesSourceForm />
      </BootSourceContext.Provider>
    </AppLayoutContext.Provider>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

  expect(setSelected).toHaveBeenCalledWith(null);
  expect(setSidebar).toHaveBeenCalledWith(null);
});

it.todo("shows an error message when submission fails");
