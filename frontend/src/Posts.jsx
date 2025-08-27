import React, { useState, useEffect } from "react";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/posts", {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  // Create a post
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ title, content }),
    });

    const newPost = await res.json();
    setPosts([...posts, newPost]); // update list
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h2>My Posts</h2>

      {/* New Post Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <button type="submit">Add Post</button>
      </form>

      {/* Posts List */}
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
