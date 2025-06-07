"use client";

import { DataTable } from "@repo/ui/components/data-table";
import { eventColumns } from "./column";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function EventsList() {
  const queryClient = useQueryClient();

  const getEvents = async () => {
    const response = await api.get("/event");
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["event"],
    queryFn: getEvents,
  });

  const EventsData = data?.data;

  // Mutation for deleting a event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/event/${eventId}`);
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const handleDelete = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
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
      <DataTable columns={eventColumns(handleDelete)} data={EventsData} />
    </div>
  );
}
