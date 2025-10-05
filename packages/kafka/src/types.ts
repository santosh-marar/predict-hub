export interface OrderPlacedEvent {
  orderId: string;
  userId: string;
  eventId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  quantity: number;
  price: number | null;
  lockedFunds: string;
  timestamp: number;
}

export interface TradeExecutedEvent {
  tradeId: string;
  makerOrderId: string;
  takerOrderId: string;
  makerUserId: string;
  takerUserId: string;
  eventId: string;
  side: "yes" | "no";
  quantity: number;
  price: string;
  amount: string;
  makerFee: string;
  takerFee: string;
  timestamp: number;
}

export interface SettlementCompletedEvent {
  tradeId: string;
  makerUserId: string;
  takerUserId: string;
  eventId: string;
  status: "success" | "failed";
  timestamp: number;
}

export interface PriceUpdateEvent {
  eventId: string;
  yesPrice: string;
  noPrice: string;
  lastTradePrice: string;
  timestamp: number;
}
