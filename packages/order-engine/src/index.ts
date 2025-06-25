import { db } from "@repo/db";
import { lockUserFunds, validateUserBalance } from "./function/fund";
import { OrderData } from "./types";
import { TAKER_FEE_RATE, DEFAULT_SLIPPAGE_TOLERANCE } from "./constants";
import { validateEvent } from "./validation";
import { calculateLimitOrderAmount, calculateMarketOrderAmount, createLimitOrder, createMarketOrder } from "./function/order";



/**
 * Main entry point for placing orders
 */
export async function placeOrder(orderData: OrderData): Promise<any> {
  return await db.transaction(async (tx: any) => {
    // 1. Validate event is active
    const eventData = await validateEvent(tx, orderData.eventId);

    // 2. Validate user balance and calculate order amounts
    await validateUserBalance(tx, orderData);

    let orderAmounts;
    let newOrder;

    // 3. Create order based on order type
    if (orderData.orderType === "limit") {
      orderAmounts = calculateLimitOrderAmount(orderData);
      newOrder = await createLimitOrder(
        tx,
        orderData,
        orderAmounts,
        eventData.endTime
      );
    } else if (orderData.orderType === "market") {
      orderAmounts = calculateMarketOrderAmount(
        orderData,
        DEFAULT_SLIPPAGE_TOLERANCE
      );
      newOrder = await createMarketOrder(
        tx,
        orderData,
        orderAmounts,
        eventData.endTime
      );
    } else {
      throw new Error("Invalid order type. Must be 'limit' or 'market'");
    }

    // 4. Lock user funds
    await lockUserFunds(tx, orderData.userId, newOrder.totalAmount);

    return {
      order: newOrder,
      orderAmounts,
    };
  });
}




