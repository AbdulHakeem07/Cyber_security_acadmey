
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import './DatabaseExplorer.css'

function DatabaseExplorer() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [usersResult, logsResult] = await Promise.all([
        api.getUsers(),
        api.getLogs(),
      ])

      if (usersResult.success === false || logsResult.success === false) {
        throw new Error('Could not retrieve database information.')
      }

      setUsers(usersResult.users || usersResult.data || [])
      setLogs(logsResult.logs || logsResult.data || [])
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function formatDate(value) {
    if (!value) return 'Unknown'

    const date = new Date(value.replace(' ', 'T') + 'Z')

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString()
  }

  return (
    <section className="database-section" id="database">
      <div className="database-heading">
        <div>
          <span className="section-eyebrow">DATABASE MANAGEMENT</span>
          <h2>Database Explorer</h2>
          <p>View sample accounts and recent authentication activity.</p>
        </div>

        <button
          className="refresh-button"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh Data'}
        </button>
      </div>

      {error && <div className="database-error">{error}</div>}

      <div className="database-stats">
        <div className="database-stat">
          <span>TOTAL ACCOUNTS</span>
          <strong>{loading ? '—' : users.length}</strong>
        </div>

        <div className="database-stat">
          <span>RECENT LOGIN EVENTS</span>
          <strong>{loading ? '—' : logs.length}</strong>
        </div>

        <div className="database-stat">
          <span>DATABASE</span>
          <strong className="sqlite-label">SQLite</strong>
        </div>
      </div>

      <div className="database-panel">
        <div className="database-panel-heading">
          <div>
            <h3>Sample User Accounts</h3>
            <p>Table: users</p>
          </div>
          <span className="table-label">USERS TABLE</span>
        </div>

        {loading ? (
          <p className="database-message">Loading user accounts...</p>
        ) : users.length === 0 ? (
          <p className="database-message">No user accounts found.</p>
        ) : (
          <div className="table-scroll">
            <table className="database-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USERNAME</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td className="username-cell">{user.username}</td>
                    <td>
                      <span className="role-tag">{user.role}</span>
                    </td>
                    <td>
                      <span className="account-status">● Available</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="privacy-note">
          🔒 Passwords are intentionally hidden from this explorer.
        </p>
      </div>

     <div className="database-panel activity-panel">
        <div className="database-panel-heading">
          <div>
            <h3>Recent Login Activity</h3>
            <p>Table: login_logs</p>
          </div>
          <span className="table-label">ACTIVITY LOGS</span>
        </div>

        {loading ? (
          <p className="database-message">Loading activity logs...</p>
        ) : logs.length === 0 ? (
          <p className="database-message">No login activity recorded yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="database-table">
              <thead>
                <tr>
                  <th>USERNAME</th>
                  <th>LOGIN TYPE</th>
                  <th>RESULT</th>
                  <th>DATE & TIME</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="username-cell">
                      {log.username || 'Unknown'}
                    </td>
                    <td>{log.login_type || 'Unknown'}</td>
                    <td>
                      <span className={log.success ? 'account-status' : 'failed-status'}>
                        {log.success ? '● Success' : '● Failed'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default DatabaseExplorer
