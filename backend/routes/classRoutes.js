import express from "express";
import { createClass, getClassesByTutor, getAllClasses } from "../controllers/classController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createClass);
router.get("/tutor/:tutorId", protect, getClassesByTutor);
router.get("/", getAllClasses);

export default router;
