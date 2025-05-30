import { Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import asyncMiddleware from "src/middleware/asyc-middleware";
import { db, user } from "@repo/db";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "src/lib/auth";

// export const getUser = async (req: Request, res: Response) => {
//   const { user } = req;

//   if (!user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   return res.json({ user });
// };

export const getUsers = asyncMiddleware(async (req: Request, res: Response) => {
  const allUsers = await db.select().from(user);

  return res.status(200).json({ users: allUsers, message: "Users retrieved" });
});
