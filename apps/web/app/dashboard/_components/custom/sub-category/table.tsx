"use client";

import { DataTable } from "@repo/ui/components/data-table";
import { subCategoryColumns } from "./column";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function SubCategoriesList() {
  const queryClient = useQueryClient();

  const getSubCategories = async () => {
    const response = await api.get("/sub-category");
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["sub-category"],
    queryFn: getSubCategories,
  });

  const subCategoriesData = data?.data;

  // Mutation for deleting a subCategory
  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (subCategoryId: string) => {
      await api.delete(`/sub-category/${subCategoryId}`);
    },
    onSuccess: () => {
      toast.success("Subcategory deleted");
      queryClient.invalidateQueries({ queryKey: ["sub-category"] });
    },
    onError: () => {
      toast.error("Failed to delete subcategory");
    },
  });

  const handleDelete = (subCategoryId: string) => {
    deleteSubCategoryMutation.mutate(subCategoryId);
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
        columns={subCategoryColumns(handleDelete)}
        data={subCategoriesData}
      />
    </div>
  );
}
