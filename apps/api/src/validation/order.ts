import { z } from "zod";

export const createOrderSchema = z.object({
  eventId: z.string().uuid(),
  side: z.enum(["yes", "no"]),
  type: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]).default("market"),
  quantity: z.number().positive(),
  price: z.number().min(0.5).max(9.5).optional(),
  limitPrice: z.number().min(0.5).max(9.5).optional(),
});

export const queryOrderSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
  eventId: z.string().uuid().optional(),
  status: z
    .enum(["pending", "partial", "filled", "cancelled", "expired"])
    .optional(),
  side: z.enum(["yes", "no"]).optional(),
  type: z.enum(["buy", "sell"]).optional(),
});
