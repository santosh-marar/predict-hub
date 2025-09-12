import { Suspense } from "react";
import { cookies } from "next/headers";
import SubCategoryForm from "../../_components/custom/sub-category/form";
import SubCategoriesList from "../../_components/custom/sub-category/table";

export default async function SubCategoriesPage() {
  //   const cookieStore = await cookies();

  //   const category = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-category`, {
  //     headers: {
  //       Cookie: cookieStore.toString(),
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   const data = await category.json();
  //   console.log(data)

  return (
    <div className="px-10 py-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Subcategories</h1>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <div className="flex items-top justify-between gap-4">
          <SubCategoryForm />
          <SubCategoriesList />
        </div>
      </Suspense>
    </div>
  );
}
