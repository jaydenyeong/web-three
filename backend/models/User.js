const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1.25 },
  currency: { type: String, default: ["ETH"] },
});

module.exports = mongoose.model("User", UserSchema);
