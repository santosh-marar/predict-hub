import { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoryBySlug,
  getSubCategoriesByCategoryId,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
} from "../controllers/sub-category";
import { isAuthenticated, requireAdmin } from "src/middleware/auth";

const router: Router = Router();

router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.post("/", isAuthenticated, requireAdmin, createSubCategory);
router.get("/slug/:slug", isAuthenticated, requireAdmin, getSubCategoryBySlug);
router.get(
  "/category/:categoryId",
  isAuthenticated,
  requireAdmin,
  getSubCategoriesByCategoryId
);
router.patch("/:id", isAuthenticated, requireAdmin, updateSubCategory);
router.patch(
  "/:id/toggle",
  isAuthenticated,
  requireAdmin,
  toggleSubCategoryStatus
);
router.delete("/:id", isAuthenticated, requireAdmin, deleteSubCategory);

export default router;
