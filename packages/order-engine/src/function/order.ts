import { DEFAULT_SLIPPAGE_TOLERANCE, TAKER_FEE_RATE } from "@/constants";
import { OrderData } from "@/types";
import { order } from "@repo/db";
import Decimal from "decimal.js";

/**
 * Create a limit order in the database
 */
export async function createLimitOrder(
  tx: any,
  orderData: OrderData,
  orderAmounts: any,
  expiresAt: Date,
) {
  const [newOrder] = await tx
    .insert(order)
    .values({
      userId: orderData.userId,
      eventId: orderData.eventId,
      side: orderData.side,
      type: orderData.type,
      orderType: orderData.orderType,
      originalQuantity: orderData.quantity,
      remainingQuantity: orderData.quantity,
      limitPrice: orderData.limitPrice,
      timeInForce: orderData.timeInForce || "GTC",
      fees: orderAmounts.estimatedFees,
      totalAmount: orderAmounts.totalAmount,
      expiresAt,
    })
    .returning();

  return newOrder;
}

/**
 * Create a market order in the database
 */
export async function createMarketOrder(
  tx: any,
  orderData: OrderData,
  orderAmounts: any,
  expiresAt: Date,
) {
  const [newOrder] = await tx
    .insert(order)
    .values({
      userId: orderData.userId,
      eventId: orderData.eventId,
      side: orderData.side,
      type: orderData.type,
      orderType: orderData.orderType,
      originalQuantity: orderData.quantity,
      remainingQuantity: orderData.quantity,
      timeInForce: orderData.timeInForce || "IOC", // Market orders typically use IOC
      fees: orderAmounts.estimatedFees,
      totalAmount: orderAmounts.totalAmount,
      slippageTolerance: DEFAULT_SLIPPAGE_TOLERANCE.toString(),
      expiresAt,
    })
    .returning();

  return newOrder;
}

/**
 * Calculate the total amount required for a limit order
 * For limit orders: (quantity * limit_price) + fees
 */
export function calculateLimitOrderAmount(orderData: OrderData) {
  if (!orderData.limitPrice) {
    throw new Error("Limit price is required for limit orders");
  }

  const quantity = new Decimal(orderData.quantity);
  const limitPrice = new Decimal(orderData.limitPrice);

  const baseAmount = quantity.mul(limitPrice);
  const estimatedFees = baseAmount.mul(TAKER_FEE_RATE);
  const totalAmount = baseAmount.add(estimatedFees);

  return {
    baseAmount: baseAmount.toString(),
    estimatedFees: estimatedFees.toString(),
    totalAmount: totalAmount.toString(),
    effectivePrice: limitPrice.toString(),
  };
}

/**
 * Calculate the total amount required for a market order with slippage protection
 * For market orders: (quantity * estimated_price * (1 + slippage)) + fees
 */
export function calculateMarketOrderAmount(
  orderData: OrderData,
  slippageTolerance: Decimal = DEFAULT_SLIPPAGE_TOLERANCE,
) {
  const quantity = new Decimal(orderData.quantity);

  const estimatedPrice = new Decimal(orderData.price || "5.00");

  // Calculate base amount at estimated price
  const baseAmount = quantity.mul(estimatedPrice);

  const slippageAmount = baseAmount.mul(slippageTolerance);
  const amountWithSlippage = baseAmount.add(slippageAmount);

  // Calculate fees on the amount with slippage protection
  const estimatedFees = amountWithSlippage.mul(TAKER_FEE_RATE);
  const totalAmount = amountWithSlippage.add(estimatedFees);

  return {
    baseAmount: baseAmount.toString(),
    slippageAmount: slippageAmount.toString(),
    amountWithSlippage: amountWithSlippage.toString(),
    estimatedFees: estimatedFees.toString(),
    totalAmount: totalAmount.toString(),
    effectivePrice: estimatedPrice.toString(),
    slippageTolerance: slippageTolerance.toString(),
  };
}
