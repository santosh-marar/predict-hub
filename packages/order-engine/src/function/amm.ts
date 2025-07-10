import Decimal from "decimal.js";
import { insertTradeRecord } from "./trade";
import { TAKER_FEE_RATE } from "@/constants";
import { event, order, wallet } from "@repo/db";
import { TradeExecution } from "@/types";
import { eq } from "drizzle-orm";
import { upsertUserPosition } from "./position";
import { createTransactionRecordAMM } from "./transaction";

/**
 * Execute trade against AMM when order book can't fulfill completely
 */
export async function executeAMMTrade(
  tx: any,
  newOrder: any,
  eventData: any,
  remainingQuantity: any
): Promise<TradeExecution | null> {
  // Get current AMM price based on side
  const currentPrice =
    newOrder.side === "yes"
      ? new Decimal(eventData.lastYesPrice)
      : new Decimal(eventData.lastNoPrice);

  let ammPrice = currentPrice;

  if (newOrder.orderType === "limit") {
    const limitPrice = new Decimal(newOrder.limitPrice);

    // Check if AMM price is within limit
    if (newOrder.type === "buy" && ammPrice.gt(limitPrice)) {
      return null;
    }
    if (newOrder.type === "sell" && ammPrice.lt(limitPrice)) {
      return null;
    }
  }

  // Calculate trade amount and fees
  const tradeAmount = remainingQuantity.mul(ammPrice);
  const takerFee = tradeAmount.mul(TAKER_FEE_RATE);
  const totalCost = tradeAmount.add(takerFee);

  // Get taker wallet
  const [takerWallet] = await tx
    .select()
    .from(wallet)
    .where(eq(wallet.userId, newOrder.userId))
    .limit(1);

  const takerBalanceBefore = new Decimal(takerWallet.balance);
  const takerBalanceAfter = takerBalanceBefore.sub(totalCost);

  // Create AMM trade execution
  const ammTradeExecution: TradeExecution = {
    takerUserId: newOrder.userId,
    takerOrderId: newOrder.id,
    makerUserId: "amm-bot",
    eventId: newOrder.eventId,
    side: newOrder.side,
    quantity: Number(remainingQuantity),
    price: ammPrice,
    amount: tradeAmount,
    makerFee: Decimal(0), // No maker in AMM trades
    takerFee: takerFee,
    tradeType: "AMM_POOL",
    executedAt: new Date(),
    totalFees: tradeAmount.plus(takerFee),
    balanceAfter: takerBalanceAfter,
    balanceBefore: takerBalanceBefore,
  };

  // 1. Insert trade record and transfer funds
  await insertTradeRecord(tx, ammTradeExecution);

  // 2. Update Or Insert position of user
  await upsertUserPosition(tx, ammTradeExecution);

  // 3. Insert transaction record
  await createTransactionRecordAMM(tx, newOrder, ammTradeExecution);

  // 4. Calculate new AMM price after trade
  const { newYesPrice, newNoPrice, newYesShares, newNoShares } =
    calculateNewPriceAfterTrade(
      eventData.totalYesShares,
      eventData.totalNoShares,
      newOrder.side,
      remainingQuantity
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
          Number(ammTradeExecution.totalFees) /
          Number(newOrder.originalQuantity)
        ).toFixed(4)
      ),
      fees: parseFloat(
        (
          Number(ammTradeExecution.totalFees) - Number(ammTradeExecution.amount)
        ).toFixed(4)
      ),
      totalFees: ammTradeExecution.totalFees, 
      filledAt: new Date(),
      remainingQuantity: 0,
    })
    .where(eq(order.id, newOrder.id));

  // Todo: Update taker wallet

  return ammTradeExecution;
}

// Function to calculate new AMM price after trade
export function calculateNewPriceAfterTrade(
  currentYesShares: number,
  currentNoShares: number,
  tradeSide: string,
  tradeQuantity: number
) {
  const k = currentYesShares * currentNoShares;

  let newYesShares, newNoShares;

  if (tradeSide === "yes") {
    newYesShares = currentYesShares - tradeQuantity;
    newNoShares = Math.floor(k / newYesShares);
  } else {
    newNoShares = currentNoShares - tradeQuantity;
    newYesShares = Math.floor(k / newNoShares);
  }

  const totalShares = newYesShares + newNoShares;
  const newYesPrice = Math.max(
    0.5,
    Math.min(9.5, (newNoShares / totalShares) * 10)
  );
  const newNoPrice = 10 - newYesPrice;

  return {
    newYesPrice,
    newNoPrice,
    newYesShares,
    newNoShares,
  };
}
