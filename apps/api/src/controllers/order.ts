import { Request, Response, NextFunction } from "express";
import {
  db,
  order,
  event,
  position,
  trade,
  wallet,
  transaction,
} from "@repo/db";
import { eq, desc, asc, and, or, sql, lt, gt, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest } from "src/middleware/auth";
import asyncMiddleware from "src/middleware/async-middleware";
import { executeHybridTrade } from "@repo/order-engine";

// Validation schemas
const createOrderSchema = z.object({
  eventId: z.string().uuid(),
  side: z.enum(["yes", "no"]),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]).default("market"),
  quantity: z.number().positive(),
  limitPrice: z.number().min(0.01).max(99.99).optional(),
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
    // if (validatedData.orderType === "market" && validatedData.limitPrice) {
    //   return res
    //     .status(400)
    //     .json({ error: "Market orders cannot have limit price" });
    // }

    // // Validate limit orders have limit price
    // if (validatedData.orderType === "limit" && !validatedData.limitPrice) {
    //   return res
    //     .status(400)
    //     .json({ error: "Limit orders must have limit price" });
    // }

    // Check if event exists and is active
    const [eventData] = await db
      .select()
      .from(event)
      .where(eq(event.id, validatedData.eventId))
      .limit(1);

    if (!eventData) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (eventData.status !== "active") {
      return res.status(400).json({ error: "Event is not active for trading" });
    }

    // Check if event has ended
    if (new Date() > new Date(eventData.endTime)) {
      return res.status(400).json({ error: "Event has ended" });
    }

    // Calculate order amount
    const orderAmount =
      validatedData.quantity * (validatedData.limitPrice || 10);

    // Check user balance for buy orders
    // if (validatedData.type === "buy") {
    //   const [userWallet] = await db
    //     .select()
    //     .from(wallet)
    //     .where(eq(wallet.userId, userId))
    //     .limit(1);

    //   if (!userWallet || parseFloat(userWallet.balance) < orderAmount) {
    //     return res.status(400).json({ error: "Insufficient balance" });
    //   }

    //   // Lock funds
    //   await db
    //     .update(wallet)
    //     .set({
    //       balance: (parseFloat(userWallet.balance) - orderAmount).toString(),
    //       lockedBalance: (
    //         parseFloat(userWallet.lockedBalance) + orderAmount
    //       ).toString(),
    //     })
    //     .where(eq(wallet.userId, userId));
    // }

    // // Check user position for sell orders
    // if (validatedData.type === "sell") {
    //   const [userPosition] = await db
    //     .select()
    //     .from(position)
    //     .where(
    //       and(
    //         eq(position.userId, userId),
    //         eq(position.eventId, validatedData.eventId)
    //       )
    //     )
    //     .limit(1);

    //   const availableShares = userPosition
    //     ? parseFloat(
    //         validatedData.side === "yes"
    //           ? userPosition.yesShares
    //           : userPosition.noShares
    //       )
    //     : 0;

    //   if (availableShares < validatedData.quantity) {
    //     return res.status(400).json({ error: "Insufficient shares to sell" });
    //   }
    // }

    // Create order
    const [newOrder] = await db
      .insert(order)
      .values({
        userId,
        eventId: validatedData.eventId,
        side: validatedData.side,
        type: validatedData.type,
        orderType: validatedData.orderType,
        originalQuantity: validatedData.quantity.toString(),
        remainingQuantity: validatedData.quantity.toString(),
        limitPrice: validatedData.limitPrice?.toString(),
        totalAmount: orderAmount.toString(),
      })
      .returning();

    const totalQuantity = String(validatedData.quantity);
    const limitPrice = String(validatedData.limitPrice);

    // Try to match the order
    const trades = await executeHybridTrade({
      userId,
      eventId: validatedData.eventId,
      side: validatedData.side,
      type: validatedData.type,
      orderType: validatedData.orderType,
      quantity: totalQuantity,
      limitPrice: limitPrice,
    });

    // Create transaction record
    await db.insert(transaction).values({
      userId,
      type: "trade",
      amount: orderAmount.toString(),
      balanceBefore: "0",
      balanceAfter: "0",
      relatedOrderId: newOrder.id,
      relatedEventId: validatedData.eventId,
      status: "completed",
      description: `${validatedData.type} order for ${validatedData.quantity} ${validatedData.side} shares`,
    });

    res.status(201).json({
      success: true,
      data: {
        order: newOrder,
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
