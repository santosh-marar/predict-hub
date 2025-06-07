// routes/events.ts
import { Router } from "express";
import {createEvent, getEvents, getEventById, updateEvent, deleteEvent, resolveEvent, updateEventStatus, getUserEvents, getFeaturedEvents, getEventStats, batchUpdateEventStatus} from "../controllers/event";  
import { authenticate, requireAdmin } from "src/middleware/auth";


const router:Router = Router();

router.post("/", authenticate, requireAdmin, createEvent);
router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/user/:userId", getUserEvents);
router.get("/:id", getEventById);
router.put("/:id", authenticate, requireAdmin, updateEvent);
router.delete("/:id", authenticate, requireAdmin, deleteEvent);
router.patch("/:id/resolve", authenticate, requireAdmin, resolveEvent);
router.patch("/:id/status", authenticate, requireAdmin, updateEventStatus);
router.get("/:id/stats", getEventStats);
router.patch(
  "/batch/status",
  authenticate,
  requireAdmin,
  batchUpdateEventStatus
);

export default router;
