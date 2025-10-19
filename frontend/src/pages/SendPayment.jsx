import { useState } from "react"

function SendPayment() {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USDT")
  const [message, setMessage] = useState("")

  const handleSend = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/transactions/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ amount: Number(amount), currency }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || "Transfer failed")

      setMessage("✅ " + data.msg)
      setAmount("")
    } catch (err) {
      setMessage("❌ " + err.message)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Send Payment</h1>
      <form onSubmit={handleSend}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>
        <button type="submit">Send</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}

export default SendPayment
