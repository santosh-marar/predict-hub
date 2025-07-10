import { Request, Response, NextFunction } from "express";
import {
  db,
  order,
  event,
  position,
  trade,
  wallet,
  transactions,
} from "@repo/db";
import { eq, desc, asc, and, or, sql, lt, gt, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest } from "src/middleware/auth";
import asyncMiddleware from "src/middleware/async-middleware";
import { placeOrder } from "@repo/order-engine";

// Validation schemas
const createOrderSchema = z.object({
  eventId: z.string().uuid(),
  side: z.enum(["yes", "no"]),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]).default("market"),
  quantity: z.number().positive(),
  price: z.string().min(0.5).max(9.5).optional(),
  limitPrice: z.number().min(0.5).max(9.5).optional(),
});

const queryOrderSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
  eventId: z.string().uuid().optional(),
  status: z
    .enum(["pending", "partial", "filled", "cancelled", "expired"])
    .optional(),
  side: z.enum(["yes", "no"]).optional(),
  type: z.enum(["buy", "sell"]).optional(),
});

export const createOrder = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate market orders don't have limit price
    if (validatedData.orderType === "market" && validatedData.limitPrice) {
      return res
        .status(400)
        .json({ error: "Market orders cannot have limit price" });
    }

    // Validate limit orders have limit price
    if (validatedData.orderType === "limit" && !validatedData.limitPrice) {
      return res
        .status(400)
        .json({ error: "Limit orders must have limit price" });
    }

    const totalQuantity = String(validatedData.quantity);
    const limitPrice = validatedData.limitPrice
    const price = Number(validatedData.price);

    // Start creating order to finishing order
    const trades = await placeOrder({
      userId,
      eventId: validatedData.eventId,
      side: validatedData.side,
      type: validatedData.type,
      orderType: validatedData.orderType,
      quantity: totalQuantity,
      limitPrice: limitPrice,
      price,
    });

    res.status(201).json({
      success: true,
      data: {
        trades,
      },
    });
  }
);

// Get user orders
export const getUserOrders = asyncMiddleware(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = queryOrderSchema.parse(req.query);
    const userId = req.user?.id;
    const offset = (query.page - 1) * query.limit;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Build where conditions
    const whereConditions = [eq(order.userId, userId)];

    if (query.eventId) {
      whereConditions.push(eq(order.eventId, query.eventId));
    }
    if (query.status) {
      whereConditions.push(eq(order.status, query.status));
    }
    if (query.side) {
      whereConditions.push(eq(order.side, query.side));
    }
    if (query.type) {
      whereConditions.push(eq(order.type, query.type));
    }

    const orders = await db
      .select({
        id: order.id,
        eventId: order.eventId,
        eventTitle: event.title,
        side: order.side,
        type: order.type,
        orderType: order.orderType,
        originalQuantity: order.originalQuantity,
        remainingQuantity: order.remainingQuantity,
        filledQuantity: order.filledQuantity,
        limitPrice: order.limitPrice,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        filledAt: order.filledAt,
      })
      .from(order)
      .leftJoin(event, eq(order.eventId, event.id))
      .where(and(...whereConditions))
      .orderBy(desc(order.createdAt))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: orders,
    });
  }
);
