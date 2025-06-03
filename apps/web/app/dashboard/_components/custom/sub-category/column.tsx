"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Badge } from "@repo/ui/components/badge";
import Link from "next/link";
import { DeleteConfirmationDialog } from "@/components/custom/delete-confirmation-dialog";

// Define the category type
export type SubCategoryColumn = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  type: "category" | "subcategory";
  parentCategory?: string;
  categoryId: string;
};

export const subCategoryColumns = (
  handleDelete: (id: string) => void
): ColumnDef<SubCategoryColumn>[] => [
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
      const type = row.original.type;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("title")}</span>
          {type === "subcategory" && (
            <Badge variant="outline" className="ml-2">
              Subcategory
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryTitle",
    header: "Category",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");

      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subCategory = row.original;

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
                href={`/dashboard/category/sub-category/${subCategory.id}/edit`}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DeleteConfirmationDialog
              onConfirm={() => handleDelete(subCategory.id)}
              itemName="Subcategory"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
