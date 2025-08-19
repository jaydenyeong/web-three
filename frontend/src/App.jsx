import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("⚠️ Could not connect to backend"));
  }, []);

  return (
    <div>
      <h1>Crypto Savings Dashboard</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
