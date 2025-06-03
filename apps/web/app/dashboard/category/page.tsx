import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { PlusCircle } from "lucide-react";
import CategoryForm from "../_components/custom/category/form";
import { cookies } from "next/headers";
import CategoriesList from "../_components/custom/category/table";

export default async function CategoriesPage() {
  const cookieStore = await cookies();

  const category = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
    headers: {
      Cookie: cookieStore.toString(),
      "Content-Type": "application/json",
    },
  });

  const data = await category.json();

  return (
    <div className="px-10 py-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Categories & Subcategories</h1>
        {/* <Button asChild>
          <Link href="/dashboard/category/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Link>
        </Button> */}
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <div className="flex items-top justify-between gap-4">
          <CategoryForm />
          <CategoriesList />
        </div>
      </Suspense>
    </div>
  );
}
