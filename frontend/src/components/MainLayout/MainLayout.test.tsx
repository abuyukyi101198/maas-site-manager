import MainLayout from "./MainLayout";

import { renderWithMemoryRouter, screen, waitFor } from "@/test-utils";

describe("MainLayout", () => {
  it("renders header", async () => {
    renderWithMemoryRouter(<MainLayout />);

    await waitFor(() => expect(screen.getByRole("heading", { name: /MAAS Site Manager/i })).toBeInTheDocument());
  });
});
