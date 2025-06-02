import { Request, Response } from "express";
import { db, category } from "@repo/db";
import { eq, asc, or } from "drizzle-orm";
import asyncMiddleware from "src/middleware/async-middleware";

// Get all active categories
export const getCategories = asyncMiddleware( async (req: Request, res: Response) => {

    const categories = await db
      .select()
      .from(category)
      .where(eq(category.isActive, true))
      .orderBy(asc(category.title));

    res.json({
      success: true,
      data: categories,
    });
});

// Get category by ID or slug
export const getCategoryById = asyncMiddleware(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await db
      .select()
      .from(category)
      .where(or(eq(category.id, id), eq(category.slug, id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  }
);

// Create new category (admin only)
export const createCategory = asyncMiddleware( async (req: Request, res: Response) => {
    const { title, description, imageUrl } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title are required",
      });
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const newCategory = await db
      .insert(category)
      .values({
        title,
        slug,
        description,
        imageUrl,
        isActive: true,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newCategory[0],
    });
})

// Update category (admin only)
export const updateCategory = asyncMiddleware( async (req: Request, res: Response) => {

    const { id } = req.params;

    const { title, description, imageUrl, isActive } = req.body;

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const updated = await db
      .update(category)
      .set({
        title,
        slug,
        description,
        imageUrl,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(category.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: updated[0],
    });
})

// Delete category (admin only)
export const deleteCategory = asyncMiddleware( async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await db
      .delete(category)
      .where(eq(category.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
});
