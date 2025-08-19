const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");


const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Mount auth routes under /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/profile", require("./routes/profile"));


// Protected profile route
app.get("/api/profile", auth, async (req, res) => {
  const User = require("./models/User");
  try {
    const user = await User.findById(req.user).select("-password -__v");
    if (!user) return res.status(404).json({ message: "❌ User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "❌ Server error" });
  }
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/webthree")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
