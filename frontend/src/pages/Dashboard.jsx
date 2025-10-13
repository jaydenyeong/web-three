import { useEffect, useState } from "react"

function Dashboard() {
  const [data, setData] = useState({ balance: 0, transactions: [], prices: {} })
  const [loading, setLoading] = useState(true)

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/dashboard/live", {
        headers: { Authorization: "Bearer " + token },
      })
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Error fetching live dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <p>Loading live data...</p>

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Crypto Dashboard</h1>
      <p><strong>Total Balance:</strong> ${data.balance.toFixed(2)}</p>

      <h2>Prices (USD)</h2>
      <ul>
        {Object.entries(data.prices).map(([symbol, obj]) => (
          <li key={symbol}>
            {symbol.toUpperCase()}: ${obj.usd.toLocaleString()}
          </li>
        ))}
      </ul>

      <h2>Recent Transactions</h2>
      {data.transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((txn) => (
              <tr key={txn._id}>
                <td>{new Date(txn.createdAt).toLocaleString()}</td>
                <td>{txn.type}</td>
                <td>{txn.amount}</td>
                <td>{txn.currency}</td>
                <td>{txn.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dashboard
