import express from "express"
import auth from "../middleware/auth.js"
import User from "../models/User.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

// ✅ POST /api/transactions/send
router.post("/send", auth, async (req, res) => {
  try {
    const { amount, currency, type = "transfer", recipient } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ msg: "User not found" })

    // Mock check
    if (user.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" })
    }

    // Update balance
    user.balance -= amount
    await user.save()

    // Record transaction
    const txn = new Transaction({
      user: req.user.id,
      type,
      amount,
      currency,
      status: "completed",
    })
    await txn.save()

    res.json({ msg: "Transaction successful", transaction: txn })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

export default router
