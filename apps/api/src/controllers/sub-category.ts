import { db, category, subCategory } from "@repo/db";
import { eq, and, desc, asc, ilike, sql, ne } from "drizzle-orm";
import asyncMiddleware from "../middleware/async-middleware";
import { createSlug } from "../lib/utils";

// Create sub-category
export const createSubCategory = asyncMiddleware(async (req, res) => {
  const {
    categoryId,
    title,
    description,
    imageUrl,
    isActive = true,
  } = req.body;

  // Validate required fields
  if (!categoryId || !title) {
    return res.status(400).json({
      success: false,
      message: "Category ID and title are required",
    });
  }

  // Check if category exists
  const existingCategory = await db
    .select({ id: category.id })
    .from(category)
    .where(eq(category.id, categoryId))
    .limit(1);

  if (!existingCategory.length) {
    return res.status(404).json({
      success: false,
      message: "Parent category not found",
    });
  }

  // Generate slug from title
  const slug = createSlug(title);

  // Check if title or slug already exists
  const existingSubCategory = await db
    .select({ id: subCategory.id })
    .from(subCategory)
    .where(and(eq(subCategory.title, title.trim()), eq(subCategory.slug, slug)))
    .limit(1);

  if (existingSubCategory.length) {
    return res.status(409).json({
      success: false,
      message: "Sub-category with this title already exists",
    });
  }

  const newSubCategory = await db
    .insert(subCategory)
    .values({
      categoryId,
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      isActive,
    })
    .returning();

  res.status(201).json({
    success: true,
    message: "Sub-category created successfully",
    data: newSubCategory[0],
  });
});

