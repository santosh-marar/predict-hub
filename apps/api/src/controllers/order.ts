import { Request, Response, NextFunction } from "express";
import { db, order, event } from "@repo/db";
import { eq, desc, and, asc, or } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest } from "src/middleware/auth";
import asyncMiddleware from "src/middleware/async-middleware";
import { placeOrder } from "@repo/order-engine";
import { handleOrderBookChange } from "src/service/socket-io";

// Types for order book
export interface OrderBookEntry {
  price: string;
  quantity: string;
  orders: number;
  side: "yes" | "no";
  type: "limit" | "amm" | "market";
}
// Order book types
export interface OrderBook {
  eventId: string;
  yesAsks: OrderBookEntry[];
  yesBids: OrderBookEntry[];
  noAsks: OrderBookEntry[];
  noBids: OrderBookEntry[];
  totalYesShares: string;
  totalNoShares: string;
  lastYesPrice?: string;
  lastNoPrice?: string;
}

// Validation schemas
const createOrderSchema = z.object({
  eventId: z.string().uuid(),
  side: z.enum(["yes", "no"]),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]).default("market"),
  quantity: z.number().positive(),
  price: z.number().min(0.5).max(9.5).optional(),
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
    const limitPrice = validatedData.limitPrice;
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

    await handleOrderBookChange(validatedData.eventId);

    res.status(201).json({
      success: true,
      data: {
        trades,
      },
    });
  },
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
  },
);

export async function getOrderBook(eventId: string): Promise<OrderBook> {
  try {
    // Get only active limit orders table
    const activeOrders = await db
      .select()
      .from(order)
      .where(
        and(
          eq(order.eventId, eventId),
          eq(order.status, "pending"),
          eq(order.orderType, "limit"), // Only limit orders
        ),
      )
      .orderBy(asc(order.createdAt));

    // Separate orders by side
    const yesOrders = activeOrders.filter((o) => o.side === "yes");
    const noOrders = activeOrders.filter((o) => o.side === "no");

    // Further separate by buy/sell means type
    const yesBuyLimitOrders = yesOrders.filter((o) => o.type === "buy");
    const yesSellLimitOrders = yesOrders.filter((o) => o.type === "sell");

    const noBuyLimitOrders = noOrders.filter((o) => o.type === "buy");
    const noSellLimitOrders = noOrders.filter((o) => o.type === "sell");

    // Limit order book entries
    const buildLimitOrderBookEntries = (
      orders: typeof activeOrders,
      isAsk: boolean,
    ) => {
      const priceMap = new Map<string, { quantity: string; orders: number }>();

      orders.forEach((order) => {
        if (!order.limitPrice) return;

        const price = order.limitPrice;
        const existing = priceMap.get(price);

        if (existing) {
          existing.quantity = (
            parseFloat(existing.quantity) + parseFloat(order.remainingQuantity)
          ).toString();
          existing.orders += 1;
        } else {
          priceMap.set(price, {
            quantity: order.remainingQuantity,
            orders: 1,
          });
        }
      });

      const entries = Array.from(priceMap.entries()).map(([price, data]) => ({
        price,
        quantity: data.quantity,
        orders: data.orders,
        side: orders[0]?.side || "yes",
        type: "limit" as const,
      }));

      // Sort: asks ascending, bids descending
      return entries.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return isAsk ? priceA - priceB : priceB - priceA;
      });
    };

    // Process limit orders
    const yesAsks = buildLimitOrderBookEntries(yesSellLimitOrders, true);
    const yesBids = buildLimitOrderBookEntries(yesBuyLimitOrders, false);
    const noAsks = buildLimitOrderBookEntries(noSellLimitOrders, true);
    const noBids = buildLimitOrderBookEntries(noBuyLimitOrders, false);

    const events = await db.select().from(event).where(eq(event.id, eventId));
    const totalYesShares = events[0].totalYesShares;
    const totalNoShares = events[0].totalNoShares;

    const result = {
      eventId,
      yesAsks,
      yesBids,
      noAsks,
      noBids,
      totalYesShares: totalYesShares.toString(),
      totalNoShares: totalNoShares.toString(),
      lastYesPrice: events[0].lastYesPrice,
      lastNoPrice: events[0].lastNoPrice,
    };

    return result;
  } catch (error: any) {
    console.error("Error getting order book:", error);
    throw new Error("Failed to get order book: " + error.message);
  }
}

// Testing
// const result = await getOrderBook("8c6ad740-0957-4764-85b2-7a08113a311a");
// console.log("Final result:", result);
// console.log("Final result no asks", result.raw.noAsks);
// console.log("Final result yes asks", result.raw?.yesBids);
