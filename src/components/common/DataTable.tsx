import React, { type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, idx: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  mobileHide?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, idx: number) => string | number;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  className = "",
  stickyHeader = false,
}: DataTableProps<T>) {
  return (
    <div
      className={[
        "overflow-x-auto rounded-2xl border border-[#E5EAE6] bg-white shadow-xs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <table className="w-full min-w-[500px] border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-[#E5EAE6] bg-[#F5F7F5]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  "px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#78827C]",
                  stickyHeader ? "sticky top-0 bg-[#F5F7F5]" : "",
                  col.mobileHide ? "hidden sm:table-cell" : "",
                  col.headerClassName ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAE6]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-4 py-3",
                      col.mobileHide ? "hidden sm:table-cell" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="h-4 animate-pulse rounded bg-[#E5EAE6]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center">
                {emptyState ?? (
                  <span className="text-[11px] text-[#78827C]">
                    Tidak ada data
                  </span>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                className="transition-colors hover:bg-[#F5F7F5]"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-4 py-3 text-[#202824]",
                      col.mobileHide ? "hidden sm:table-cell" : "",
                      col.className ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {col.cell(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
