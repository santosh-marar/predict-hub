"use client";

import { DataTable } from "@repo/ui/components/data-table";
import { categoryColumns } from "./column";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { DeleteConfirmationDialog } from "@/components/custom/delete-confirmation-dialog";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function CategoriesList() {
  const queryClient = useQueryClient();

  const getCategories = async () => {
    const response = await api.get("/category");
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
  });

  const categoriesData = data?.data;

  // Mutation for deleting a category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/category/${categoryId}`);
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-3">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load categories</AlertTitle>
          <AlertDescription>Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container">
      <DataTable
        columns={categoryColumns(handleDelete)}
        data={categoriesData}
      />
    </div>
  );
}
