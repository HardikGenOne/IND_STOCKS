import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ BUY STOCK
export const buyStock = async (req, res) => {
  try {
    const userId = req.user.id; // Comes from requireAuth middleware
    const { symbol, price, quantity } = req.body;

    if (!symbol || !price || !quantity) {
      return res.status(400).json({ message: "Missing trade details" });
    }

    const totalCost = parseFloat(price) * parseFloat(quantity);

    // 1. Check User Balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < totalCost) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // 2. EXECUTE TRANSACTION (All or Nothing)
    // We use 'upsert' for holdings: Create if new, Update if exists.
    const result = await prisma.$transaction(async (tx) => {
      // A. Deduct Money
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalCost } },
      });

      // B. Create Trade Record
      const newTrade = await tx.trade.create({
        data: {
          userId,
          symbol,
          type: "BUY",
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          totalCost,
        },
      });

      // C. Update Portfolio (Holding)
      const holding = await tx.holding.upsert({
        where: {
          userId_symbol: { userId, symbol }, // Matches the @@unique constraint in schema
        },
        update: {
          quantity: { increment: parseFloat(quantity) },
          // Optional: You could update avgPrice here with complex math, skipping for simplicity
        },
        create: {
          userId,
          symbol,
          quantity: parseFloat(quantity),
          avgPrice: parseFloat(price),
        },
      });

      return { updatedUser, newTrade, holding };
    });

    res.status(200).json({ 
      message: `Successfully bought ${quantity} ${symbol}`,
      newBalance: result.updatedUser.balance 
    });

  } catch (err) {
    console.error("Buy Error:", err);
    res.status(500).json({ message: "Trade failed" });
  }
};

// ✅ SELL STOCK
export const sellStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, price, quantity } = req.body;

    const totalRevenue = parseFloat(price) * parseFloat(quantity);

    // 1. Check if user owns the stock
    const holding = await prisma.holding.findUnique({
      where: { userId_symbol: { userId, symbol } },
    });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: "Not enough shares to sell" });
    }

    // 2. EXECUTE TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // A. Add Money
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: totalRevenue } },
      });

      // B. Create Trade Record
      await tx.trade.create({
        data: {
          userId,
          symbol,
          type: "SELL",
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          totalCost: totalRevenue,
        },
      });

      // C. Update Holding
      let updatedHolding;
      const newQuantity = holding.quantity - parseFloat(quantity);

      if (newQuantity <= 0) {
        // If selling everything, delete the holding record
        await tx.holding.delete({
          where: { userId_symbol: { userId, symbol } },
        });
        updatedHolding = null;
      } else {
        updatedHolding = await tx.holding.update({
          where: { userId_symbol: { userId, symbol } },
          data: { quantity: newQuantity },
        });
      }

      return { updatedUser, updatedHolding };
    });

    res.status(200).json({ 
      message: `Successfully sold ${quantity} ${symbol}`,
      newBalance: result.updatedUser.balance 
    });

  } catch (err) {
    console.error("Sell Error:", err);
    res.status(500).json({ message: "Trade failed" });
  }
};

// ✅ GET DASHBOARD DATA (Portfolio)
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        holdings: true, // Get current portfolio
        trades: {
          take: 20, // Only get last 20 trades
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove password from response
    const { password, ...userData } = user;
    res.json(userData);

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Could not fetch dashboard" });
  }
};