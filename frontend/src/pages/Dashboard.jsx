import { useEffect, useState } from "react"

function Dashboard() {
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState("")

  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceRes = await fetch("http://localhost:5000/api/dashboard/balance", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!balanceRes.ok) throw new Error("Failed to fetch balance")
        const balanceData = await balanceRes.json()
        setData(balanceData)

        const txRes = await fetch("http://localhost:5000/api/dashboard/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!txRes.ok) throw new Error("Failed to fetch transactions")
        const txData = await txRes.json()
        setTransactions(txData)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
  }, [token])

  if (error) return <p style={{ color: "red" }}>❌ {error}</p>
  if (!data) return <p>Loading dashboard...</p>

  return (
    <div style={{ padding: "1rem" }}>
      <h1>💰 Dashboard</h1>
      <h2>
        {data.balance} {data.currency} ≈ ${data.usdValue.toFixed(2)} USD
      </h2>
      <p>Exchange Rate: 1 {data.currency} = ${data.usdRate}</p>

      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn._id}>
                <td>{txn.type}</td>
                <td>{txn.amount}</td>
                <td>{txn.currency}</td>
                <td>{txn.status}</td>
                <td>{new Date(txn.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dashboard
