import { RowSelectionContextProviders, useRowSelection } from "@/context/RowSelectionContext/RowSelectionContext";
import { userEvent, screen, render } from "@/utils/test-utils";

const renderTestComponent = ({ clearOnUnmount }: { clearOnUnmount: boolean }) => {
  const TestComponent = ({ clearOnUnmount }: { clearOnUnmount: boolean }) => {
    const { rowSelection, setRowSelection } = useRowSelection("sites", { clearOnUnmount });
    const handleClick = () => {
      setRowSelection({ row: true });
    };
    return (
      <div>
        {rowSelection.row ? "Row selected" : "Row not selected"}
        <button onClick={handleClick}>Select row</button>
      </div>
    );
  };
  const { rerender } = render(
    <RowSelectionContextProviders>
      <TestComponent clearOnUnmount={clearOnUnmount} />
    </RowSelectionContextProviders>,
  );
  const unmount = () => {
    rerender(<RowSelectionContextProviders></RowSelectionContextProviders>);
  };
  const rerenderTestComponent = () => {
    rerender(
      <RowSelectionContextProviders>
        <TestComponent clearOnUnmount={clearOnUnmount} />
      </RowSelectionContextProviders>,
    );
  };
  return { unmount, rerender: rerenderTestComponent };
};

it("can persist row selection on unmount", async () => {
  const { unmount, rerender } = renderTestComponent({ clearOnUnmount: false });
  await userEvent.click(screen.getByText("Select row"));
  expect(screen.getByText("Row selected")).toBeInTheDocument();
  unmount();
  rerender();
  expect(screen.getByText("Row selected")).toBeInTheDocument();
});

it("can clear row selection on unmount", async () => {
  const { unmount, rerender } = renderTestComponent({ clearOnUnmount: true });
  await userEvent.click(screen.getByText("Select row"));
  expect(screen.getByText("Row selected")).toBeInTheDocument();
  unmount();
  rerender();
  expect(screen.getByText("Row not selected")).toBeInTheDocument();
});
