import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";


const router = express.Router()

// GET Balance
router.get("/balance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance")
    if (!user) return res.status(404).json({ msg: "User not found" })
    res.json({ balance: user.balance })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// GET Transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user.id }).sort({ date: -1 })
    res.json(txns)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// TEMP: Add a few test transactions
router.post("/seed", auth, async (req, res) => {
  try {
    const sample = [
      { user: req.user.id, type: "deposit", amount: 500, currency: "USDT", status: "completed" },
      { user: req.user.id, type: "payment", amount: 120, currency: "BTC", status: "completed" },
      { user: req.user.id, type: "withdrawal", amount: 200, currency: "ETH", status: "pending" },
    ]
    await Transaction.insertMany(sample)
    res.json({ msg: "Sample transactions added" })
  } catch (err) {
    res.status(500).send("Server Error")
  }
})


router.get("/prices", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch prices" })
  }
})

router.get("/live", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("balance")
    const txns = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5)

    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd"
    )
    const prices = await priceRes.json()

    res.json({
      balance: user?.balance || 0,
      transactions: txns,
      prices,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

export default router
