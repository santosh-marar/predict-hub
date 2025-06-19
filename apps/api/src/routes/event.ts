// routes/events.ts
import { Router } from "express";
import {createEvent, getEvents, getEventById, updateEvent, deleteEvent, resolveEvent, updateEventStatus, getUserEvents, getFeaturedEvents, getEventStats, batchUpdateEventStatus, getProbabilityChart} from "../controllers/event";  
import { isAuthenticated, requireAdmin } from "src/middleware/auth";


const router:Router = Router();

router.post("/", isAuthenticated, requireAdmin, createEvent);
router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/user/:userId", getUserEvents);
router.get("/:id", getEventById);
router.put("/:id", isAuthenticated, requireAdmin, updateEvent);
router.delete("/:id", isAuthenticated, requireAdmin, deleteEvent);
router.patch("/:id/resolve", isAuthenticated, requireAdmin, resolveEvent);
router.patch("/:id/status", isAuthenticated, requireAdmin, updateEventStatus);
router.get("/:id/stats", getEventStats);
router.patch(
  "/batch/status",
  isAuthenticated,
  requireAdmin,
  batchUpdateEventStatus
);
router.get("/:eventId/probability-chart", getProbabilityChart);

export default router;
