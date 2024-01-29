import TableActions from "./TableActions";

import { renderWithMemoryRouter, screen, userEvent } from "@/utils/test-utils";

it("displays edit table action when onEdit prop is provided", () => {
  renderWithMemoryRouter(<TableActions onEdit={vi.fn()} />);

  expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
});

it("displays delete table action when onDelete prop is provided", () => {
  renderWithMemoryRouter(<TableActions onDelete={vi.fn()} />);

  expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
});

it("displays edit table action as a link when editPath prop is provided", async () => {
  renderWithMemoryRouter(<TableActions editPath="/edit" onEdit={() => {}} />);

  const editLink = screen.getByRole("link", { name: /edit/i });
  expect(editLink).toHaveAttribute("href", "/edit");
  await userEvent.click(editLink);
});
