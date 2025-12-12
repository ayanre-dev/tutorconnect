import express from "express";
import { createPaymentIntent } from "../controllers/paymentController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);

export default router;
