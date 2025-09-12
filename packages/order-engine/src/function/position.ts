import Decimal from "decimal.js";
import { and, eq } from "drizzle-orm";
import { position } from "@repo/db";
import { TradeExecution } from "@/types";

/**
 * Upsert user position (create)
 */
export async function upsertUserPosition(
  tx: any,
  positionData: any,
): Promise<void> {
  const existingPosition = await tx
    .select()
    .from(position)
    .where(
      and(
        eq(position.userId, positionData.takerUserId),
        eq(position.eventId, positionData.eventId),
        eq(position.side, positionData.side),
        eq(position.type, positionData.type),
      ),
    )
    .limit(1);

  if (existingPosition.length > 0) {
    // Update existing position
    const existing = existingPosition[0];
    const existingQuantity = new Decimal(existing.shares || 0);
    const existingAmount = new Decimal(existing.totalInvested || 0);

    const newQuantity = existingQuantity.add(positionData.quantity);
    const newTotalInvestment = existingAmount.add(
      new Decimal(positionData.totalFees),
    );

    const newAveragePrice = newQuantity.isZero()
      ? new Decimal(0)
      : newTotalInvestment.div(newQuantity);

    await tx
      .update(position)
      .set({
        shares: newQuantity.toString(),
        totalInvested: newTotalInvestment.toString(),
        averagePrice: newAveragePrice.toString(),
        updatedAt: new Date(),
      })
      .where(eq(position.id, existing.id));
  } else {
    // Create new position
    await tx.insert(position).values({
      userId: positionData.takerUserId,
      eventId: positionData.eventId,
      side: positionData.side,
      type: positionData.type,
      shares: positionData.quantity.toString(),
      totalInvested: positionData.totalFees.toString(),
      averagePrice: new Decimal(positionData.totalFees)
        .div(positionData.quantity)
        .toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Update user positions for order book trades
 */
export async function updateUserPositions(
  tx: any,
  takerOrder: any,
  makerOrder: any,
  tradeExecution: TradeExecution,
): Promise<void> {
  const quantity = tradeExecution.quantity;

  // Update taker position
  await upsertUserPosition(tx, {
    userId: takerOrder.userId,
    eventId: takerOrder.eventId,
    side: takerOrder.side,
    quantity: takerOrder.type === "buy" ? quantity : quantity,
    averagePrice: new Decimal(tradeExecution.price),
    totalAmount: new Decimal(tradeExecution.amount),
  });

  // Update maker position
  await upsertUserPosition(tx, {
    userId: makerOrder.userId,
    eventId: makerOrder.eventId,
    side: makerOrder.side,
    quantity: makerOrder.type === "buy" ? quantity : quantity,
    averagePrice: new Decimal(tradeExecution.price),
    totalAmount: new Decimal(tradeExecution.amount),
  });
}

/**
 * Update user position for AMM trades
 */
export async function updateUserPositionAMM(
  tx: any,
  takerOrder: any,
  tradeExecution: TradeExecution,
): Promise<void> {
  const quantity = tradeExecution.quantity;

  await upsertUserPosition(tx, {
    userId: takerOrder.userId,
    eventId: takerOrder.eventId,
    side: takerOrder.side,
    shares: quantity,
    // quantity: takerOrder.type === "buy" ? quantity : quantity.neg(),
    quantity: takerOrder.type === "buy" ? quantity : quantity,
    averagePrice: new Decimal(tradeExecution.price),
    totalAmount: new Decimal(tradeExecution.amount),
  });
}
