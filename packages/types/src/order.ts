import { z } from "zod";

export const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  side: z.enum(["yes", "no"]),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]),
  quantity: z.number().positive(),
  limitPrice: z.number().min(0).max(100).optional(),
  timeInForce: z.enum(["GTC", "IOC", "FOK"]).default("GTC"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export interface OrderBookEntry {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface OrderBook {
  yes: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
  no: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  };
}
