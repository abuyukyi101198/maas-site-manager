// @ts-ignore
import { useImageTableColumns } from "./useImagesTableColumns";

import { screen, renderHook, render } from "@/utils/test-utils";

const renderUseImageTableColumns = () => {
  const setRowSelection = jest.fn();
  const setSidebar = jest.fn();

  const { result } = renderHook(() =>
    useImageTableColumns({
      setRowSelection,
      setSidebar,
    }),
  );

  return { result, setRowSelection, setSidebar };
};

it("returns the correct number of columns", () => {
  const { result } = renderUseImageTableColumns();
  expect(result.current.length).toBe(8);
});

it("first column has the correct id", () => {
  const { result } = renderUseImageTableColumns();

  expect(result.current[0].id).toBe("select");
});

it("size column formats bytes correctly", () => {
  const { result } = renderUseImageTableColumns();

  const sizeColumn = result.current.find((column) => column.id === "size");
  expect(sizeColumn).toBeDefined();
  // @ts-ignore
  const cellValue = sizeColumn.cell({ getValue: () => 1000 });

  expect(cellValue).toBe("1 KB");
});

it("custom column returns correct value for custom images", () => {
  const { result } = renderUseImageTableColumns();

  const customColumn = result.current.find((column) => column.id === "custom");
  // @ts-ignore
  const cellValue = customColumn.cell({ getValue: () => true });
  render(cellValue);

  expect(screen.getByLabelText("checked")).toBeInTheDocument();
});

it("action column calls setRowSelection and setSidebar on delete", () => {
  const { result, setRowSelection, setSidebar } = renderUseImageTableColumns();

  const actionColumn = result.current.find((column) => column.id === "action");
  // @ts-ignore
  render(actionColumn.cell({ getValue: () => "testId" }));
  screen.getByRole("button", { name: /delete/i }).click();

  expect(setRowSelection).toHaveBeenCalledWith({ testId: true });
  expect(setSidebar).toHaveBeenCalledWith("deleteImages");
});
