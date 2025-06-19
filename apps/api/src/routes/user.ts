import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { getProfile, updateProfile, getPositions, getTransactions, getNotifications, markNotificationsRead, getLeaderboardPosition } from "../controllers/user";

const router:Router = Router();

router.get("/profile/:userId", isAuthenticated, getProfile);
router.put("/profile/:userId", isAuthenticated, updateProfile);
router.get("/positions/:userId",isAuthenticated, getPositions);
router.get("/transactions/:userId",isAuthenticated,  getTransactions);
router.get("/notifications/:userId", isAuthenticated,  getNotifications);
router.post("/notifications/:userId/read",isAuthenticated,  markNotificationsRead);
router.get("/leaderboard/:userId", isAuthenticated,  getLeaderboardPosition);

export default router;