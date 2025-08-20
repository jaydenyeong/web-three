const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const auth = require("./middleware/auth");

dotenv.config();


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount auth routes under /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/profile", require("./routes/profile"));
app.use("/api/register", require("./routes/register"));
app.use("/api/login", require("./routes/login"));


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

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the backend 👋" });
});


let users = [];
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Check if user exists
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Save user (in memory for now)
  users.push({ email, password });
  res.json({ message: "✅ Registration successful" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ message: "✅ Login successful" });
});






app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
