const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Create a post
router.post("/", auth, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      user: req.user.id, // link to logged-in user
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "❌ Server error" });
  }
});

// ✅ Update post
router.put("/:id", async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Optional: check if user owns the post
    // if (post.user.toString() !== req.user.id) {
    //   return res.status(401).json({ message: "Not authorized" });
    // }

    // Update fields
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await post.remove();
    res.json({ message: "✅ Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find(); // assuming Post is your model
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// GET a single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "username email -_id");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
