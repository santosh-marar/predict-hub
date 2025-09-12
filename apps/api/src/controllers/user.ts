import { Request, Response } from "express";
import asyncMiddleware from "src/middleware/async-middleware";
import {
  db,
  event,
  notification,
  position,
  transactions,
  user,
  wallet,
} from "@repo/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { AuthRequest } from "src/middleware/auth";

export const getProfile = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id!;

    const userProfile = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userWallet = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId))
      .limit(1);

    const stats = await db
      .select({
        totalPositions: sql`count(${position.id})`,
        totalVolume: sql`sum(${position.totalInvested})`,
        totalPnl: sql`sum(${position.realizedPnl} + ${position.unrealizedPnl})`,
      })
      .from(position)
      .where(eq(position.userId, userId));

    res.json({
      user: userProfile[0],
      wallet: userWallet[0] || null,
      stats: stats[0],
    });
  },
);

export const updateProfile = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id!;
    const { name, image } = req.body;

    const updatedUser = await db
      .update(user)
      .set({
        name,
        image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: updatedUser[0] });
  },
);

export const getPositions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id!;
  const { status, limit = "50", offset = "0" } = req.query;

  // Build where conditions array
  const whereConditions = [eq(position.userId, userId)];

  // Add status filter if provided and valid
  if (status && typeof status === "string") {
    const validStatuses = [
      "draft",
      "active",
      "ended",
      "resolved",
      "cancelled",
    ] as const;
    if (validStatuses.includes(status as any)) {
      whereConditions.push(
        eq(event.status, status as (typeof validStatuses)[number]),
      );
    }
  }

  // Build the query with all conditions at once
  const query = db
    .select({
      position: position,
      event: {
        id: event.id,
        title: event.title,
        status: event.status,
        endTime: event.endTime,
      },
    })
    .from(position)
    .leftJoin(event, eq(position.eventId, event.id))
    .where(and(...whereConditions))
    .orderBy(desc(position.updatedAt))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const positions = await query;

  res.json({ positions });
};

// export const getTransactions = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.user?.id!;
//     const { type, limit = "50", offset = "0" } = req.query;

//     // Build where conditions array
//     const whereConditions = [eq(transactions.userId, userId)];

//     // Add type filter if provided and valid
//     if (type && typeof type === "string") {
//       const validTypes = [
//         "trade",
//         "deposit",
//         "withdrawal",
//         "payout",
//         "refund",
//         "bonus",
//       ] as const;
//       if (validTypes.includes(type as any)) {
//         whereConditions.push(
//           eq(transactions.type, type as (typeof validTypes)[number])
//         );
//       }
//     }

//     // Build the query with all conditions at once
//     const transactions = await db
//       .select()
//       .from(transaction)
//       .where(and(...whereConditions))
//       .orderBy(desc(transaction.createdAt))
//       .limit(parseInt(limit as string))
//       .offset(parseInt(offset as string));

//     res.json({ transactions });
//   } catch (error) {
//     console.error("Get transactions error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getLeaderboardPosition = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id!;

    const leaderboard = await db
      .select({
        userId: wallet.userId,
        totalPnl: wallet.totalPnl,
        rank: sql`ROW_NUMBER() OVER (ORDER BY ${wallet.totalPnl} DESC)`,
      })
      .from(wallet)
      .orderBy(desc(wallet.totalPnl));

    const userPosition = leaderboard.find((entry) => entry.userId === userId);

    res.json({
      position: userPosition ? parseInt(userPosition.rank as string) : null,
      totalPnl: userPosition ? userPosition.totalPnl : "0",
    });
  },
);
