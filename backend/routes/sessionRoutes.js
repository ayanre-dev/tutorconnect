import express from "express";
import { createSession, getSessionsForUser, endSession } from "../controllers/sessionController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createSession);
router.get("/user/:userId", protect, getSessionsForUser);
router.put("/:sessionId/end", protect, endSession);

export default router;
