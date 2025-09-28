import asyncMiddleware from "../middleware/async-middleware";
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";
import { logger } from "../utils/logger";
import { and, db, eq, event, getTableColumns, position } from "@repo/db";

export const getUserPosition = asyncMiddleware(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    console.log("userId", userId);

    if (!userId) {
      logger.warn(
        { context: "GET_USER_POSITION_UNAUTHORIZED", userId },
        "Unauthorized request to get user position"
      );
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const positionOnEvent = await db
        .select({
          ...getTableColumns(position),
          title: event.title,
          lastYesPrice: event.lastYesPrice,
          lastNoPrice: event.lastNoPrice,
        })
        .from(position)
        .where(eq(position.userId, userId))
        .leftJoin(event, eq(position.eventId, event.id));

      logger.info(
        {
          context: "GET_USER_POSITION_SUCCESS",
          userId,
          hasPosition: !!positionOnEvent,
        },
        "Successfully fetched user position"
      );

      return res.json({
        success: true,
        data: positionOnEvent,
      });
    } catch (error) {
      logger.error(
        {
          alert: true,
          context: "GET_USER_POSITION_FAIL",
          userId,
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to fetch user position"
      );

      return res.status(500).json({ error: "Failed to fetch your position" });
    }
  }
);
