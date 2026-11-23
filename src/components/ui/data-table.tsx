import * as React from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  toolbarExtra?: React.ReactNode;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  toolbarExtra,
  isLoading = false,
  emptyState,
  pageSizeOptions = [10, 20, 50],
  className,
}: DataTableProps<TData, TValue>) {
  const pageCount = Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange(next);
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min(totalCount, (pageIndex + 1) * pageSize);

  return (
    <div className={cn("space-y-4", className)}>
      {(onSearchChange || toolbarExtra) && (
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbarExtra && (
            <div className="flex flex-wrap items-center gap-2">
              {toolbarExtra}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort && onSortingChange ? (
                        <Button
                          type="button"
                          variant="ghost"
                          color="secondary"
                          size="sm"
                          className="-ml-3 h-8 px-2 font-semibold text-default-700 hover:bg-muted hover:text-default-900"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {sorted === "asc" ? (
                            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIdx) => (
                <TableRow key={`skeleton-row-${rowIdx}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={`skeleton-cell-${rowIdx}-${colIdx}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyState ?? "Tidak ada data yang cocok."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-default-900">
            {startItem}-{endItem}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-default-900">{totalCount}</span>{" "}
          entri
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Baris:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                onPaginationChange({ pageIndex: 0, pageSize: Number(value) })
              }
            >
              <SelectTrigger className="h-8 w-[76px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs font-medium text-default-700">
            Halaman {pageIndex + 1} dari {pageCount}
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
              disabled={pageIndex === 0 || isLoading}
              aria-label="Halaman pertama"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onPaginationChange({
                  pageIndex: Math.max(0, pageIndex - 1),
                  pageSize,
                })
              }
              disabled={pageIndex === 0 || isLoading}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onPaginationChange({
                  pageIndex: Math.min(pageCount - 1, pageIndex + 1),
                  pageSize,
                })
              }
              disabled={pageIndex >= pageCount - 1 || isLoading}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                onPaginationChange({ pageIndex: pageCount - 1, pageSize })
              }
              disabled={pageIndex >= pageCount - 1 || isLoading}
              aria-label="Halaman terakhir"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
