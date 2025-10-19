import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import Dashboard from "./pages/Dashboard"
import SendPayment from "./pages/SendPayment"

function App() {
  return (
    <div>
      {/* Nav Bar */}
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", background: "#eee" }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/send">Send Payment</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/send" element={<SendPayment />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
