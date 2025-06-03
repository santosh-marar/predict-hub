import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import SubCategoryForm from "@/app/dashboard/_components/custom/sub-category/form";

export default async function EditCategoryPage(props: {
  params: Promise<{ id: string }>; 
}) {
  const { id: categoryId } = await props.params;

  const cookieStore = await cookies();
  let initialData = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sub-category/${categoryId}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
          "Content-Type": "application/json",
        },
        // Optional: enable revalidation if needed
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch category");

    const json = await res.json();
    if (!json?.data) return notFound();

    initialData = json.data;
  } catch (error) {
    return notFound(); 
  }

  return (
    <div className="px-10 py-4">
      <h1 className="text-3xl font-bold mb-2">Edit Category</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <SubCategoryForm initialData={initialData} />
      </Suspense>
    </div>
  );
}
