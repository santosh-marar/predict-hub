"use client";

import type React from "react";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Switch } from "@repo/ui/components/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { deleteImageFromSupabase, uploadImageToSupabase } from "@/lib/image";
import { ImageSelector } from "@/components/custom/image-uploader";

// Category form schema
const categoryFormSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = {
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

interface CategoryFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const queryClient = useQueryClient();

  // Track selected file separately from form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      let finalData = { ...data };

      if (selectedFile) {
        try {
          const imageUrl = await uploadImageToSupabase(selectedFile);
          finalData.imageUrl = imageUrl;

          // Delete old image if updating and there was an existing image
          if (
            isEditMode &&
            initialData?.imageUrl &&
            initialData.imageUrl !== imageUrl
          ) {
            await deleteImageFromSupabase(initialData.imageUrl);
          }
        } catch (error: any) {
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      if (isEditMode && initialData?.id) {
        const response = await api.put(
          `/category/${initialData.id}`,
          finalData,
        );
        return response.data;
      } else {
        const response = await api.post("/category", finalData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      toast.success(
        `Category ${isEditMode ? "updated" : "created"} successfully!`,
      );

      if (!isEditMode) {
        form.reset({
          title: "",
          description: "",
          imageUrl: "",
          isActive: true,
        });
        setSelectedFile(null);
      } else {
        router.back();
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutation.mutate(data);
  };

  const isLoading = mutation.isPending;

  return (
    <Card className="w-full max-w-2xl rounded-xs">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Category" : "Create New Category"}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update your category information"
            : "Add a new category to your collection"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category title"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description (optional)"
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <ImageSelector
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  existingImageUrl={form.getValues("imageUrl")}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Select an image to upload when you save the category
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      When active, this category will be visible to users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading
            ? selectedFile
              ? "Uploading..."
              : "Saving..."
            : isEditMode
              ? "Update Category"
              : "Create Category"}
        </Button>
      </CardFooter>
    </Card>
  );
}
