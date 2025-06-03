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

// Category form schema - make isActive required to match the form expectations
const categoryFormSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean()
});

// Define the form values type explicitly
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
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const isEditMode = !!initialData;

  const queryClient = useQueryClient();

  // Use the explicit type for useForm
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
      const response = await api.post("/category", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      toast.success(
        `Category ${isEditMode ? "updated" : "created"} successfully!`
      );
      if (!isEditMode) {
        form.reset({
          title: "",
          description: "",
          imageUrl: "",
          isActive: true,
        });
        setImagePreview(null);
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

  // All states available:
  const isLoading = mutation.isPending;
  const isError = mutation.isError;
  const isSuccess = mutation.isSuccess;
  const isIdle = mutation.isIdle;
  const error = mutation.error;
  const data = mutation.data;

  return (
    <Card className="w-full max-w-2xl rounded-xs">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Category" : "Create New Category"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input type="file" accept="image/*" disabled={isLoading} />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Preview:
                      </p>
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Category preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
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
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : isEditMode
              ? "Update Category"
              : "Create Category"}
        </Button>
      </CardFooter>
    </Card>
  );
}
