import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("⚠️ Could not connect to backend"));
  }, []);

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data));
    } catch (error) {
      setResponse("⚠️ Failed to register");
    }
  };

  return (
    <div>
      <h1>Crypto Savings Dashboard</h1>
      <p>Backend says: {message}</p>

      <h2>Register</h2>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>

      <p>Response: {response}</p>
    </div>
  );
}

export default App;
