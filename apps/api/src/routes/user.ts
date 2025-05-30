import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { getUsers } from "../controllers/user";

const router: Router = Router();

// router.get("/users",  getUsers);
router.get("/users", authenticate, getUsers);

export default router;