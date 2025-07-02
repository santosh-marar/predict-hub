import Decimal from "decimal.js";
import { insertTradeRecord } from "./trade";
import { TAKER_FEE_RATE } from "@/constants";
import { wallet } from "@repo/db";
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
  remainingQuantity: Decimal
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

  // Todo: After tarde calculate new AMM price after trade (simple bonding curve)

  // Todo: Update both parties user wallet

  // Todo: Update order fill status & remaining quantity and status & filled quantity & average fill price & fees & total fees  & filled at

  return ammTradeExecution;
}
