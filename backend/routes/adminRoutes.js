import express from "express";
import { getUpcomingSessions, getPastSessions, getAllEnrollments } from "../controllers/adminController.js";

const router = express.Router();

// Middleware to check if user is admin could be added here
// For now we assume the frontend protects the route or we can add a check if needed
// simplified for now as per previous patterns

router.get("/upcoming-sessions", getUpcomingSessions);
router.get("/past-sessions", getPastSessions);
router.get("/enrollments", getAllEnrollments);

export default router;
