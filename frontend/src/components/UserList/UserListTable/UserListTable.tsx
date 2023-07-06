import type { Dispatch, SetStateAction } from "react";

import { Button, Icon } from "@canonical/react-components";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import type { SortingState, Column, ColumnDef } from "@tanstack/react-table";
import classNames from "classnames";
import pick from "lodash/fp/pick";

import type { User } from "@/api/types";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import TableCaption from "@/components/TableCaption/TableCaption";
import SortIndicator from "@/components/base/SortIndicator";
import type { useUsersQueryResult } from "@/hooks/react-query";

const createAccessor =
  <T, K extends keyof T>(keys: K[] | K) =>
  (row: T) =>
    pick(keys, row);

export type UserColumnDef = ColumnDef<User, Partial<User>>;
export type UserColumn = Column<User, unknown>;

type SortProps = {
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
};

const UserListTable = ({
  data,
  error,
  isLoading,
  setSorting,
  sorting,
}: Pick<useUsersQueryResult, "data" | "error" | "isLoading"> & SortProps) => {
  const [isShowingFullName, setIsShowingFullName] = useState(false);

  const columns = useMemo<UserColumnDef[]>(
    () => [
      {
        id: isShowingFullName ? "full_name" : "username",
        enableSorting: false,
        header: ({ header, column }) => (
          <div>
            <Button
              appearance="link"
              className="p-button--table-header"
              onClick={() => {
                if (isShowingFullName) {
                  setIsShowingFullName(false);
                } else {
                  column.toggleSorting();
                }
              }}
            >
              Username
              {!isShowingFullName && (
                <>
                  {" "}
                  <SortIndicator header={header} />
                </>
              )}
            </Button>{" "}
            |{" "}
            <Button
              appearance="link"
              className="p-button--table-header"
              onClick={() => {
                if (!isShowingFullName) {
                  setIsShowingFullName(true);
                } else {
                  column.toggleSorting();
                }
              }}
            >
              Full name {isShowingFullName && <SortIndicator header={header} />}
            </Button>
          </div>
        ),
        accessorKey: isShowingFullName ? "full_name" : "username",
        accessorFn: createAccessor(["full_name", "username"]),
        cell: ({ getValue }) => {
          if (isShowingFullName) {
            const { full_name } = getValue();
            return <div>{full_name ? full_name : <>&mdash;</>}</div>;
          } else {
            const { username } = getValue();
            return <div>{username}</div>;
          }
        },
      },
      {
        id: "email",
        accessorKey: "email",
        enableSorting: true,
        header: ({ header }) => (
          <div>
            Email <SortIndicator header={header} />
          </div>
        ),
        accessorFn: createAccessor("email"),
        cell: ({ getValue }) => {
          const { email } = getValue();
          return <div>{email}</div>;
        },
      },
      {
        id: "is_admin",
        accessorKey: "is_admin",
        enableSorting: false,
        header: () => <div>Role</div>,
        accessorFn: createAccessor("is_admin"),
        cell: ({ getValue }) => {
          const { is_admin } = getValue();
          return <div>{is_admin ? "Admin" : "User"}</div>;
        },
      },
      {
        id: "actions",
        accessorKey: "username",
        accessorFn: createAccessor("username"),
        enableSorting: false,
        header: () => <div>Actions</div>,
        cell: ({ getValue }) => {
          const username = getValue().username as string;
          const editLabel = `Edit ${username}`;
          const deleteLabel = `Delete ${username}`;
          return (
            <div>
              <Button appearance="base" aria-label={editLabel} className="is-dense u-table-cell-padding-overlap">
                <Icon name="edit" />
              </Button>
              <Button appearance="base" aria-label={deleteLabel} className="is-dense u-table-cell-padding-overlap">
                <Icon name="delete" />
              </Button>
            </div>
          );
        },
      },
    ],
    [isShowingFullName],
  );

  const noItems = useMemo<User[]>(() => [], []);
  const pageCount = data && "total" in data ? Math.ceil(data.total / data.size) : 0;
  const pageIndex = data && "page" in data ? data.page : 0;
  const pageSize = data && "size" in data ? data.size : 0;
  const userTable = useReactTable<User>({
    data: data?.items || noItems,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
    },
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    enableSorting: true,
  });

  return (
    <DynamicTable aria-label="users" className="user-list__table">
      <thead>
        {userTable.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={classNames(header.column.id, { "p-button--table-header": header?.column?.getCanSort() })}
                colSpan={header.colSpan}
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {error ? (
        <TableCaption>
          <TableCaption.Error error={error} />
        </TableCaption>
      ) : isLoading ? (
        <TableCaption>
          <TableCaption.Loading />
        </TableCaption>
      ) : (
        <DynamicTable.Body>
          {userTable.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
              })}
            </tr>
          ))}
        </DynamicTable.Body>
      )}
    </DynamicTable>
  );
};

export default UserListTable;
