import express, { Router } from "express";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "@controllers/category";
import { authenticate, requireAdmin } from "src/middleware/auth";

const router:Router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", authenticate, requireAdmin, createCategory);
router.put("/:id", authenticate, requireAdmin, updateCategory);
router.delete("/:id", authenticate, requireAdmin, deleteCategory);

export default router;