import express from "express"
import auth from "../middleware/auth.js"
import User from "../models/User.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

// ✅ Helper: Fetch crypto prices
async function fetchPrices() {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
  const response = await fetch(url)
  return await response.json()
}

// ✅ GET Balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance")
    if (!user) return res.status(404).json({ msg: "User not found" })
    res.json({ balance: user.balance })
  } catch (err) {
    console.error("Balance error:", err.message)
    res.status(500).send("Server Error")
  }
})

// ✅ TRANSFER: Send funds to another user
router.post("/transfer", auth, async (req, res) => {
  try {
    const { recipientUsername, amount, currency = "ETH" } = req.body

    if (!recipientUsername || !amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid transfer data" })
    }

    const sender = await User.findById(req.user.id)
    const recipient = await User.findOne({ username: recipientUsername })

    if (!sender) return res.status(404).json({ msg: "Sender not found" })
    if (!recipient) return res.status(404).json({ msg: "Recipient not found" })
    if (sender.username === recipientUsername) {
      return res.status(400).json({ msg: "Cannot transfer to yourself" })
    }
    if (sender.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" })
    }

    // Update balances
    sender.balance -= Number(amount)
    recipient.balance += Number(amount)
    await sender.save()
    await recipient.save()

    // Record both transactions
    const senderTxn = new Transaction({
      user: sender._id,
      type: "transfer_out",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    })

    const recipientTxn = new Transaction({
      user: recipient._id,
      type: "transfer_in",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    })

    await senderTxn.save()
    await recipientTxn.save()

    res.json({
      msg: `Transferred ${amount} ${currency.toUpperCase()} to ${recipientUsername}`,
      balance: sender.balance,
    })
  } catch (err) {
    console.error("Transfer error:", err)
    res.status(500).json({ msg: "Server error" })
  }
})

// ✅ DEPOSIT Route
router.post("/deposit", auth, async (req, res) => {
  try {
    const { amount, currency = "ETH" } = req.body

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Invalid deposit amount" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ msg: "User not found" })

    // Update balance
    user.balance += Number(amount)
    user.currency = currency.toUpperCase()
    await user.save()

    // Record transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: "deposit",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    })
    await transaction.save()

    res.json({
      msg: "Deposit successful",
      balance: user.balance,
      transaction,
    })
  } catch (err) {
    console.error("Deposit error:", err.message)
    res.status(500).send("Server Error")
  }
})

// ✅ WITHDRAW Route
router.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount, currency = "ETH" } = req.body

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Invalid withdrawal amount" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ msg: "User not found" })

    if (user.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" })
    }

    user.balance -= Number(amount)
    await user.save()

    const transaction = new Transaction({
      user: req.user.id,
      type: "withdrawal",
      amount,
      currency: currency.toUpperCase(),
      status: "completed",
    })
    await transaction.save()

    res.json({
      msg: "Withdrawal successful",
      balance: user.balance,
      transaction,
    })
  } catch (err) {
    console.error("Withdraw error:", err.message)
    res.status(500).send("Server Error")
  }
})

// ✅ GET Crypto Prices
router.get("/prices", async (req, res) => {
  try {
    const data = await fetchPrices()
    res.json(data)
  } catch (err) {
    console.error("Price fetch error:", err.message)
    res.status(500).json({ message: "Failed to fetch prices" })
  }
})

// ✅ GET Live Dashboard Summary
// ✅ GET Live Dashboard Summary (Fixed)
router.get("/live", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance currency");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const prices = await fetchPrices();

    // Safe lookups (avoid undefined)
    const ethPrice = prices?.ethereum?.usd ?? 0;
    const btcPrice = prices?.bitcoin?.usd ?? 0;
    const usdtPrice = prices?.tether?.usd ?? 1;

    const currency = (user.currency || "ETH").toUpperCase();

    // choose rate based on user's currency
    const rate =
      currency === "BTC"
        ? btcPrice
        : currency === "USDT"
        ? usdtPrice
        : ethPrice;

    // Calculate USD equivalent
    const totalUSD = Number(user.balance) * rate;

    // Fetch last few transactions
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      balance: user.balance,
      balanceUSD: totalUSD,
      currency,
      prices: {
        BTC: { usd: btcPrice },
        ETH: { usd: ethPrice },
        USDT: { usd: usdtPrice },
      },
      transactions,
    });
  } catch (err) {
    console.error("Live dashboard error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


export default router
