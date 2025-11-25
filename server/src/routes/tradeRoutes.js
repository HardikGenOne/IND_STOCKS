import express from "express";
import { buyStock, sellStock, getDashboard } from "../controllers/tradeController.js";
import { requireAuth } from "../middleware/auth.js"; // This is your existing file

const router = express.Router();

// Apply auth middleware to all routes here
router.use(requireAuth);

router.post("/buy", buyStock);
router.post("/sell", sellStock);
router.get("/portfolio", getDashboard);

export default router;