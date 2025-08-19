const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   GET api/profile
// @desc    Get logged-in user's profile
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


router.put("/", auth, async (req, res) => {
  try {
    const updates = req.body; // e.g., { name: "New Name" }
    const user = await User.findByIdAndUpdate(req.user, updates, { new: true })
      .select("-password -__v");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;