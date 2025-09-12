import { Suspense } from "react";
import CategoryForm from "../_components/custom/category/form";
import CategoriesList from "../_components/custom/category/table";

export default async function CategoriesPage() {
  return (
    <div className="px-10 py-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Categories</h1>
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
