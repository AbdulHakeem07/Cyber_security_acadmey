
import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import './ActivityLogs.css'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.getLogs()

      if (!response.success) {
        throw new Error(response.message || 'Could not load activity logs.')
      }

      setLogs(Array.isArray(response.logs) ? response.logs : [])
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  function formatDate(value) {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString()
  }

  return (
    <section className="activity-section" id="logs">
      <div className="activity-heading">
        <div>
          <span className="activity-eyebrow">SECURITY MONITORING</span>
          <h2>Activity Logs</h2>
          <p>Review login attempts recorded by your local training lab.</p>
        </div>

        <button
          type="button"
          className="refresh-logs-button"
          onClick={loadLogs}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh logs'}
        </button>
      </div>

      <div className="activity-summary">
        <div className="activity-summary-card">
          <span>TOTAL RECORDED EVENTS</span>
          <strong>{logs.length}</strong>
        </div>

        <div className="activity-summary-card">
          <span>SUCCESSFUL LOGINS</span>
          <strong className="activity-success-number">
            {logs.filter((log) => Boolean(log.success)).length}
          </strong>
        </div>

        <div className="activity-summary-card">
          <span>FAILED LOGINS</span>
          <strong className="activity-failed-number">
            {logs.filter((log) => !Boolean(log.success)).length}
          </strong>
        </div>
      </div>

      <div className="activity-table-panel">
        <div className="activity-table-heading">
          <h3>Recent Login Attempts</h3>
          <span>Latest recorded events</span>
        </div>

        {loading ? (
          <p className="activity-message">Loading activity logs...</p>
        ) : error ? (
          <div className="activity-error">
            <p>{error}</p>
            <button type="button" onClick={loadLogs}>
              Try again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <p className="activity-message">
            No activity recorded yet. Login attempts will appear here.
          </p>
        ) : (
          <div className="activity-table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Login Type</th>
                  <th>Result</th>
                  <th>Message</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.username || 'Unknown'}</td>
                    <td>{log.login_type || '—'}</td>
                    <td>
                      <span
                        className={`activity-status ${
                          Boolean(log.success) ? 'activity-status-success' : 'activity-status-failed'
                        }`}
                      >
                        {Boolean(log.success) ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td>{log.message || '—'}</td>
                    <td>{formatDate(log.created_at)}</td>
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
