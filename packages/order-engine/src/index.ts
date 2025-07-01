import { db, order, wallet } from "@repo/db";
import { lockUserFunds, validateUserBalance } from "./function/fund";
import { TAKER_FEE_RATE, DEFAULT_SLIPPAGE_TOLERANCE, MAKER_FEE_RATE } from "./constants";
import { validateEvent } from "./validation";
import { calculateLimitOrderAmount, calculateMarketOrderAmount, createLimitOrder, createMarketOrder } from "./function/order";
import { insertTradeRecord } from "./function/trade";
import { executeAMMTrade } from "./function/amm";
import { OrderBookEntry, OrderData, TradeExecution } from "./types";
import Decimal from "decimal.js";
import {sql, desc, eq, gt, gte, asc, lte, and} from "drizzle-orm";



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
      order: newOrder,
      orderAmounts,
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
  const trades: TradeExecution[] = [];
  let remainingQuantity = new Decimal(newOrder.remainingQuantity);

  // Step 1: Try to match against existing orders in the order book
  const matchingOrders = await getMatchingOrders(tx, newOrder);

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

    // Insert trade record and update orders
    await insertTradeRecord(tx, tradeExecution);

    // Todo: Update Or Insert position of user

    // Todo: Insert transaction record

    // Todo: Update both parties user wallet

    // Todo: Update order fill status & remaining quantity and status & filled quantity & average fill price & fees & total fees  & filled at

    trades.push(tradeExecution);
    remainingQuantity = remainingQuantity.sub(tradeQuantity);
  }

  // Step 2: AMM Fallback - If there's still remaining quantity
  if (remainingQuantity.gt(0)) {
    const ammTrade = await executeAMMTrade(
      tx,
      newOrder,
      eventData,
      remainingQuantity
    );
    if (ammTrade) {
      trades.push(ammTrade);
    }
  }

  return trades;
}

/**
 * Get orders that can match with the new order
 */
export async function getMatchingOrders(
  tx: any,
  newOrder: any
): Promise<OrderBookEntry[]> {
  // Match same side (YES with YES, NO with NO) but opposite type (buy with sell)
  const oppositeType = newOrder.type === "buy" ? "sell" : "buy";
  const sameSide = newOrder.side; 

  let priceCondition: any;
  let orderByClause: any;

  if (newOrder.orderType === "market") {
    // Market orders match at any price
    priceCondition = sql`1=1`;
    orderByClause =
      newOrder.type === "buy"
        ? asc(order.limitPrice) 
        : desc(order.limitPrice); 
  } else {
    // Limit orders match based on price improvement
    if (newOrder.type === "buy") {
      priceCondition = lte(order.limitPrice, newOrder.limitPrice);
      orderByClause = asc(order.limitPrice); 
    } else {
      priceCondition = gte(order.limitPrice, newOrder.limitPrice);
      orderByClause = desc(order.limitPrice); 
    }
  }

  return await tx
    .select()
    .from(order)
    .where(
      and(
        eq(order.eventId, newOrder.eventId),
        eq(order.side, sameSide),
        eq(order.type, oppositeType), 
        eq(order.status, "pending"),
        gt(order.remainingQuantity, "0"),
        priceCondition
      )
    )
    .orderBy(orderByClause, asc(order.createdAt)) 
    .limit(50);
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

