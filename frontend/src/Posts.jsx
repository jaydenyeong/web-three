import { useState, useEffect } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // Fetch posts on load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (err) {
        setMessage("❌ Could not fetch posts");
      }
    };
    fetchPosts();
  }, []);

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data._id) {
        setPosts([data, ...posts]); // add new post to top
        setTitle("");
        setContent("");
        setMessage("✅ Post created!");
      } else {
        setMessage("⚠️ Failed to create post");
      }
    } catch (err) {
      setMessage("❌ Backend not reachable");
    }
  };

  return (
    <div>
      <h2>Your Posts</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <br />
        <button type="submit">Add Post</button>
      </form>

      <p>{message}</p>

      <ul>
        {posts.map((p) => (
          <li key={p._id}>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Posts;
