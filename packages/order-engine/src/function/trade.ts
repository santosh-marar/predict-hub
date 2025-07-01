import { TradeExecution } from "@/types";
import { trade } from "@repo/db";

/**
 * Insert trade record into database
 */
export async function insertTradeRecord(
  tx: any,
  tradeExecution: TradeExecution
): Promise<void> {
  await tx.insert(trade).values({
    makerUserId: tradeExecution.makerUserId,
    takerUserId: tradeExecution.takerUserId,
    makerOrderId: tradeExecution.makerOrderId,
    takerOrderId: tradeExecution.takerOrderId,
    eventId: tradeExecution.eventId,
    side: tradeExecution.side,
    quantity: tradeExecution.quantity,
    price: tradeExecution.price,
    amount: tradeExecution.amount,
    makerFee: tradeExecution.makerFee,
    takerFee: tradeExecution.takerFee,
    totalFees: tradeExecution.totalFees,
    tradeType: tradeExecution.tradeType,
    executedAt: tradeExecution.executedAt,
  });
}