// Get all sub-categories with filtering and pagination
export const getAllSubCategories = asyncMiddleware(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    categoryId,
    isActive,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const currentPage = parseInt(page as string);
  const itemsPerPage = parseInt(limit as string);
  const offset = (currentPage - 1) * itemsPerPage;
  const orderDirection = sortOrder === "asc" ? asc : desc;

  // Define allowed sortable fields
  const sortableFields = {
    createdAt: subCategory.createdAt,
    updatedAt: subCategory.updatedAt,
    title: subCategory.title,
    slug: subCategory.slug,
  } as const;

  // Fallback to createdAt if invalid sortBy
  const sortColumn =
    sortableFields[sortBy as keyof typeof sortableFields] ||
    subCategory.createdAt;

  // Build where conditions
  const whereConditions = [];

  if (categoryId) {
    whereConditions.push(eq(subCategory.categoryId, categoryId as string));
  }

  if (isActive !== undefined) {
    whereConditions.push(eq(subCategory.isActive, isActive === "true"));
  }

  if (search) {
    whereConditions.push(ilike(subCategory.title, `%${search}%`));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get sub-categories with category info
  const subCategories = await db
    .select({
      id: subCategory.id,
      categoryId: subCategory.categoryId,
      categoryTitle: category.title,
      title: subCategory.title,
      slug: subCategory.slug,
      description: subCategory.description,
      imageUrl: subCategory.imageUrl,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
      updatedAt: subCategory.updatedAt,
    })
    .from(subCategory)
    .leftJoin(category, eq(subCategory.categoryId, category.id))
    .where(whereClause)
    .orderBy(orderDirection(sortColumn))
    .limit(itemsPerPage)
    .offset(offset);

  // Total count for pagination
  const totalCount = await db
    .select({ count: sql`count(*)` })
    .from(subCategory)
    .where(whereClause);

  const totalItems = parseInt(
    (totalCount[0].count as unknown as string) || "0",
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  res.json({
    success: true,
    filter: {
      categoryId,
      isActive,
      search,
      sortBy,
      sortOrder,
    },
    data: subCategories,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  });
});

// Get sub-category by ID
export const getSubCategoryById = asyncMiddleware(async (req, res) => {
  const { id } = req.params;

  const result = await db
    .select({
      id: subCategory.id,
      categoryId: subCategory.categoryId,
      categoryTitle: category.title,
      title: subCategory.title,
      slug: subCategory.slug,
      description: subCategory.description,
      imageUrl: subCategory.imageUrl,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
      updatedAt: subCategory.updatedAt,
    })
    .from(subCategory)
    .leftJoin(category, eq(subCategory.categoryId, category.id))
    .where(eq(subCategory.id, id))
    .limit(1);

  if (!result.length) {
    return res.status(404).json({
      success: false,
      message: "Sub-category not found",
    });
  }

  res.json({
    success: true,
    data: result[0],
  });
});

// Get sub-category by slug
export const getSubCategoryBySlug = asyncMiddleware(async (req, res) => {
  const { slug } = req.params;

  const result = await db
    .select({
      id: subCategory.id,
      categoryId: subCategory.categoryId,
      categoryTitle: category.title,
      title: subCategory.title,
      slug: subCategory.slug,
      description: subCategory.description,
      imageUrl: subCategory.imageUrl,
      isActive: subCategory.isActive,
      createdAt: subCategory.createdAt,
      updatedAt: subCategory.updatedAt,
    })
    .from(subCategory)
    .leftJoin(category, eq(subCategory.categoryId, category.id))
    .where(eq(subCategory.slug, slug))
    .limit(1);

  if (!result.length) {
    return res.status(404).json({
      success: false,
      message: "Sub-category not found",
    });
  }

  res.json({
    success: true,
    data: result[0],
  });
});

// Get sub-categories by category ID
export const getSubCategoriesByCategoryId = asyncMiddleware(
  async (req, res) => {
    const { categoryId } = req.params;
    // const { isActive = true } = req.query;

    const result = await db
      .select()
      .from(subCategory)
      .where(
        and(
          eq(subCategory.categoryId, categoryId),
          // eq(subCategory.isActive, isActive === "true")
        ),
      )
      .orderBy(asc(subCategory.title));

    res.json({
      success: true,
      data: result,
    });
  },
);

// Update sub-category
export const updateSubCategory = asyncMiddleware(async (req, res) => {
  const { id } = req.params;
  const { categoryId, title, description, imageUrl, isActive } = req.body;

  const existingSubCategory = await db
    .select()
    .from(subCategory)
    .where(eq(subCategory.id, id))
    .limit(1);

  if (!existingSubCategory.length) {
    return res.status(404).json({
      success: false,
      message: "Sub-category not found",
    });
  }

  const updateData: Partial<{
    categoryId: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };

  if (categoryId) {
    const existingCategory = await db
      .select({ id: category.id })
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);

    if (!existingCategory.length) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    updateData.categoryId = categoryId;
  }

  if (title) {
    const newSlug = createSlug(title);

    const duplicateCheck = await db
      .select({ id: subCategory.id })
      .from(subCategory)
      .where(and(eq(subCategory.title, title.trim()), ne(subCategory.id, id)))
      .limit(1);

    if (duplicateCheck.length) {
      return res.status(409).json({
        success: false,
        message: "Sub-category with this title already exists",
      });
    }

    updateData.title = title.trim();
    updateData.slug = newSlug;
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  if (imageUrl !== undefined) {
    updateData.imageUrl = imageUrl?.trim() || null;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  const updatedSubCategory = await db
    .update(subCategory)
    .set(updateData)
    .where(eq(subCategory.id, id))
    .returning();

  res.json({
    success: true,
    message: "Sub-category updated successfully",
    data: updatedSubCategory[0],
  });
});

// Toggle sub-category status
export const toggleSubCategoryStatus = asyncMiddleware(async (req, res) => {
  const { id } = req.params;

  const existingSubCategory = await db
    .select({ isActive: subCategory.isActive })
    .from(subCategory)
    .where(eq(subCategory.id, id))
    .limit(1);

  if (!existingSubCategory.length) {
    return res.status(404).json({
      success: false,
      message: "Sub-category not found",
    });
  }

  const updatedSubCategory = await db
    .update(subCategory)
    .set({
      isActive: !existingSubCategory[0].isActive,
      updatedAt: new Date(),
    })
    .where(eq(subCategory.id, id))
    .returning();

  res.json({
    success: true,
    message: `Sub-category ${updatedSubCategory[0].isActive ? "activated" : "deactivated"} successfully`,
    data: updatedSubCategory[0],
  });
});

// Delete sub-category (soft delete by setting isActive to false)
export const deleteSubCategory = asyncMiddleware(async (req, res) => {
  const { id } = req.params;
  const { permanent = false } = req.query;

  const existingSubCategory = await db
    .select()
    .from(subCategory)
    .where(eq(subCategory.id, id))
    .limit(1);

  if (!existingSubCategory.length) {
    return res.status(404).json({
      success: false,
      message: "Sub-category not found",
    });
  }

  await db.delete(subCategory).where(eq(subCategory.id, id));

  res.json({
    success: true,
    message: "Sub-category deleted successfully",
  });
});

// Get sub-categories statistics
export const getSubCategoryStats = asyncMiddleware(async (req, res) => {
  const { categoryId } = req.query;

  let whereCondition = categoryId
    ? eq(subCategory.categoryId, categoryId as string)
    : undefined;

  const stats = await db
    .select({
      total: sql`count(*)`,
      active: sql`count(*) filter (where ${subCategory.isActive} = true)`,
      inactive: sql`count(*) filter (where ${subCategory.isActive} = false)`,
    })
    .from(subCategory)
    .where(whereCondition);

  res.json({
    success: true,
    data: {
      total: parseInt(stats[0].total as unknown as string),
      active: parseInt(stats[0].active as unknown as string),
      inactive: parseInt(stats[0].inactive as unknown as string),
    },
  });
});
