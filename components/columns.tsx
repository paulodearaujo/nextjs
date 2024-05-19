// src/components/columns.tsx

"use client";

import type {ColumnDef} from "@tanstack/react-table";
import type {Opportunity} from "@/types";

export const columns: ColumnDef<Opportunity>[] = [
    {
        accessorKey: "urlFrom",
        header: "From URL",
        cell: ({ row }) => (
            <a href={row.original.urlFrom} target="_blank" rel="noopener noreferrer">
        {row.original.urlFrom}
      </a>
        ),
    },
    {
        accessorKey: "anchorContext",
        header: "Context",
    },
    {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => {
            const date = new Date(row.original.lastUpdated);
            return date.toLocaleDateString();
        },
    },
];
