"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import Link from "next/link";
import { DeleteConfirmationDialog } from "@/components/custom/delete-confirmation-dialog";
import { format } from "date-fns";

// Define the category type
export type EventColumn = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  parentCategory?: string;
  categoryTitle: string;
  subCategoryTitle: string;
  startTime: string;
  endTime: string;
  resolutionDate: string;
};

export const eventColumns = (
  handleDelete: (id: string) => void,
): ColumnDef<EventColumn>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryTitle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span>{row.getValue("categoryTitle")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "subCategoryTitle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subcategory
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span>{row.getValue("subCategoryTitle")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("startTime");
      if (
        !dateValue ||
        (typeof dateValue !== "string" &&
          typeof dateValue !== "number" &&
          !(dateValue instanceof Date))
      ) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">-</span>
          </div>
        );
      }

      const formattedDate = format(
        new Date(dateValue),
        "MMM dd, yyyy, hh:mm a",
      );

      return (
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "endTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("endTime");

      if (
        !dateValue ||
        (typeof dateValue !== "string" &&
          typeof dateValue !== "number" &&
          !(dateValue instanceof Date))
      ) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">-</span>
          </div>
        );
      }

      const formattedDate = format(
        new Date(dateValue),
        "MMM dd, yyyy, hh:mm a",
      );

      return (
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "resolutionTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resolution Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("resolutionTime");

      if (
        !dateValue ||
        (typeof dateValue !== "string" &&
          typeof dateValue !== "number" &&
          !(dateValue instanceof Date))
      ) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">-</span>
          </div>
        );
      }

      const formattedDate = format(
        new Date(dateValue),
        "MMM dd, yyyy, hh:mm a",
      );

      return (
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DeleteConfirmationDialog
              onConfirm={() => handleDelete(event.id)}
              itemName="Event"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
