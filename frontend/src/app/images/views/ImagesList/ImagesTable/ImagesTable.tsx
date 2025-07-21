import { useMemo } from "react";

import { Button } from "@canonical/react-components";
import type {
  ColumnDef,
  Column,
  GroupingState,
  SortingState,
  OnChangeFn,
  ExpandedState,
  Row,
  Header,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  flexRender,
  getExpandedRowModel,
} from "@tanstack/react-table";
import classNames from "classnames";
import "./ImagesTable.scss";
import { random } from "lodash";

import useImagesTableColumns from "./useImagesTableColumns";

import type { BootAsset, Image } from "@/app/api";
import type { ImagesSortKey, SortBy } from "@/app/api/handlers";
import DynamicTable from "@/app/base/components/DynamicTable";
import SortIndicator from "@/app/base/components/SortIndicator";
import TableCaption from "@/app/base/components/TableCaption";
import { useImagesInfiniteQuery } from "@/app/base/hooks/react-query";
import { useAppLayoutContext, useRowSelection } from "@/app/context";
import { getSortBy } from "@/utils";
export type ImageColumnDef = ColumnDef<Image, Partial<Image>>;
export type ImageColumn = Column<Image>;

type UseImagesQueryResult = ReturnType<typeof useImagesInfiniteQuery>;
export type ImagesTableProps = {
  data?: UseImagesQueryResult["data"];
  error?: UseImagesQueryResult["error"];
  isPending: UseImagesQueryResult["isPending"];
  setSidebar: ReturnType<typeof useAppLayoutContext>["setSidebar"];
  rowSelection: ReturnType<typeof useRowSelection>["rowSelection"];
  setRowSelection: ReturnType<typeof useRowSelection>["setRowSelection"];
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
};

// Filter out the name column from the header
const filterHeaders = (header: Header<Image, unknown>) => header.column.id !== "os";
// Filter out the name column from individual cells
const filterCells = (row: Row<Image>, column: Column<Image>) => {
  if (row.getIsGrouped()) {
    return ["select", "os", "action"].includes(column.id);
  } else {
    return column.id !== "os";
  }
};

// TODO: remove when the missing fields are added to BootAsset
const addMissingBootAssetFields = (data: { items: BootAsset[] }): Image[] => {
  return data?.items.map((item) => {
    return {
      ...item,
      downloaded: [0, 50, 100][random(0, 2, false)],
      size: random(1, 10, true),
      is_custom_image: random(0, 1, false) === 0,
    } as unknown as Image;
  });
};

export const ImagesTable: React.FC<ImagesTableProps> = ({
  data,
  error,
  isPending,
  setSidebar,
  rowSelection,
  setRowSelection,
  sorting,
  setSorting,
}) => {
  const columns = useImagesTableColumns();
  const noItems = useMemo<Image[]>(() => [], []);

  const [grouping, setGrouping] = useState<GroupingState>(["os"]);
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const table = useReactTable<Image>({
    data: data?.items ? addMissingBootAssetFields(data) : noItems,
    columns,
    state: {
      rowSelection,
      grouping,
      expanded,
      sorting,
    },
    manualPagination: true,
    autoResetExpanded: false,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    manualSorting: true,
    enableSorting: true,
    enableExpanding: true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    groupedColumnMode: false,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => `${row.id}`,
  });

  return (
    <DynamicTable aria-label="images" className="p-table-dynamic--with-select images-table">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.filter(filterHeaders).map((header) => (
              <th className={classNames(`${header.column.id}`)} key={header.id}>
                {header.column.getCanSort() ? (
                  <Button
                    appearance="link"
                    className="p-button--table-header"
                    onClick={header.column.getToggleSortingHandler()}
                    type="button"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIndicator header={header} />
                  </Button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {error ? (
        <TableCaption>
          <TableCaption.Error error={error} />
        </TableCaption>
      ) : isPending ? (
        <DynamicTable.Loading table={table} />
      ) : table.getRowModel().rows.length < 1 ? (
        <TableCaption>
          <TableCaption.Title>No images</TableCaption.Title>
          <TableCaption.Description>
            There are no images stored in Site Manager at the moment. You can either upload images, or connect to an
            upstream image source to download images from.
          </TableCaption.Description>
          <TableCaption.Description>
            <Button
              onClick={() => {
                setSidebar("uploadImage");
              }}
            >
              Upload image
            </Button>
            <Button
              onClick={() => {
                setSidebar("downloadImages");
              }}
            >
              Download images
            </Button>
          </TableCaption.Description>
        </TableCaption>
      ) : (
        <DynamicTable.Body>
          {table.getRowModel().rows.map((row) => {
            const { getIsGrouped, id, index, getVisibleCells } = row;
            const isIndividualRow = !getIsGrouped();
            return (
              <tr
                className={classNames({
                  "individual-row": isIndividualRow,
                  "group-row": !isIndividualRow,
                })}
                key={id + index}
              >
                {getVisibleCells()
                  .filter((cell) => filterCells(row, cell.column))
                  .map((cell) => {
                    const { column, id: cellId } = cell;
                    return (
                      <td className={classNames(`${cell.column.id}`)} key={cellId}>
                        {flexRender(column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
              </tr>
            );
          })}
        </DynamicTable.Body>
      )}
    </DynamicTable>
  );
};

export const ImagesTableContainer = () => {
  const { setSidebar } = useAppLayoutContext();
  const { rowSelection, setRowSelection } = useRowSelection("images", { clearOnUnmount: true });
  const [sorting, setSorting] = useState<SortingState>([{ id: "codename", desc: false }]);
  const sortBy = getSortBy(sorting) as SortBy<ImagesSortKey>;
  const { data, error, isPending } = useImagesInfiniteQuery({ sortBy });

  return (
    <ImagesTable
      data={data}
      error={error}
      isPending={isPending}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      setSidebar={setSidebar}
      setSorting={setSorting}
      sorting={sorting}
    />
  );
};

export default ImagesTableContainer;
