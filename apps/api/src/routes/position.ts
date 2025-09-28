import { Router } from "express";
import { getUserPosition } from "../controllers/position";
import { isAuthenticated } from "src/middleware/auth";

export const positionRouter = Router();

positionRouter.get("/", isAuthenticated,  getUserPosition);

export default positionRouter;