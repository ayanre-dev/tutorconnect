import express from "express";
import { createClass, getClassesByTutor, getAllClasses, enrollInClass } from "../controllers/classController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createClass);
router.get("/tutor/:tutorId", protect, getClassesByTutor);
router.get("/", getAllClasses);
router.post("/enroll", protect, enrollInClass);

export default router;
