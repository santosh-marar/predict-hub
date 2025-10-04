import { Router } from "express";
import { getUserPosition } from "../controllers/position";
import { isAuthenticated } from "src/middleware/auth";

const positionRouter: Router = Router();

positionRouter.get("/", isAuthenticated, getUserPosition);

export default positionRouter;
