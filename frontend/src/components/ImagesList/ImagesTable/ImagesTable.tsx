import { useMemo } from "react";

import { Button } from "@canonical/react-components";
import type { ColumnDef, Column } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel, flexRender, getExpandedRowModel } from "@tanstack/react-table";

import { useImageTableColumns } from "./useImagesTableColumns";

import DynamicTable from "@/components/DynamicTable";
import TableCaption from "@/components/TableCaption";
import { useAppLayoutContext, useRowSelection } from "@/context";
import { useImagesQuery } from "@/hooks/react-query";
import type { Image } from "@/mocks/factories";
export type ImageColumnDef = ColumnDef<Image, Partial<Image>>;
export type ImageColumn = Column<Image, unknown>;

const DEFAULT_PAGE_SIZE = 50;

export type ImagesTableProps = {
  data?: ReturnType<typeof useImagesQuery>["data"];
  error?: ReturnType<typeof useImagesQuery>["error"];
  isPending: ReturnType<typeof useImagesQuery>["isPending"];
  setSidebar: ReturnType<typeof useAppLayoutContext>["setSidebar"];
  rowSelection: ReturnType<typeof useRowSelection>["rowSelection"];
  setRowSelection: ReturnType<typeof useRowSelection>["setRowSelection"];
};

export const ImagesTable: React.FC<ImagesTableProps> = ({
  data,
  error,
  isPending,
  setSidebar,
  rowSelection,
  setRowSelection,
}) => {
  const columns = useImageTableColumns({ setSidebar, setRowSelection });
  const noItems = useMemo<Image[]>(() => [], []);
  const table = useReactTable<Image>({
    data: data?.items ? data.items : noItems,
    columns,
    state: {
      rowSelection,
    },
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => `${row.id}`,
    enableSorting: true,
  });

  return (
    <DynamicTable aria-label="images" className="p-table-dynamic--with-select">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                {flexRender(header.column.columnDef.header, header.getContext())}
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
        <TableCaption>
          <TableCaption.Loading />
        </TableCaption>
      ) : table.getRowModel().rows.length < 1 ? (
        <TableCaption>
          <TableCaption.Title>No images</TableCaption.Title>
          <TableCaption.Description>
            There are no images stored in Site Manager at the moment. You can either upload images, or connect to an
            upstream image source to download images from.
          </TableCaption.Description>
          <TableCaption.Description>
            <Button onClick={() => setSidebar("uploadImage")}>Upload image</Button>
            <Button onClick={() => setSidebar("downloadImages")}>Download images</Button>
          </TableCaption.Description>
        </TableCaption>
      ) : (
        <DynamicTable.Body>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </DynamicTable.Body>
      )}
    </DynamicTable>
  );
};

export const ImagesTableContainer = () => {
  const { rowSelection, setRowSelection } = useRowSelection("images", { clearOnUnmount: true });
  const { data, error, isPending } = useImagesQuery({ page: 1, size: DEFAULT_PAGE_SIZE });
  const { setSidebar } = useAppLayoutContext();

  return (
    <ImagesTable
      data={data}
      error={error}
      isPending={isPending}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      setSidebar={setSidebar}
    />
  );
};

export default ImagesTableContainer;
