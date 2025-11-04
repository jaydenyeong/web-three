import { useState } from "react"

function Transactions() {
  const [action, setAction] = useState("deposit")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  const handleTransaction = async (e) => {
    e.preventDefault()
    if (!amount || amount <= 0) return alert("Enter a valid amount")

    const token = localStorage.getItem("token")
    let url = "http://localhost:5000/api/dashboard/deposit"

    if (action === "withdraw") url = "http://localhost:5000/api/dashboard/withdraw"
    else if (action === "transfer") url = "http://localhost:5000/api/dashboard/transfer"

    const body =
      action === "transfer"
        ? { amount, currency: "ETH", recipientUsername: recipient }
        : { amount, currency: "ETH" }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.msg || "Transaction failed")

      alert(data.msg || "Transaction successful")
      setAmount("")
      setRecipient("")
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Make a Transaction</h1>

      <form onSubmit={handleTransaction}>
        <label>Action:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ marginRight: "1rem" }}
        >
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
          <option value="transfer">Transfer</option>
        </select>

        <br /><br />

        {action === "transfer" && (
          <>
            <input
              type="text"
              placeholder="Recipient username"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ marginRight: "1rem" }}
            />
            <br /><br />
          </>
        )}

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: "1rem" }}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default Transactions
