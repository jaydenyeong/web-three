// routes/post.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// Create a post
router.post("/", auth, async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      user: req.user.id,
    });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all posts by logged-in user
router.get("/", auth, async (req, res) => {
  const posts = await Post.find({ user: req.user.id });
  res.json(posts);
});

module.exports = router;
