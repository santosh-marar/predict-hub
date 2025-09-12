import { Suspense } from "react";
import { notFound } from "next/navigation";
import EventEditForm from "../../../_components/custom/events/edit-form";
import { cookies } from "next/headers";

export default async function EditEventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await props.params;

  const cookieStore = await cookies();
  let initialData = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/event/${eventId}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
          "Content-Type": "application/json",
        },
        // Optional: enable revalidation if needed
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch event");

    const json = await res.json();
    if (!json?.data) return notFound();

    initialData = json.data;
  } catch (error) {
    return notFound();
  }

  return (
    <div className="px-12 py-8">
      <Suspense fallback={<div>Loading form...</div>}>
        <EventEditForm initialData={initialData} />
      </Suspense>
    </div>
  );
}
