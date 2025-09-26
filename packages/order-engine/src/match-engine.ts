import { sql, and, eq, gt, gte, lte, asc, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";
import { order } from "@repo/db";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Order {
  id: string;
  eventId: string;
  userId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  orderType: "limit" | "market";
  limitPrice: number;
  quantity: number;
  remainingQuantity: number;
  createdAt: Date;
  status: "pending" | "filled" | "cancelled";
}

interface PriceUpdate {
  eventId: string;
  side: "yes" | "no";
  newPrice: number;
  timestamp: Date;
}

interface OrderMatch {
  makerOrder: Order;
  takerOrder: Order;
  matchPrice: number;
  matchQuantity: number;
}

interface TradeExecution {
  makerUserId: string;
  takerUserId: string;
  makerOrderId: string;
  takerOrderId: string;
  eventId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  quantity: number;
  price: number;
  amount: Decimal;
  makerFee: Decimal;
  takerFee: Decimal;
  totalFees: Decimal;
  tradeType: "ORDER_BOOK" | "AMM";
  executedAt: Date;
  balanceAfter: Decimal;
  balanceBefore: Decimal;
}

// 1. Order book management (Storage Only)
let orderBook: {
  [eventId: string]: {
    [side: string]: {
      buy: Map<number, Order[]>;
      sell: Map<number, Order[]>;
    };
  };
} = {};

let orderLookup: Map<string, Order> = new Map();
let currentMarketPrices: Map<string, number> = new Map(); // eventId_side -> price

function initializeOrderBook(eventId: string) {
  if (!orderBook[eventId]) {
    orderBook[eventId] = {
      yes: { buy: new Map(), sell: new Map() },
      no: { buy: new Map(), sell: new Map() },
    };
  }
}

// Add order to book (no execution - only for storage)
export function addOrderToBook(order: Order): void {

  // Don't storing market orders
   if (order.orderType === "market") {
     return;
   }

  initializeOrderBook(order.eventId);

  const eventBook = orderBook[order.eventId];
  if (!eventBook) return;

  const sideBook = eventBook[order.side];
  if (!sideBook) return;

  const book = sideBook[order.type];
  if (!book) return;

  if (!book.has(order.limitPrice)) {
    book.set(order.limitPrice, []);
  }

  const priceLevel = book.get(order.limitPrice);
  if (priceLevel) {
    priceLevel.push(order);
  }

  orderLookup.set(order.id, order);

  console.log(
    `📝 Added to book: ${order.type} ${order.quantity} ${order.side} @ $${order.limitPrice}`
  );
}

// Remove order from book
export function removeOrderFromBook(orderId: string): void {
  const order = orderLookup.get(orderId);
  if (!order) return;

  const eventBook = orderBook[order.eventId];
  if (!eventBook) return;

  const sideBook = eventBook[order.side];
  if (!sideBook) return;

  const book = sideBook[order.type];
  if (!book) return;

  const orders = book.get(order.limitPrice);
  if (orders) {
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders.splice(index, 1);
      if (orders.length === 0) {
        book.delete(order.limitPrice);
      }
    }
  }

  orderLookup.delete(orderId);
}

// 2. Match finding (no execution)

// Find all orders that can match with a given order (returns matches, doesn't execute)
export function findMatchingOrders(takerOrder: Order): OrderMatch[] {
  initializeOrderBook(takerOrder.eventId);

  const oppositeSide = takerOrder.side === "yes" ? "no" : "yes";
  const oppositeType = takerOrder.type === "buy" ? "sell" : "buy";

  const eventBook = orderBook[takerOrder.eventId];
  if (!eventBook) return [];

  const oppositeSideBook = eventBook[oppositeSide];
  if (!oppositeSideBook) return [];

  const book = oppositeSideBook[oppositeType];
  if (!book) return [];

  const matches: OrderMatch[] = [];
  let remainingQuantity = takerOrder.remainingQuantity;

  // Sort prices (best first)
  const prices = Array.from(book.keys()).sort((a, b) => {
    return takerOrder.type === "buy" ? a - b : b - a;
  });

  for (const price of prices) {
    if (remainingQuantity <= 0) break;

    // ⚡ Skip limit price checks for market orders
    if (takerOrder.orderType === "limit") {
      if (takerOrder.type === "buy" && price > takerOrder.limitPrice!) continue;
      if (takerOrder.type === "sell" && price < takerOrder.limitPrice!)
        continue;
    }

    const orders = book.get(price) || [];
    const sortedOrders = [...orders]
      .filter((o) => o.remainingQuantity > 0)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const makerOrder of sortedOrders) {
      if (remainingQuantity <= 0) break;

      const matchQuantity = Math.min(
        remainingQuantity,
        makerOrder.remainingQuantity
      );
      const matchPrice = makerOrder.limitPrice; // maker’s price

      matches.push({ makerOrder, takerOrder, matchPrice, matchQuantity });

      remainingQuantity -= matchQuantity;
    }
  }

  return matches;
}


