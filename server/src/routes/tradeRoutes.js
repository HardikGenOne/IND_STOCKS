import express from "express";
import {
    buyStock,
    sellStock,
    getDashboard,
    getHistory,
    updateTradeNote,
    updateUserProfile,
    deleteTrade,
    resetTradeHistory
} from "../controllers/tradeController.js";
import { requireAuth } from "../middleware/auth.js"; // This is your existing file

const router = express.Router();

// Apply auth middleware to all routes here
router.use(requireAuth);

// CREATE Operations
router.post("/buy", buyStock);
router.post("/sell", sellStock);

// READ Operations
router.get("/portfolio", getDashboard);
router.get("/history", getHistory);

// UPDATE Operations (for college submission)
router.put("/trade/:id/note", updateTradeNote);      // UPDATE 1: Add note to trade
router.put("/user/profile", updateUserProfile);      // UPDATE 2: Update user profile

// DELETE Operations (for college submission)
router.delete("/trade/:id", deleteTrade);            // DELETE 1: Delete single trade
router.delete("/history/reset", resetTradeHistory);  // DELETE 2: Clear all trades

export default router;