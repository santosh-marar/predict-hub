import type { Request, Response } from "express";
import { db, event, eventInsertSchema, eventUpdateSchema } from "@repo/db";
import {
  eq,
  and,
  desc,
  asc,
  gte,
  lte,
  ilike,
  or,
  count,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { AuthRequest } from "src/middleware/auth";
import asyncMiddleware from "src/middleware/async-middleware";

// Types
type EventStatus = "draft" | "active" | "ended" | "resolved" | "cancelled";
type SortField = "createdAt" | "endTime" | "totalVolume" | "title";
type SortOrder = "asc" | "desc";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Validation schemas
const eventQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z
    .enum(["draft", "active", "ended", "resolved", "cancelled"])
    .optional(),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  createdBy: z.string().optional(),
  search: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "endTime", "totalVolume", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const eventParamsSchema = z.object({
  id: z.string().uuid(),
});

const resolutionSchema = z.object({
  outcome: z.boolean(),
  resolutionNotes: z.string().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(["draft", "active", "ended", "resolved", "cancelled"]),
});

// Utility functions
const createResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

const createErrorResponse = (message: string, errors?: any[]): ApiResponse => ({
  success: false,
  message,
  errors,
});


const validateStatusTransition = (
  currentStatus: EventStatus,
  newStatus: EventStatus
): boolean => {
  const validTransitions: Record<EventStatus, EventStatus[]> = {
    draft: ["active", "cancelled"],
    active: ["ended", "cancelled"],
    ended: ["resolved"],
    resolved: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

// Controllers
export const createEvent = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const createdBy = req.user?.id;

    const rawBody = req.body;

    const parsedData = {
      ...rawBody,
      createdBy,
      startTime: rawBody.startTime ? new Date(rawBody.startTime) : undefined,
      endTime: rawBody.endTime ? new Date(rawBody.endTime) : undefined,
      resolutionTime: rawBody.resolutionTime
        ? new Date(rawBody.resolutionTime)
        : undefined,
    };

    const validatedData = eventInsertSchema.parse(parsedData);

    const newEvent = await db
      .insert(event)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res
      .status(201)
      .json(createResponse(newEvent[0], "Event created successfully"));
  }
);


export const getEvents = asyncMiddleware(
  async (req: Request, res: Response) => {
    const query = eventQuerySchema.parse(req.query);
    const {
      page,
      limit,
      status,
      categoryId,
      subCategoryId,
      createdBy,
      search,
      isPublic,
      isFeatured,
      sortBy,
      sortOrder,
    } = query;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (status) conditions.push(eq(event.status, status));
    if (categoryId) conditions.push(eq(event.categoryId, categoryId));
    if (subCategoryId) conditions.push(eq(event.subCategoryId, subCategoryId));
    if (createdBy) conditions.push(eq(event.createdBy, createdBy));
    if (isPublic !== undefined) conditions.push(eq(event.isPublic, isPublic));
    if (isFeatured !== undefined)
      conditions.push(eq(event.isFeatured, isFeatured));
    if (search) {
      conditions.push(
        or(
          ilike(event.title, `%${search}%`),
          ilike(event.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderByClause =
      sortOrder === "asc" ? asc(event[sortBy]) : desc(event[sortBy]);

    const [events, totalCount] = await Promise.all([
      db
        .select()
        .from(event)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(event).where(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount[0].count / limit);

    res.json({
      ...createResponse(events),
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: totalCount[0].count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }
);

export const getEventById = asyncMiddleware(
  async (req: Request, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);

    const eventData = await db.query.event.findFirst({
      where: eq(event.id, id),
      with: {
        category: true,
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!eventData) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    res.json(createResponse(eventData));
  }
);

export const updateEvent = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);

    const rawBody = req.body;

    const parsedData = {
      ...rawBody,
      startTime: rawBody.startTime ? new Date(rawBody.startTime) : undefined,
      endTime: rawBody.endTime ? new Date(rawBody.endTime) : undefined,
      resolutionTime: rawBody.resolutionTime
        ? new Date(rawBody.resolutionTime)
        : undefined,
    };

    const existingEvent = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    const updatedEvent = await db
      .update(event)
      .set({
        ...parsedData,
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    res.json(createResponse(updatedEvent[0], "Event updated successfully"));
  }
);

export const deleteEvent = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);

    const existingEvent = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    // Optional: Add permission check
    // if (existingEvent[0].createdBy !== req.user?.id && !req.user?.isAdmin) {
    //   return res.status(403).json(createErrorResponse('Unauthorized to delete this event'));
    // }

    await db.delete(event).where(eq(event.id, id));

    res.json(createResponse(null, "Event deleted successfully"));
  }
);

export const resolveEvent = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);
    const { outcome, resolutionNotes } = resolutionSchema.parse(req.body);

    const existingEvent = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    const currentEvent = existingEvent[0];

    if (currentEvent.status === "resolved") {
      return res
        .status(400)
        .json(createErrorResponse("Event is already resolved"));
    }

    if (currentEvent.status !== "ended") {
      return res
        .status(400)
        .json(createErrorResponse("Event must be ended before resolution"));
    }

    const resolvedEvent = await db
      .update(event)
      .set({
        status: "resolved",
        resolvedOutcome: outcome,
        resolvedBy: req.user?.id,
        resolvedAt: new Date(),
        resolutionNotes,
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    res.json(createResponse(resolvedEvent[0], "Event resolved successfully"));
  }
);

export const updateEventStatus = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);
    const { status: newStatus } = statusUpdateSchema.parse(req.body);

    const existingEvent = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    const currentStatus = existingEvent[0].status as EventStatus;

    if (!validateStatusTransition(currentStatus, newStatus)) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            `Cannot transition from ${currentStatus} to ${newStatus}`
          )
        );
    }

    const updatedEvent = await db
      .update(event)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(event.id, id))
      .returning();

    res.json(
      createResponse(updatedEvent[0], "Event status updated successfully")
    );
  }
);

