import Decimal from "decimal.js";

// Types
export interface TradeExecution {
  // id: string,
  eventId: string;
  makerUserId: string;
  takerUserId: string;
  makerOrderId?: string;
  takerOrderId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  quantity: Number;
  price: Decimal;
  amount: Decimal;
  makerFee: Decimal;
  takerFee: Decimal;
  totalFees: Decimal;
  tradeType: "ORDER_BOOK" | "AMM_POOL";
  executedAt: Date;
  balanceBefore: Decimal;
  balanceAfter: Decimal;
}

export interface OrderBookEntry {
  id: string;
  userId: string;
  eventId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  orderType: "market" | "limit";
  remainingQuantity: string;
  limitPrice?: string;
  createdAt: Date;
  status: string;
}

export interface OrderData {
  id?: string;
  userId: string;
  eventId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  orderType: "market" | "limit";
  quantity: string;
  limitPrice?: number;
  price?: number;
  timeInForce?: "GTC" | "IOC" | "FOK";
}

export interface TransactionData {
  type: string;
  relatedOrderId: string;
  relatedEventId: string;
  description: string;
}

export interface PositionParams {
  userId: string;
  eventId: string;
  side: "yes" | "no";
  shares: string;
  quantity: Decimal;
  costBasis: Decimal;
  averagePrice: string;
}
export interface Order {
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

export interface OrderMatch {
  makerOrder: Order;
  takerOrder: Order;
  matchPrice: number;
  matchQuantity: number;
}
