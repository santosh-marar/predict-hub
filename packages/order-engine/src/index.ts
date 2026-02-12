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
import { logger } from "./utils/logger";
import { KAFKA_TOPICS } from "@predict-hub/kafka";
import { enqueueOutboxEvent, publishPendingOutboxEvents } from "./outbox";
import { randomUUID } from "crypto";
/**
 * Main entry point for placing orders
 */
export async function placeOrder(orderData: OrderData): Promise<any> {
  const orderId = orderData.id ?? randomUUID();
  try {
    const result = await db.transaction(async (tx: any) => {
      // 1. Validate event is active
      const eventData = await validateEvent(tx, orderData.eventId);

      // Idempotency: if the order already exists, return it without reprocessing
      const existingOrder =
        orderId &&
        (await tx
          .select()
          .from(order)
          .where(eq(order.id, orderId))
          .limit(1));

      if (existingOrder && existingOrder[0]) {
        logger.info(
          {
            context: "ORDER_PLACEMENT_IDEMPOTENT",
            orderId,
            eventId: orderData.eventId,
          },
          "Order already processed, skipping duplicate"
        );

        await enqueueOutboxEvent(
          tx,
          KAFKA_TOPICS.ORDER_CREATED,
          orderData.eventId,
          { newOrder: existingOrder[0], eventData },
          orderId
        );

        return { newOrder: existingOrder[0], eventData };
      }

      // 2. Validate user balance and calculate order amounts
      await validateUserBalance(tx, orderData);

      let orderAmounts;
      let newOrder;

      // 3. Create order based on order type
      if (orderData.orderType === "limit") {
        orderAmounts = calculateLimitOrderAmount(orderData);
        newOrder = await createLimitOrder(
          tx,
          { ...orderData, id: orderId },
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
          { ...orderData, id: orderId },
          orderAmounts,
          eventData.endTime
        );
      } else {
        logger.error(
          {
            context: "ORDER_PLACEMENT_ERROR",
            reason: "Invalid order type",
            expected: ["limit", "market"],
            userId: orderData?.userId,
          },
          "Order placement failed — invalid order type"
        );
        throw new Error("Invalid order type");
      }

      // 4. Lock user funds
      await lockUserFunds(tx, orderData.userId, newOrder.totalAmount);

      // 5. Log success
      logger.info(
        {
          context: "ORDER_PLACEMENT_SUCCESS",
          userId: orderData.userId,
          orderId: newOrder.id,
          eventId: orderData.eventId,
          orderType: orderData.orderType,
          totalAmount: newOrder.totalAmount,
        },
        "Order created successfully"
      );

      // 6. Queue Kafka message in outbox (sent after transaction commits)
      await enqueueOutboxEvent(
        tx,
        KAFKA_TOPICS.ORDER_CREATED,
        orderData.eventId,
        { newOrder, eventData },
        orderId
      );

      return { newOrder, eventData };
    });

    // Publish outbox only after transaction is committed
    await publishPendingOutboxEvents();

    return result.newOrder;
  } catch (error: any) {
    logger.error(
      {
        context: "ORDER_PLACEMENT_ERROR",
        userId: orderData?.userId,
        eventId: orderData?.eventId,
        reason: error.message,
        stack: error.stack,
      },
      "Order placement transaction failed"
    );
    throw error;
  }
}

/**
 * Core order matching logic with complete trade execution and AMM fallback
 */
