import { TradeExecution } from "@/types";
import { transactions } from "@repo/db";
import Decimal from "decimal.js";

/**
 * Create transaction records for order book trades
 */
export async function createTransactionRecords(
  tx: any,
  takerOrder: any,
  makerOrder: any,
  tradeExecution: TradeExecution
): Promise<void> {
  const amount = new Decimal(tradeExecution.amount);
  const makerFee = new Decimal(tradeExecution.makerFee);

  // Taker transaction
  await tx.insert(transactions).values({
    userId: takerOrder.userId,
    eventId: takerOrder.eventId,
    type: takerOrder.type === "buy" ? "buy" : "sell",
    amount: amount.toString(),
    takerFees: tradeExecution.takerFee.toString(),
    makerFees: makerFee.toString(),
    totalFees: tradeExecution.totalFees.toString(),
    status: "COMPLETED",
    createdAt: new Date(),
    completedAt: new Date(),
  });

  // Maker transaction
  await tx.insert(transactions).values({
    userId: makerOrder.userId,
    eventId: makerOrder.eventId,
    type: makerOrder.type === "buy" ? "buy" : "sell",
    amount: amount.toString(),
    makerFees: makerFee,
    takerFees: tradeExecution.takerFee,
    totalFees: tradeExecution.totalFees,
    status: "COMPLETED",
    createdAt: new Date(),
    completedAt: new Date(),
  });
}

/**
 * Create transaction record for AMM trades
 */
export async function createTransactionRecordAMM(
  tx: any,
  takerOrder: any,
  tradeExecution: TradeExecution
): Promise<void> {
  const amount = new Decimal(tradeExecution.amount);

  console.log("totalFees", tradeExecution.totalFees);

  console.log("About to insert:", {
    userId: takerOrder.userId,
    relatedOrderId: tradeExecution.takerOrderId,
    relatedEventId: takerOrder.eventId,
    type: takerOrder.type === "buy" ? "buy" : "sell",
    amount: amount.toString(),
    takerFees: tradeExecution.takerFee,
    totalFees: tradeExecution.totalFees,
    status: "COMPLETED",
    balanceBefore: tradeExecution.balanceBefore,
    balanceAfter: tradeExecution.balanceAfter,
  });

 try{
    await tx.insert(transactions).values({
      userId: takerOrder.userId,
      relatedOrderId: tradeExecution.takerOrderId,
      relatedEventId: takerOrder.eventId,
      type: takerOrder.type === "buy" ? "buy" : "sell",
      amount: amount.toString(),
      takerFees: tradeExecution.takerFee,
      totalFees: tradeExecution.totalFees,
      status: "COMPLETED",
      balanceBefore: tradeExecution.balanceBefore,
      balanceAfter: tradeExecution.balanceAfter,
      createdAt: new Date(),
      completedAt: new Date(),
    });
 }catch(e){
    console.log("error", e);
 }
}