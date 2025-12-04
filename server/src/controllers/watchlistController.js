import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 1. CREATE: Add to Watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, note } = req.body;
    const item = await prisma.watchlist.create({
      data: { userId: req.user.id, symbol, note }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Could not add to watchlist" });
  }
};

// 2. READ: Get Watchlist
export const getWatchlist = async (req, res) => {
  try {
    const list = await prisma.watchlist.findMany({
      where: { userId: req.user.id }
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching watchlist" });
  }
};

// 3. UPDATE: Edit Note (e.g., "Target price $100")
export const updateWatchlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const updated = await prisma.watchlist.update({
      where: { id },
      data: { note }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 4. DELETE: Remove from Watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.watchlist.delete({ where: { id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};