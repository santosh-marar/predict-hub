import { createOrder } from "@controllers/order";
import {Router} from "express";
import { isAuthenticated } from "src/middleware/auth";

const router:Router = Router();

router.post("/", isAuthenticated, createOrder);

export default router;