// 3. Price-triggered matching

// Check if any existing orders can now be matched due to price changes
export function findPriceTriggeredMatches(
  eventId: string,
  side: "yes" | "no",
  newPrice: number
): OrderMatch[] {
  const priceKey = `${eventId}_${side}`;
  const oldPrice = currentMarketPrices.get(priceKey);
  currentMarketPrices.set(priceKey, newPrice);


  const triggeredMatches: OrderMatch[] = [];

  // Check opposite side orders that might now be matchable
  const oppositeSide = side === "yes" ? "no" : "yes";
  const eventBook = orderBook[eventId];
  if (!eventBook || !eventBook[oppositeSide]) return [];

  // Check buy orders that can now execute (price dropped to their limit)
  const buyOrders = eventBook[oppositeSide]["buy"];
  for (const [limitPrice, orders] of buyOrders) {
    if (newPrice <= limitPrice) {
      for (const buyOrder of orders.filter((o) => o.remainingQuantity > 0)) {
        // Create a synthetic sell order at current market price to find matches
        const syntheticSellOrder: Order = {
          ...buyOrder,
          id: "market_price_trigger",
          type: "sell",
          limitPrice: newPrice,
        };

        const matches = findMatchingOrders(syntheticSellOrder);
        triggeredMatches.push(
          ...matches.filter((m) => m.makerOrder.id === buyOrder.id)
        );
      }
    }
  }

  // Check sell orders that can now execute (price rose to their limit)
  const sellOrders = eventBook[oppositeSide]["sell"];
  for (const [limitPrice, orders] of sellOrders) {
    if (newPrice >= limitPrice) {
      for (const sellOrder of orders.filter((o) => o.remainingQuantity > 0)) {
        // Create a synthetic buy order at current market price to find matches
        const syntheticBuyOrder: Order = {
          ...sellOrder,
          id: "market_price_trigger",
          type: "buy",
          limitPrice: newPrice,
        };

        const matches = findMatchingOrders(syntheticBuyOrder);
        triggeredMatches.push(
          ...matches.filter((m) => m.makerOrder.id === sellOrder.id)
        );
      }
    }
  }

  if (triggeredMatches.length > 0) {
    console.log(`⚡ Found ${triggeredMatches.length} price-triggered matches`);
  }

  return triggeredMatches;
}

// 4. Integration functions for system

// matchOrder function should call this to get matches
export function getMatchingOrdersArray(newOrder: Order): Order[] {
  const matches = findMatchingOrders(newOrder);
  return matches.map((match) => match.makerOrder);
}

// Update order quantities after trade from matchOrder Function 
export function updateOrderQuantities(matches: OrderMatch[]): void {
  for (const match of matches) {
    // Update maker order
    match.makerOrder.remainingQuantity -= match.matchQuantity;
    if (match.makerOrder.remainingQuantity === 0) {
      removeOrderFromBook(match.makerOrder.id);
    }

    // Update taker order
    match.takerOrder.remainingQuantity -= match.matchQuantity;
    if (match.takerOrder.remainingQuantity === 0) {
      removeOrderFromBook(match.takerOrder.id);
    }
  }
}

// Handle price updates from external sources (market data, other trades, etc.)
export function onMarketPriceUpdate(
  eventId: string,
  side: "yes" | "no",
  newPrice: number
): OrderMatch[] {
  return findPriceTriggeredMatches(eventId, side, newPrice);
}

// Get order book snapshot
export function getOrderBookSnapshot(eventId: string) {
  initializeOrderBook(eventId);

  const eventBook = orderBook[eventId];
  return {
    yes: {
      buy: Array.from(eventBook.yes.buy.entries()).map(([price, orders]) => ({
        price,
        orders: orders.filter((o) => o.remainingQuantity > 0),
      })),
      sell: Array.from(eventBook.yes.sell.entries()).map(([price, orders]) => ({
        price,
        orders: orders.filter((o) => o.remainingQuantity > 0),
      })),
      currentPrice: currentMarketPrices.get(`${eventId}_yes`),
    },
    no: {
      buy: Array.from(eventBook.no.buy.entries()).map(([price, orders]) => ({
        price,
        orders: orders.filter((o) => o.remainingQuantity > 0),
      })),
      sell: Array.from(eventBook.no.sell.entries()).map(([price, orders]) => ({
        price,
        orders: orders.filter((o) => o.remainingQuantity > 0),
      })),
      currentPrice: currentMarketPrices.get(`${eventId}_no`),
    },
  };
}

// Load existing orders from database on startup
export async function loadOrdersFromDatabase(
  tx: any,
  eventId: string
): Promise<void> {
  const existingOrders = await tx
    .select()
    .from(order)
    .where(
      and(
        eq(order.eventId, eventId),
        eq(order.status, "pending"),
        gt(order.remainingQuantity, "0")
      )
    );

  for (const dbOrder of existingOrders) {
    addOrderToBook(dbOrder);
  }
}
