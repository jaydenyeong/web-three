const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const auth = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);


// Protected profile route (extra check)
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

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the backend 👋" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
