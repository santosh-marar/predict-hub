import { getWalletBalance } from "@controllers/wallet";
import { Router } from "express";
import { isAuthenticated } from "src/middleware/auth";

const router: Router = Router();

router.get("/:userId", isAuthenticated, getWalletBalance);

export default router;