export async function matchOrder(
  newOrder: any,
  eventData: any
): Promise<TradeExecution[]> {
  try {
    return await db.transaction(async (tx: any) => {
      logger.info(
        {
          context: "ORDER_MATCHING_STARTED",
          eventId: newOrder.eventId,
          orderId: newOrder.id,
          userId: newOrder.userId,
          side: newOrder.side,
          type: newOrder.type,
        },
        "Matching order process started"
      );

      const [freshOrder] = await tx
        .select()
        .from(order)
        .where(eq(order.id, newOrder.id))
        .limit(1);

      if (!freshOrder) {
        throw new Error("Order not found for matching");
      }

      if (freshOrder.status !== "pending") {
        logger.info(
          {
            context: "ORDER_MATCHING_SKIPPED",
            orderId: newOrder.id,
            status: freshOrder.status,
          },
          "Order already processed; skipping re-match"
        );
        return [];
      }

      newOrder = { ...newOrder, ...freshOrder };

      await loadOrdersFromDatabase(tx, newOrder.eventId);

      const trades: TradeExecution[] = [];
      let remainingQuantity = new Decimal(newOrder.remainingQuantity);

      // Step 1: Get matching orders
      const matchingOrders = getMatchingOrdersArray(newOrder);

      for (const matchingOrder of matchingOrders) {
        if (remainingQuantity.isZero()) break;

        const tradeQuantity = Decimal.min(
          remainingQuantity,
          new Decimal(matchingOrder.remainingQuantity)
        );

        const tradePrice = determineTradePrice(newOrder, matchingOrder);
        const tradeAmount = tradeQuantity.mul(tradePrice);

        // Fees
        const makerFee = tradeAmount.mul(MAKER_FEE_RATE);
        const takerFee = tradeAmount.mul(TAKER_FEE_RATE);
        const takerShareSell = tradeAmount.sub(makerFee);

        // Fetch wallets
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

        if (!makerWallet || !takerWallet) {
          logger.error(
            {
              context: "ORDER_MATCHING_ERROR",
              reason: "Wallet not found",
              makerUserId: matchingOrder.userId,
              takerUserId: newOrder.userId,
            },
            "Maker or Taker wallet missing"
          );
          throw new Error("Wallet not found");
        }

        // Balance calculations
        const makerProceeds = tradeAmount.sub(makerFee);
        const makerBalanceAfter = new Decimal(makerWallet.balance).add(
          makerProceeds
        );

        const takerCost = tradeAmount.add(takerFee);
        const takerBalanceAfter = new Decimal(takerWallet.balance).sub(
          takerCost
        );

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
          makerFee,
          takerFee,
          totalFees: tradeAmount.plus(makerFee).plus(takerFee),
          tradeType: "ORDER_BOOK",
          executedAt: new Date(),
          balanceBefore: new Decimal(takerWallet.balance),
          balanceAfter: takerBalanceAfter,
        };

        // Step 2: Record the trade
        await insertTradeRecord(tx, tradeExecution);
        await upsertUserPosition(tx, tradeExecution);
        await createTransactionRecords(
          tx,
          newOrder,
          matchingOrder,
          tradeExecution
        );

        // Step 3: Update event prices and stats
        const { newYesPrice, newNoPrice, newYesShares, newNoShares } =
          calculateNewPriceAfterTrade(
            eventData.totalYesShares,
            eventData.totalNoShares,
            newOrder.side,
            Number(remainingQuantity)
          );

        await tx
          .update(event)
          .set({
            totalYesShares: newYesShares,
            totalNoShares: newNoShares,
            lastYesPrice: newYesPrice,
            lastNoPrice: newNoPrice,
          })
          .where(eq(event.id, eventData.id));

        // Step 4: Update order + wallet states
        await tx
          .update(order)
          .set({
            status: "filled",
            filledQuantity: newOrder.originalQuantity,
            averageFillPrice: parseFloat(
              (
                Number(tradeExecution.totalFees) /
                Number(newOrder.originalQuantity)
              ).toFixed(4)
            ),
            fees: parseFloat(
              (
                Number(tradeExecution.totalFees) - Number(tradeExecution.amount)
              ).toFixed(4)
            ),
            totalFees: tradeExecution.totalFees,
            filledAt: new Date(),
            remainingQuantity: 0,
          })
          .where(eq(order.id, newOrder.id));

        await deductLockedFunds(tx, newOrder.userId, tradeExecution.totalFees);
        await creditUserBalance(tx, newOrder.userId, takerShareSell);
        await unlockUserFunds(tx, newOrder.userId, tradeExecution.totalFees);

        trades.push(tradeExecution);
        remainingQuantity = remainingQuantity.sub(tradeQuantity);
      }

      // Step 5: Fallback to AMM if needed
      if (remainingQuantity.gt(0)) {
        if (newOrder.type === "buy") {
          const ammYesShares = new Decimal(eventData.totalYesShares);
          const ammNoShares = new Decimal(eventData.totalNoShares);

          const side = newOrder.side;
          const ammHasEnoughLiquidity =
            (side === "yes" && ammNoShares.gte(remainingQuantity)) ||
            (side === "no" && ammYesShares.gte(remainingQuantity));

          if (ammHasEnoughLiquidity) {
            const ammTrade = await executeAMMTrade(
              tx,
              newOrder,
              eventData,
              remainingQuantity
            );
            if (ammTrade) trades.push(ammTrade);
          } else {
            logger.warn(
              {
                context: "AMM_LIQUIDITY_WARNING",
                side,
                remainingQuantity: remainingQuantity.toString(),
              },
              `AMM has insufficient liquidity for ${side} side`
            );
          }
        }
      }

      logger.info(
        {
          context: "ORDER_MATCHING_SUCCESS",
          eventId: newOrder.eventId,
          orderId: newOrder.id, 
          matchedTrades: trades.length,
        },
        "Order matching and execution completed successfully"
      );

      return trades;
    });
  } catch (error: any) {
    logger.error(
      {
        context: "ORDER_MATCHING_FAILED",
        userId: newOrder?.userId,
        eventId: newOrder?.eventId,
        orderId: newOrder?.id,
        reason: error.message,
        stack: error.stack,
      },
      "Order matching transaction failed"
    );
    throw error;
  }
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
