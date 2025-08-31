import { useEffect, useState } from "react"

function Dashboard() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch balance
        const balanceRes = await fetch("http://localhost:5000/api/dashboard/balance", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)

        // Fetch transactions
        const txnRes = await fetch("http://localhost:5000/api/dashboard/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const txnData = await txnRes.json()
        setTransactions(txnData)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard:", err)
      }
    }

    fetchData()
  }, [])

  if (loading) return <h2>Loading...</h2>

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Dashboard</h1>
      <h2>Balance: ${balance}</h2>

      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn._id}>
                <td>{new Date(txn.date).toLocaleString()}</td>
                <td>{txn.type}</td>
                <td>{txn.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dashboard
