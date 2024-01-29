import { useMemo } from "react";

import { formatBytes } from "@canonical/maas-react-components";
import { Icon, Button } from "@canonical/react-components";
import type { ColumnDef, Row, Getter } from "@tanstack/react-table";

import type { ImagesTableProps } from "./ImagesTable";

import SelectAllCheckbox from "@/components/SelectAllCheckbox";
import SortIndicator from "@/components/base/SortIndicator";
import TableActions from "@/components/base/TableActions";
import type { Image } from "@/mocks/factories";
export type ImageColumnDef = ColumnDef<Image, Partial<Image>>;

export const useImageTableColumns = ({
  setRowSelection,
  setSidebar,
}: Pick<ImagesTableProps, "setRowSelection" | "setSidebar">) =>
  useMemo<ImageColumnDef[]>(
    () => [
      {
        id: "select",
        accessorKey: "id",
        enableSorting: false,
        header: ({ table }) => <SelectAllCheckbox table={table} tableId="images" />,
        cell: ({ row, getValue }: { row: Row<Image>; getValue: Getter<Image["name"]> }) => {
          return (
            <label className="p-checkbox--inline">
              <input
                aria-label={getValue()}
                className="p-checkbox__input"
                type="checkbox"
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />
              <span className="p-checkbox__label" />
            </label>
          );
        },
      },
      { id: "name", accessorKey: "name", enableSorting: true, header: () => "Name" },
      {
        id: "release",
        accessorKey: "release",
        enableSorting: true,
        header: ({ header }) => (
          <Button appearance="link" className="p-button--table-header">
            Release title <SortIndicator header={header} />
          </Button>
        ),
      },
      {
        id: "architecture",
        accessorKey: "architecture",
        enableSorting: false,
        header: () => "Architecture",
      },
      {
        id: "size",
        accessorKey: "size",
        enableSorting: false,
        header: () => "Size",
        cell: ({ getValue }: { getValue: Getter<Image["size"]> }) => {
          const { value, unit } = formatBytes({ value: getValue(), unit: "B" });
          return `${value} ${unit}`;
        },
      },
      {
        id: "status",
        accessorKey: "status",
        enableSorting: false,
        header: () => "Status",
      },
      {
        id: "custom",
        accessorKey: "is_custom_image",
        enableSorting: true,
        header: ({ header }) => (
          <Button appearance="link" className="p-button--table-header">
            Custom <SortIndicator header={header} />
          </Button>
        ),
        cell: ({ getValue }: { getValue: Getter<Image["is_custom_image"]> }) =>
          getValue() ? <Icon aria-label="checked" name="task-outstanding" role="img" /> : null,
      },
      {
        id: "action",
        accessorKey: "id",
        header: () => "Action",
        cell: ({ getValue }: { getValue: Getter<Image["id"]> }) => {
          const id = getValue();
          return (
            <TableActions
              className="u-align--right"
              hasBorder
              onDelete={() => {
                if (id) {
                  setRowSelection({ [id]: true });
                  setSidebar("deleteImages");
                }
              }}
            />
          );
        },
      },
    ],
    [setRowSelection, setSidebar],
  );
