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
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import api from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { deleteImageFromSupabase, uploadImageToSupabase } from "@/lib/image";
import { ImageSelector } from "@/components/custom/image-uploader";

const subCategoryFormSchema = z.object({
  categoryId: z.string().min(1, "Please select a parent category"),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
});

type SubCategoryFormValues = {
  categoryId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

interface SubCategoryFormProps {
  initialData?: {
    id?: string;
    categoryId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  };
}

export default function SubCategoryForm({ initialData }: SubCategoryFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const queryClient = useQueryClient();
  
  // Track selected file separately from form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  // Fetch categories for the dropdown
  const getCategories = async () => {
    const response = await api.get("/category");
    return response.data;
  };

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
  });

  const categories = categoriesData?.data;

  const mutation = useMutation({
    mutationFn: async (data: SubCategoryFormValues) => {
      let finalData = { ...data };

      // Upload image first if there's a selected file
      if (selectedFile) {
        try {
          const imageUrl = await uploadImageToSupabase(selectedFile, 'sub-categories', 'images');
          finalData.imageUrl = imageUrl;
          
          // Delete old image if updating and there was an existing image
          if (isEditMode && initialData?.imageUrl && initialData.imageUrl !== imageUrl) {
            await deleteImageFromSupabase(initialData.imageUrl, 'sub-categories');
          }
        } catch (error: any) {
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      // Make API call with the data including the new image URL
      if (isEditMode && initialData?.id) {
        const response = await api.put(`/sub-category/${initialData.id}`, finalData);
        return response.data;
      } else {
        const response = await api.post("/sub-category", finalData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-category"] });
      toast.success(
        `Sub-category ${isEditMode ? "updated" : "created"} successfully!`
      );
      
      if (!isEditMode) {
        form.reset({
          categoryId: "",
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

  const onSubmit = (data: SubCategoryFormValues) => {
    console.log('Sub-category form data being submitted:', {
      formData: data,
      selectedFile: selectedFile?.name || 'No file selected'
    });
    mutation.mutate(data);
  };

  const isLoading = mutation.isPending;

  return (
    <Card className="w-full max-w-2xl rounded-xs">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Sub-category" : "Create New Sub-category"}
        </CardTitle>
        <CardDescription>
          {isEditMode 
            ? "Update your sub-category information" 
            : "Add a new sub-category under a parent category"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the parent category for this sub-category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter sub-category title"
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
                      placeholder="Enter sub-category description (optional)"
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of this sub-category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Sub-category Image</FormLabel>
              <FormControl>
                <ImageSelector  
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  existingImageUrl={form.getValues('imageUrl')}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Select an image to upload when you save the sub-category
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
                      When active, this sub-category will be visible to users
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
            ? selectedFile ? "Uploading..." : "Saving..."
            : isEditMode
              ? "Update Sub-category"
              : "Create Sub-category"}
        </Button>
      </CardFooter>
    </Card>
  );
}