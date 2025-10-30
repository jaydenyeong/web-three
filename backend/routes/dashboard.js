import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// ✅ Helper: fetch crypto prices
async function fetchPrices() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd";
  const response = await fetch(url);
  return await response.json();
}

// ✅ GET Balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ balance: user.balance });
  } catch (err) {
    console.error("Balance error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ GET Transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, sort = "desc" } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;          // e.g. deposit / withdrawal / transfer
    if (status) filter.status = status;    // e.g. completed / pending

    const sortOrder = sort === "asc" ? 1 : -1;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      transactions,
    });
  } catch (err) {
    console.error("Transaction fetch error:", err.message);
    res.status(500).send("Server Error");
  }
});


// ✅ DEPOSIT Route
router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, currency = "ETH" } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Invalid deposit amount" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update balance
    user.balance += Number(amount);
    user.currency = currency.toUpperCase();
    await user.save();

    // Record transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: "deposit",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    });
    await transaction.save();

    res.json({
      msg: "Deposit successful",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    console.error("Deposit error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ WITHDRAW Route
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, currency = "ETH" } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Invalid withdrawal amount" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    // Deduct balance
    user.balance -= Number(amount);
    await user.save();

    // Record transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: "withdrawal",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    });
    await transaction.save();

    res.json({
      msg: "Withdrawal successful",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    console.error("Withdraw error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ GET Crypto Prices
router.get("/prices", async (req, res) => {
  try {
    const data = await fetchPrices();
    res.json(data);
  } catch (err) {
    console.error("Price fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch prices" });
  }
});

// ✅ GET Live Dashboard Summary
router.get("/live", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance currency");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const prices = await fetchPrices();
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    const currency = user.currency?.toUpperCase() || "ETH";
    const rate =
      currency === "BTC"
        ? prices.bitcoin.usd
        : currency === "USDT"
        ? prices.tether.usd
        : prices.ethereum.usd;

    const totalUSD = user.balance * rate;

    res.json({
      balance: user.balance,
      balanceUSD: totalUSD,
      currency,
      prices,
      transactions,
    });
  } catch (err) {
    console.error("Live dashboard error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
