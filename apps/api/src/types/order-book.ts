// Types for order book
export interface OrderBookEntry {
  price: string;
  quantity: string;
  orders: number;
  side: "yes" | "no";
  type: "limit" | "market";
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
