import express, { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@controllers/category";
import { isAuthenticated, requireAdmin } from "src/middleware/auth";

const router: Router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", isAuthenticated, requireAdmin, createCategory);
router.put("/:id", isAuthenticated, requireAdmin, updateCategory);
router.delete("/:id", isAuthenticated, requireAdmin, deleteCategory);

export default router;
