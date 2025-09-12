import { eq, sql } from "drizzle-orm";
import { wallet } from "@repo/db";
import { OrderData } from "@/types";
import Decimal from "decimal.js";
import { calculateLimitOrderAmount, calculateMarketOrderAmount } from "./order";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "@/constants";

/**
 * Validate user has sufficient balance for the order
 */
export async function validateUserBalance(
  tx: any,
  orderData: OrderData,
): Promise<void> {
  const [userWallet] = await tx
    .select()
    .from(wallet)
    .where(eq(wallet.userId, orderData.userId))
    .limit(1);

  if (!userWallet) {
    throw new Error("User wallet not found");
  }

  const availableBalance = new Decimal(userWallet.balance).sub(
    new Decimal(userWallet.lockedBalance),
  );

  let requiredAmount: Decimal;

  if (orderData.orderType === "limit") {
    const { totalAmount } = calculateLimitOrderAmount(orderData);
    requiredAmount = new Decimal(totalAmount);
  } else if (orderData.orderType === "market") {
    const { totalAmount } = calculateMarketOrderAmount(
      orderData,
      DEFAULT_SLIPPAGE_TOLERANCE,
    );
    requiredAmount = new Decimal(totalAmount);
  } else {
    throw new Error("Invalid order type");
  }

  if (availableBalance.lt(requiredAmount)) {
    throw new Error(
      `Insufficient balance. Required: ${requiredAmount.toString()}, Available: ${availableBalance.toString()}`,
    );
  }
}

/**
 * Lock user funds for pending orders
 */
export async function lockUserFunds(
  tx: any,
  userId: string,
  amount: string,
): Promise<void> {
  await tx
    .update(wallet)
    .set({
      balance: sql`${wallet.balance} - ${amount}`,
      lockedBalance: sql`${wallet.lockedBalance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(wallet.userId, userId));
}

/**
 * Deduct locked funds from user
 */
export async function deductLockedFunds(
  tx: any,
  userId: string,
  amount: Decimal,
): Promise<void> {
  await tx
    .update(wallet)
    .set({
      lockedBalance: sql`locked_balance - ${amount.toString()}`,
      updatedAt: new Date(),
    })
    .where(eq(wallet.userId, userId));
}

/**
 * Unlock user funds after order is filled
 */
export async function unlockUserFunds(
  tx: any,
  userId: string,
  amount: Decimal,
): Promise<void> {
  const [userWallet] = await tx
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1);

  if (!userWallet) {
    throw new Error("User wallet not found");
  }

  const lockedBalance = new Decimal(userWallet.lockedBalance);

  await tx
    .update(wallet)
    .set({
      balance: sql`${wallet.balance} + ${lockedBalance.toString()}`,
      lockedBalance: sql`${wallet.lockedBalance} - ${lockedBalance.toString()}`,
      updatedAt: new Date(),
    })
    .where(eq(wallet.userId, userId));
}

/**
 * Credit user balance
 */
export async function creditUserBalance(
  tx: any,
  userId: string,
  amount: Decimal,
): Promise<void> {
  await tx
    .update(wallet)
    .set({
      availableBalance: sql`available_balance + ${amount.toString()}`,
      updatedAt: new Date(),
    })
    .where(eq(wallet.userId, userId));
}