export const getUserEvents = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json(createErrorResponse("User ID is required"));
    }

    const query = eventQuerySchema.parse(req.query);
    const { page, limit, status, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(event.createdBy, userId),
      status && eq(event.status, status),
    ].filter(Boolean);

    const orderByClause =
      sortOrder === "asc" ? asc(event[sortBy]) : desc(event[sortBy]);

    const [userEvents, totalCount] = await Promise.all([
      db
        .select()
        .from(event)
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(event)
        .where(and(...conditions)),
    ]);

    const totalPages = Math.ceil(totalCount[0].count / limit);

    res.json({
      ...createResponse(userEvents),
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: totalCount[0].count,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }
);

export const getFeaturedEvents = asyncMiddleware(
  async (req: Request, res: Response) => {
    const { limit = 5 } = z
      .object({
        limit: z.coerce.number().min(1).max(20).default(5),
      })
      .parse(req.query);

    const featuredEvents = await db
      .select()
      .from(event)
      .where(
        and(
          eq(event.isFeatured, true),
          eq(event.isPublic, true),
          eq(event.status, "active")
        )
      )
      .orderBy(desc(event.totalVolume))
      .limit(limit);

    res.json(createResponse(featuredEvents));
  }
);

export const getEventStats = asyncMiddleware(
  async (req: Request, res: Response) => {
    const { id } = eventParamsSchema.parse(req.params);

    const eventStats = await db
      .select({
        totalVolume: event.totalVolume,
        totalYesShares: event.totalYesShares,
        totalNoShares: event.totalNoShares,
        yesPrice: event.yesPrice,
        noPrice: event.noPrice,
        tradeCount: sql<number>`(SELECT COUNT(*) FROM trade WHERE event_id = ${id})`,
        uniqueTraders: sql<number>`(SELECT COUNT(DISTINCT user_id) FROM trade WHERE event_id = ${id})`,
        commentCount: sql<number>`(SELECT COUNT(*) FROM comment WHERE event_id = ${id})`,
      })
      .from(event)
      .where(eq(event.id, id))
      .limit(1);

    if (eventStats.length === 0) {
      return res.status(404).json(createErrorResponse("Event not found"));
    }

    res.json(createResponse(eventStats[0]));
  }
);

// Batch operations
export const batchUpdateEventStatus = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { eventIds, status: newStatus } = z
      .object({
        eventIds: z.array(z.string().uuid()),
        status: z.enum(["draft", "active", "ended", "resolved", "cancelled"]),
      })
      .parse(req.body);

    const results = await Promise.allSettled(
      eventIds.map(async (eventId) => {
        const existingEvent = await db
          .select()
          .from(event)
          .where(eq(event.id, eventId))
          .limit(1);

        if (existingEvent.length === 0) {
          throw new Error(`Event ${eventId} not found`);
        }

        const currentStatus = existingEvent[0].status as EventStatus;

        if (!validateStatusTransition(currentStatus, newStatus)) {
          throw new Error(
            `Cannot transition event ${eventId} from ${currentStatus} to ${newStatus}`
          );
        }

        return db
          .update(event)
          .set({
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(event.id, eventId))
          .returning();
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    res.json(
      createResponse(
        {
          successful,
          failed,
          results: results.map((result, index) => ({
            eventId: eventIds[index],
            success: result.status === "fulfilled",
            error: result.status === "rejected" ? result.reason.message : null,
          })),
        },
        `Batch update completed: ${successful} successful, ${failed} failed`
      )
    );
  }
);
