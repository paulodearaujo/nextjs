"use client";

import * as React from "react";
import {type ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, type SortingState, useReactTable} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {DateRangePicker} from "@/components/ui/date-picker-range";
import {filterByDateRange} from "@/lib/utils";
import type {DateRange} from "react-day-picker";
import {Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious} from "@/components/ui/pagination";

interface DataTableProps<TData> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    columns: ColumnDef<TData, any>[];
    data: TData[];
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

    const table = useReactTable({
        data: filterByDateRange(
            data,
            dateRange ? { from: dateRange.from ?? new Date(0), to: dateRange.to ?? new Date() } : { from: new Date(0), to: new Date() },
            "lastUpdated" as keyof TData
        ),
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <div>
      <DateRangePicker range={dateRange} setRange={setDateRange} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationPrevious onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
              {table.getPageOptions().map((pageIndex) => (
                  <PaginationItem key={pageIndex}>
                <PaginationLink isActive={pageIndex === table.getState().pagination.pageIndex} onClick={() => table.setPageIndex(pageIndex)}>
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
              ))}
              <PaginationNext onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
    );
}
