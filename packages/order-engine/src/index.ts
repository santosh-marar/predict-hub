import { db, event, order, wallet } from "@repo/db";
import { creditUserBalance, deductLockedFunds, lockUserFunds, unlockUserFunds, validateUserBalance } from "./function/fund";
import {
  TAKER_FEE_RATE,
  DEFAULT_SLIPPAGE_TOLERANCE,
  MAKER_FEE_RATE,
} from "./constants";
import { validateEvent } from "./validation";
import {
  calculateLimitOrderAmount,
  calculateMarketOrderAmount,
  createLimitOrder,
  createMarketOrder,
} from "./function/order";
import { insertTradeRecord } from "./function/trade";
import { calculateNewPriceAfterTrade, executeAMMTrade } from "./function/amm";
import { OrderBookEntry, OrderData, TradeExecution } from "./types";
import Decimal from "decimal.js";
import { sql, desc, eq, gt, gte, asc, lte, and } from "drizzle-orm";
import { upsertUserPosition } from "./function/position";
import { createTransactionRecords } from "./function/transaction";
import { getMatchingOrdersArray, loadOrdersFromDatabase } from "./match-engine";

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

    // 5. Attempt to match the order with order book if not fully filled or partially filled then fallback to AMM
    const trades = await matchOrder(tx, newOrder, eventData);

    return {
      trades,
    };
  });
}

/**
 * Core order matching logic with complete trade execution and AMM fallback
 */
export async function matchOrder(
  tx: any,
  newOrder: any,
  eventData: any
): Promise<TradeExecution[]> {
  await loadOrdersFromDatabase(tx, newOrder.eventId);

  const trades: TradeExecution[] = [];
  let remainingQuantity = new Decimal(newOrder.remainingQuantity);

  // Step 1: Get matching orders (no execution)
  const matchingOrders = getMatchingOrdersArray(newOrder);

  for (const matchingOrder of matchingOrders) {
    if (remainingQuantity.isZero()) break;

    const tradeQuantity = Decimal.min(
      remainingQuantity,
      new Decimal(matchingOrder.remainingQuantity)
    );

    const tradePrice = determineTradePrice(newOrder, matchingOrder);
    const tradeAmount = tradeQuantity.mul(tradePrice);

    // Calculate fees
    const makerFee = tradeAmount.mul(MAKER_FEE_RATE);
    const takerFee = tradeAmount.mul(TAKER_FEE_RATE);

    // Get user credit balance after selling stock
    const takerShareSell= tradeAmount.sub(makerFee)

    // Get wallet balances BEFORE trade
    const [makerWallet] = await tx
      .select()
      .from(wallet)
      .where(eq(wallet.userId, matchingOrder.userId))
      .limit(1);

    const [takerWallet] = await tx
      .select()
      .from(wallet)
      .where(eq(wallet.userId, newOrder.userId))
      .limit(1);

    // Calculate balance changes
    const makerBalanceBefore = new Decimal(makerWallet.balance);
    const takerBalanceBefore = new Decimal(takerWallet.balance);

    // Maker receives payment minus fees
    const makerProceeds = tradeAmount.sub(makerFee);
    const makerBalanceAfter = makerBalanceBefore.add(makerProceeds);

    // Taker pays amount plus fees
    const takerCost = tradeAmount.add(takerFee);
    const takerBalanceAfter = takerBalanceBefore.sub(takerCost);

    // Execute the order book trade
    const tradeExecution: TradeExecution = {
      makerUserId: matchingOrder.userId,
      takerUserId: newOrder.userId,
      makerOrderId: matchingOrder.id,
      takerOrderId: newOrder.id,
      eventId: newOrder.eventId,
      side: newOrder.side,
      type: newOrder.type,
      quantity: Number(tradeQuantity),
      price: tradePrice,
      amount: tradeAmount,
      makerFee: makerFee,
      takerFee: takerFee,
      totalFees: tradeAmount.plus(makerFee).plus(takerFee),
      tradeType: "ORDER_BOOK",
      executedAt: new Date(),
      balanceAfter: takerBalanceAfter,
      balanceBefore: takerBalanceAfter,
    };

    // 2. Insert trade record and update orders
    await insertTradeRecord(tx, tradeExecution);

    // 3. Update Or Insert position of user
    await upsertUserPosition(tx, tradeExecution);

    // 4. Insert transaction record
    await createTransactionRecords(tx, newOrder, matchingOrder, tradeExecution);

    // 4. Calculate new AMM price after trade
      const { newYesPrice, newNoPrice, newYesShares, newNoShares } =
        calculateNewPriceAfterTrade(
          eventData.totalYesShares,
          eventData.totalNoShares,
          newOrder.side,
          Number(remainingQuantity)
        );
    
      // 5. Update event data
      await tx
        .update(event)
        .set({
          totalYesShares: newYesShares,
          totalNoShares: newNoShares,
          lastYesPrice: newYesPrice,
          lastNoPrice: newNoPrice,
        })
        .where(eq(event.id, eventData.id));
    
      // 6. Update order status
      await tx
        .update(order)
        .set({
          status: "filled",
          filledQuantity: newOrder.originalQuantity,
          averageFillPrice: parseFloat(
            (
              Number(tradeExecution.totalFees) /
              Number(newOrder.originalQuantity)
            ).toFixed(4),
          ),
          fees: parseFloat(
            (
              Number(tradeExecution.totalFees) - Number(tradeExecution.amount)
            ).toFixed(4),
          ),
          totalFees: tradeExecution.totalFees,
          filledAt: new Date(),
          remainingQuantity: 0,
        })
        .where(eq(order.id, newOrder.id));
    
      // 7. Update taker wallet balance
      await deductLockedFunds(tx, newOrder.userId, tradeExecution.totalFees);

      // 8. Credit user balance
      await creditUserBalance(tx, newOrder.userId, takerShareSell);
    
      // 8. Unlock remaining funds
      await unlockUserFunds(tx, newOrder.userId, tradeExecution.totalFees);

    trades.push(tradeExecution);
    remainingQuantity = remainingQuantity.sub(tradeQuantity);
  }

  // Step 2: Fallback to AMM if remaining quantity exists
  if (remainingQuantity.gt(0)) {
    if (newOrder.type === "sell") {
      // Do nothing: sells should not be routed to the AMM
    } else {
      const ammYesShares = new Decimal(eventData.totalYesShares);
      const ammNoShares = new Decimal(eventData.totalNoShares);

      const isBuy = newOrder.type === "buy";
      const side = newOrder.side;

      const ammHasEnoughLiquidity = (() => {
        if (side === "yes" && isBuy) return ammNoShares.gte(remainingQuantity);
        if (side === "no" && isBuy) return ammYesShares.gte(remainingQuantity);
        return false; // no AMM trades for sells
      })();

      if (ammHasEnoughLiquidity) {
        const ammTrade = await executeAMMTrade(
          tx,
          newOrder,
          eventData,
          remainingQuantity
        );
        if (ammTrade) {
          trades.push(ammTrade);
        }
      } else {
        console.warn(
          `AMM does not have enough ${side === "yes" ? "no" : "yes"} shares to fulfill the remaining quantity for this ${side} buy order.`
        );
      }
    }
  }

  return trades;
}

/**
 * Determine trade price between two orders
 */
function determineTradePrice(newOrder: any, matchingOrder: any): Decimal {
  if (newOrder.orderType === "market") {
    // Market order takes the maker's price
    return new Decimal(matchingOrder.limitPrice);
  } else {
    // Limit order: maker gets their price (price-time priority)
    return new Decimal(matchingOrder.limitPrice);
  }
}
