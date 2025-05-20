import PaginationBar from "./PaginationBar";

import { render, screen } from "@/utils/test-utils";

it("should render the PaginationBar component correctly", () => {
  render(
    <PaginationBar
      currentPage={1}
      dataContext="tokens"
      handlePageSizeChange={vi.fn()}
      isPending={false}
      itemsPerPage={10}
      setCurrentPage={vi.fn()}
      totalItems={50}
    />,
  );
  expect(screen.getByRole("combobox", { name: /items per page/i })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
  expect(screen.getByText(/showing/i)).toBeInTheDocument();
});
