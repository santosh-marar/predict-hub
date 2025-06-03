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
import { authenticate, requireAdmin } from "src/middleware/auth";

const router = Router();

router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.post("/", authenticate, requireAdmin, createSubCategory);
router.get("/slug/:slug", authenticate, requireAdmin, getSubCategoryBySlug);
router.get(
  "/category/:categoryId",
  authenticate,
  requireAdmin,
  getSubCategoriesByCategoryId
);
router.patch("/:id", authenticate, requireAdmin, updateSubCategory);
router.patch(
  "/:id/toggle",
  authenticate,
  requireAdmin,
  toggleSubCategoryStatus
);
router.delete("/:id", authenticate, requireAdmin, deleteSubCategory);

export default router;
