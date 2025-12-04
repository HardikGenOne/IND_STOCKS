import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { addToWatchlist, getWatchlist, updateWatchlistItem, removeFromWatchlist } from "../controllers/watchlistController.js";

const router = express.Router();
router.use(requireAuth);

router.post("/", addToWatchlist);       // Create
router.get("/", getWatchlist);          // Read
router.put("/:id", updateWatchlistItem); // Update
router.delete("/:id", removeFromWatchlist); // Delete

export default router;