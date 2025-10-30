import express from "express"
import auth from "../middleware/auth.js"
import User from "../models/User.js"
import Transaction from "../models/Transaction.js"

const router = express.Router()

// ✅ POST /api/transactions/send
router.post("/send", auth, async (req, res) => {
  try {
    const { amount, currency, type = "transfer" } = req.body

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ msg: "User not found" })

    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" })
    }

    // Deduct the amount
    user.balance -= amount
    await user.save()

    // Record the transaction
    const txn = new Transaction({
      user: req.user.id,
      type,
      amount,
      currency,
      status: "completed",
    })
    await txn.save()

    res.json({
      msg: "Transaction successful",
      transaction: txn,
      newBalance: user.balance,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

export default router
