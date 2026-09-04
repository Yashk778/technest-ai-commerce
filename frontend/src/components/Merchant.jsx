import { useEffect, useState } from 'react'

function Merchant() {

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const response = await fetch(
          `${API_BASE}/api/merchant/dashboard`
        )

        if (!response.ok) {
          throw new Error('Failed to load dashboard')
        }

        const data = await response.json()

        setDashboard(data)

      } catch (err) {

        console.error(err)
        setError('Unable to load merchant dashboard.')

      } finally {

        setLoading(false)

      }
    }

    fetchDashboard()

  }, [])

  if (loading) {
    return (
      <main className="merchant-page">
        <div className="merchant-message">
          Loading merchant dashboard...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="merchant-page">
        <div className="merchant-message error-message">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="merchant-page">

      <section className="merchant-container">

        <div className="merchant-header">

          <p className="section-label">
            TECHNEST MERCHANT
          </p>

          <h1>
            Merchant Dashboard
          </h1>

          <p>
            Monitor AI-driven commerce activity and revenue.
          </p>

        </div>


        {/* MAIN METRICS */}

        <section className="merchant-stats">

          <div className="merchant-stat-card">
            <span>Total Transactions</span>
            <strong>
              {dashboard.total_transactions}
            </strong>
          </div>

          <div className="merchant-stat-card">
            <span>Successful Payments</span>
            <strong>
              {dashboard.successful_transactions}
            </strong>
          </div>

          <div className="merchant-stat-card">
            <span>Failed Payments</span>
            <strong>
              {dashboard.failed_transactions}
            </strong>
          </div>

          <div className="merchant-stat-card">
            <span>Revenue</span>
            <strong>
              ₹{dashboard.revenue.toLocaleString('en-IN')}
            </strong>
          </div>

        </section>


        {/* GROWTH INSIGHTS */}

        <section className="merchant-insights">

          <div className="merchant-section-header">

            <p className="section-label">
              GROWTH INSIGHTS
            </p>

            <h2>
              AI Commerce Insights
            </h2>

          </div>


          <div className="merchant-insight-grid">

            <div className="merchant-insight-card">

              <span>
                Average Order Value
              </span>

              <strong>
                ₹
                {dashboard.average_order_value.toLocaleString(
                  'en-IN'
                )}
              </strong>

              <p>
                Average revenue generated per successful AI Buyer transaction.
              </p>

            </div>


            <div className="merchant-insight-card">

              <span>
                Top Product
              </span>

              <strong>
                {dashboard.top_product}
              </strong>

              <p>
                Most frequently purchased product through AI Buyer.
              </p>

            </div>


            <div className="merchant-insight-card">

              <span>
                Top Category
              </span>

              <strong className="capitalize-text">
                {dashboard.top_category}
              </strong>

              <p>
                Category receiving the most AI Buyer demand.
              </p>

            </div>


            <div className="merchant-insight-card">

              <span>
                AI Upsells
              </span>

              <strong>
                {dashboard.upsell_count}
              </strong>

              <p>
                Successful transactions where a complementary product was recommended.
              </p>

            </div>

          </div>

        </section>


        {/* AUDIT TRAIL */}

        <section className="merchant-transactions">

          <div className="merchant-section-header">

            <p className="section-label">
              AUDIT TRAIL
            </p>

            <h2>
              Recent AI Buyer Transactions
            </h2>

          </div>


          {dashboard.transactions.length === 0 ? (

            <div className="merchant-empty">
              No transactions yet.
            </div>

          ) : (

            <div className="merchant-table-wrapper">

              <table className="merchant-table">

                <thead>

                  <tr>
                    <th>Request</th>
                    <th>Amount</th>
                    <th>Approval</th>
                    <th>Payment</th>
                    <th>Razorpay Order</th>
                  </tr>

                </thead>

                <tbody>

                  {dashboard.transactions.map((transaction) => (

                    <tr key={transaction.id}>

                      <td>
                        {transaction.user_request}
                      </td>

                      <td>
                        ₹
                        {Number(
                          transaction.total_amnt
                        ).toLocaleString('en-IN')}
                      </td>

                      <td>
                        <span className="status-badge">
                          {transaction.approval}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge">
                          {transaction.payment_status}
                        </span>
                      </td>

                      <td>
                        {transaction.razorpay_order_id || '—'}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </section>

    </main>
  )
}

export default Merchant