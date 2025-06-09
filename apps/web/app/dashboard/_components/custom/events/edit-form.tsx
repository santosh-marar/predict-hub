"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

const eventFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().min(1, "End time is required"),
  resolutionTime: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "active", "ended", "resolved", "cancelled"]),
  totalVolume: z.string(),
  totalYesShares: z.string(),
  totalNoShares: z.string(),
  yesPrice: z.string(),
  noPrice: z.string(),
  resolvedOutcome: z.boolean().optional(),
  resolutionNotes: z.string().optional(),
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
  sourceOfTruth: z.string().url(),
  rules: z.string(),
  eventOverviewAndStatistics: z.string(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventEditFormProps {
  initialData: any; // Using any to handle the API response format
}

// Helper function to convert ISO date to datetime-local format
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
};

export default function EventEditForm({ initialData }: EventEditFormProps) {
  const [newTag, setNewTag] = useState("");
  const queryClient = useQueryClient();

  // Process the initial data to match form expectations
  const processedInitialData = {
    id: initialData.id || "",
    title: initialData.title || "",
    description: initialData.description || "",
    imageUrl: initialData.imageUrl || "",
    categoryId: initialData.categoryId || undefined,
    subCategoryId: initialData.subCategoryId || undefined,
    startTime: formatDateForInput(initialData.startTime),
    endTime: formatDateForInput(initialData.endTime),
    resolutionTime: formatDateForInput(initialData.resolutionTime),
    status: initialData.status || "draft",
    totalVolume: String(initialData.totalVolume || "0"),
    totalYesShares: String(initialData.totalYesShares || "0"),
    totalNoShares: String(initialData.totalNoShares || "0"),
    yesPrice: String(initialData.yesPrice || "0"),
    noPrice: String(initialData.noPrice || "0"),
    resolvedOutcome: initialData.resolvedOutcome || false,
    resolutionNotes: initialData.resolutionNotes || "",
    tags: Array.isArray(initialData.tags) ? initialData.tags : [],
    isPublic: Boolean(initialData.isPublic),
    isFeatured: Boolean(initialData.isFeatured),
    sourceOfTruth: initialData.sourceOfTruth || "",
    rules: initialData.rules || "",
    eventOverviewAndStatistics: initialData.eventOverviewAndStatistics || "",
  } as EventFormData;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: processedInitialData,
  });

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const mutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      // const apiData = {
      //   ...data,
      //   startTime: data.startTime
      //     ? new Date(data.startTime).toISOString()
      //     : null,
      //   endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
      //   resolutionTime: data.resolutionTime
      //     ? new Date(data.resolutionTime).toISOString()
      //     : null,
      // };

      const response = await api.put(`/event/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event"] });
      toast.success(`Event updated successfully!`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    },
  });

  const onSubmit = (data: EventFormData) => {
    
    mutation.mutate(data);
  };

  const isLoading = mutation.isPending;

  return (
    <Card className="w-full max-w-4xl rounded-sm">
      <CardHeader>
        <CardTitle>Update Event</CardTitle>
        <CardDescription>Edit prediction market events</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Event description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceOfTruth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source of Truth</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rules"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventOverviewAndStatistics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Overview and Statistics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Event Overview and Statistics"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                        />
                        <Button type="button" onClick={addTag} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolutionTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Trading Mechanics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FormField
                control={form.control}
                name="totalVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Volume</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalYesShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yes Shares</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalNoShares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Shares</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yesPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yes Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resolvedOutcome"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Resolved as YES</FormLabel>
                      <FormDescription>
                        Check if the event resolved as YES
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolutionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resolution explanation"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings */}
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Public Event</FormLabel>
                      <FormDescription>
                        Make this event visible to all users
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Event</FormLabel>
                      <FormDescription>
                        Highlight this event on the homepage
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating..." : "Update Event"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
