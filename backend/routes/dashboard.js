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

export default router
