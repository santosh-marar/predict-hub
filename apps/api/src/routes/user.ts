import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getProfile, updateProfile, getPositions, getTransactions, getNotifications, markNotificationsRead, getLeaderboardPosition } from "../controllers/user";

const router:Router = Router();

router.get("/profile/:userId", authenticate, getProfile);
router.put("/profile/:userId", authenticate, updateProfile);
router.get("/positions/:userId",authenticate, getPositions);
router.get("/transactions/:userId",authenticate,  getTransactions);
router.get("/notifications/:userId", authenticate,  getNotifications);
router.post("/notifications/:userId/read",authenticate,  markNotificationsRead);
router.get("/leaderboard/:userId", authenticate,  getLeaderboardPosition);

export default router;