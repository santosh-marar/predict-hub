import { Suspense } from "react";
import CategoryForm from "../../_components/custom/category/form";


export default function NewCategoryPage() {
  return (
    <div className="px-10 py-4">
      <h1 className="text-3xl font-bold mb-2">Create New Category</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <CategoryForm  />
      </Suspense>
    </div>
  );
}
