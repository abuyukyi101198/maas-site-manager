import useImagesTableColumns from "./useImagesTableColumns";

import { screen, renderHook, render, waitFor } from "@/utils/test-utils";

vi.mock("@/context", async () => {
  const actual = await vi.importActual("@/context");
  return {
    ...actual!,
    useAppLayoutContext: () => ({
      setSidebar: vi.fn(),
    }),
  };
});

const setupTestCase = (codename = "test-row") => {
  const { result } = renderHook(() => useImagesTableColumns());
  const props = {
    getValue: () => codename,
    row: {
      original: { os: codename },
      getIsSelected: vi.fn(() => false),
      getCanSelect: vi.fn(() => true),
      getToggleSelectedHandler: vi.fn(() => () => {}),
      getIsGrouped: vi.fn(() => false),
    },
  };

  return { result, props };
};

it("returns the correct number of columns", () => {
  const { result } = setupTestCase();
  expect(result.current).toBeInstanceOf(Array);
  expect(result.current.map((column) => column.id)).toStrictEqual([
    "select",
    "os",
    "release",
    "arch",
    "size",
    "status",
    "custom",
    "action",
  ]);
});

it("input has correct accessible label", () => {
  const { result, props } = setupTestCase("Ubuntu");

  const selectColumn = result.current.find((column) => column.id === "select");
  // @ts-expect-error-next-line
  const cellValue = selectColumn.cell(props);
  render(cellValue);
  const inputElement = screen.getByRole("checkbox");
  expect(inputElement).toHaveAccessibleName("Ubuntu");
});

it("size column formats bytes correctly", () => {
  const { result } = setupTestCase();

  const sizeColumn = result.current.find((column) => column.id === "size");
  expect(sizeColumn).toBeDefined();
  // @ts-expect-error-next-line
  const cellValue = sizeColumn.cell({ getValue: () => 1000 });

  expect(cellValue).toBe("1 KB");
});

it("custom column returns correct value for custom images", () => {
  const { result } = setupTestCase();

  const customColumn = result.current.find((column) => column.id === "custom");
  // @ts-expect-error-next-line
  render(customColumn.cell({ getValue: () => true }));

  expect(screen.getByLabelText("checked")).toBeInTheDocument();
});

it("action column toggles row selection on delete", async () => {
  const toggleSelected = vi.fn();
  const { result, props } = setupTestCase();

  const actionColumn = result.current.find((column) => column.id === "action");
  // @ts-expect-error-next-line
  render(actionColumn.cell({ ...props, row: { ...props.row, toggleSelected } }));
  screen.getByRole("button", { name: /delete/i }).click();

  await waitFor(() => expect(toggleSelected).toHaveBeenCalled());
});
