import { Request, Response, NextFunction } from "express";
import { db, wallet, transactions, position } from "@repo/db";
import { eq, desc, and, sql, sum, count } from "drizzle-orm";
import { z } from "zod";
import { AuthRequest } from "src/middleware/auth";
import asyncMiddleware from "src/middleware/async-middleware";

// Validation schemas
const depositSchema = z.object({
  amount: z.number().positive().max(10000),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

const withdrawSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().optional(),
});

const queryTransactionSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
  type: z
    .enum(["deposit", "withdrawal", "trade", "payout", "refund", "bonus"])
    .optional(),
  status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Get wallet balance and info
export const getWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id!;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get or create wallet
    let [userWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (!userWallet) {
      [userWallet] = await db.insert(wallet).values({ userId }).returning();
    }

    // Get portfolio value from positions
    const [portfolioValue] = await db
      .select({
        totalInvested: sql<string>`COALESCE(SUM(${position.totalInvested}), 0)`,
        totalUnrealizedPnl: sql<string>`COALESCE(SUM(${position.unrealizedPnl}), 0)`,
        totalRealizedPnl: sql<string>`COALESCE(SUM(${position.realizedPnl}), 0)`,
      })
      .from(position)
      .where(eq(position.userId, userId));

    const balance = parseFloat(userWallet.balance);
    const lockedBalance = parseFloat(userWallet.lockedBalance);
    const totalInvested = parseFloat(portfolioValue.totalInvested || "0");
    const unrealizedPnl = parseFloat(portfolioValue.totalUnrealizedPnl || "0");
    const realizedPnl = parseFloat(portfolioValue.totalRealizedPnl || "0");
    const portfolioCurrentValue = totalInvested + unrealizedPnl;
    const totalValue = balance + lockedBalance + portfolioCurrentValue;

    res.json({
      success: true,
      data: {
        balance,
        lockedBalance,
        availableBalance: balance,
        totalValue,
        portfolio: {
          invested: totalInvested,
          currentValue: portfolioCurrentValue,
          unrealizedPnl,
          realizedPnl,
          totalPnl: unrealizedPnl + realizedPnl,
        },
        lifetime: {
          deposited: parseFloat(userWallet.totalDeposited),
          withdrawn: parseFloat(userWallet.totalWithdrawn),
          pnl: parseFloat(userWallet.totalPnl),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Deposit funds
export const deposit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = depositSchema.parse(req.body);
    const userId = req.user?.id!;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current wallet
    let [userWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (!userWallet) {
      [userWallet] = await db.insert(wallet).values({ userId }).returning();
    }

    const currentBalance = parseFloat(userWallet.balance);
    const newBalance = currentBalance + validatedData.amount;

    // Create transaction record
    const [newTransaction] = await db
      .insert(transactions)
      // @ts-ignore
      .values({
        userId,
        type: "deposit",
        amount: validatedData.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        paymentMethod: validatedData.paymentMethod,
        paymentReference: validatedData.paymentReference,
        status: "completed", // In real app, this would be 'pending' until payment confirmed
        description: `Deposit of $${validatedData.amount}`,
      })
      .returning();

    // Update wallet balance
    await db
      .update(wallet)
      .set({
        balance: newBalance.toString(),
        totalDeposited: sql`${wallet.totalDeposited} + ${validatedData.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallet.userId, userId));

    res.status(201).json({
      success: true,
      data: {
        transaction: newTransaction,
        newBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw funds
export const withdraw = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = withdrawSchema.parse(req.body);
    const userId = req.user?.id!;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current wallet
    const [userWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (!userWallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const currentBalance = parseFloat(userWallet.balance);

    if (currentBalance < validatedData.amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const newBalance = currentBalance - validatedData.amount;

    // Create transaction record
    const [newTransaction] = await db
      .insert(transactions)
      // @ts-ignore
      .values({
        userId,
        type: "withdrawal",
        amount: validatedData.amount.toString(),
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance.toString(),
        paymentMethod: validatedData.paymentMethod,
        status: "pending", // Withdrawals typically need processing
        description: `Withdrawal of $${validatedData.amount}`,
      })
      .returning();

    // Update wallet balance
    await db
      .update(wallet)
      .set({
        balance: newBalance.toString(),
        totalWithdrawn: sql`${wallet.totalWithdrawn} + ${validatedData.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallet.userId, userId));

    res.status(201).json({
      success: true,
      data: {
        transaction: newTransaction,
        newBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction history
// export const getTransactions = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const query = queryTransactionSchema.parse(req.query);
//     const userId = req.user?.id!;
//     const offset = (query.page - 1) * query.limit;

//     if (!userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     // Build where conditions
//     const whereConditions = [eq(transactions.userId, userId)];

//     if (query.type) {
//       whereConditions.push(eq(transaction.type, query.type));
//     }
//     if (query.status) {
//       whereConditions.push(eq(transaction.status, query.status));
//     }
//     if (query.dateFrom) {
//       whereConditions.push(sql`${transaction.createdAt} >= ${query.dateFrom}`);
//     }
//     if (query.dateTo) {
//       whereConditions.push(sql`${transaction.createdAt} <= ${query.dateTo}`);
//     }

//     const transactions = await db
//       .select({
//         id: transaction.id,
//         type: transaction.type,
//         amount: transaction.amount,
//         balanceBefore: transaction.balanceBefore,
//         balanceAfter: transaction.balanceAfter,
//         paymentMethod: transaction.paymentMethod,
//         paymentReference: transaction.paymentReference,
//         status: transaction.status,
//         description: transaction.description,
//         createdAt: transaction.createdAt,
//         completedAt: transaction.completedAt,
//       })
//       .from(transaction)
//       .where(and(...whereConditions))
//       .orderBy(desc(transaction.createdAt))
//       .limit(query.limit)
//       .offset(offset);

//     // Get total count
//     const [{ count: totalCount }] = await db
//       .select({ count: count() })
//       .from(transaction)
//       .where(and(...whereConditions));

//     res.json({
//       success: true,
//       data: {
//         transactions,
//         pagination: {
//           page: query.page,
//           limit: query.limit,
//           total: totalCount,
//           pages: Math.ceil(totalCount / query.limit),
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Get wallet statistics
// export const getWalletStats = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     const { period = '30d' } = req.query;

//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     // Calculate date range based on period
//     const now = new Date();
//     let startDate: Date;

//     switch (period) {
//       case '7d':
//         startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         break;
//       case '30d':
//         startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000

// Get user wallet balance
export const getWalletBalance = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const requestUserId = req.user?.id;

    // Users can only view their own wallet
    if (requestUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view this wallet",
      });
    }

    const userWallet = await db
      .select({
        id: wallet.id,
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        totalPnl: wallet.totalPnl,
      })
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    if (userWallet.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const availableBalance =
      parseFloat(userWallet[0].balance) -
      parseFloat(userWallet[0].lockedBalance);

    res.json({
      success: true,
      data: {
        ...userWallet[0],
        availableBalance: availableBalance.toFixed(2),
      },
    });
  },
);

// Update wallet balance (internal use)
export const updateWalletBalance = async (
  userId: string,
  amount: number,
  type: "add" | "subtract" | "lock" | "unlock",
  tx?: any,
) => {
  try {
    const dbInstance = tx || db;

    let updateQuery;

    switch (type) {
      case "add":
        updateQuery = {
          balance: sql`${wallet.balance} + ${amount}`,
          updatedAt: new Date(),
        };
        break;
      case "subtract":
        updateQuery = {
          balance: sql`${wallet.balance} - ${amount}`,
          updatedAt: new Date(),
        };
        break;
      case "lock":
        updateQuery = {
          balance: sql`${wallet.balance} - ${amount}`,
          lockedBalance: sql`${wallet.lockedBalance} + ${amount}`,
          updatedAt: new Date(),
        };
        break;
      case "unlock":
        updateQuery = {
          balance: sql`${wallet.balance} + ${amount}`,
          lockedBalance: sql`${wallet.lockedBalance} - ${amount}`,
          updatedAt: new Date(),
        };
        break;
    }

    const updated = await dbInstance
      .update(wallet)
      .set(updateQuery)
      .where(eq(wallet.userId, userId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw error;
  }
};

// Create wallet for new user (internal use)
export const createWallet = async (
  userId: string,
  initialBalance: number = 10000,
) => {
  try {
    const newWallet = await db
      .insert(wallet)
      .values({
        userId,
        balance: initialBalance.toString(),
        lockedBalance: "0",
        totalDeposited: initialBalance > 0 ? initialBalance.toString() : "0",
        totalWithdrawn: "0",
        totalPnl: "0",
      })
      .returning();

    return newWallet[0];
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};
