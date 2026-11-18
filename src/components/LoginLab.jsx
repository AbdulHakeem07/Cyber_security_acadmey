
import { useState } from 'react'
import { api } from '../services/api'
import './LoginLab.css'

function LoginLab() {
  const [vulnerableUsername, setVulnerableUsername] = useState('')
  const [vulnerablePassword, setVulnerablePassword] = useState('')
  const [secureUsername, setSecureUsername] = useState('')
  const [securePassword, setSecurePassword] = useState('')

  const [vulnerableResult, setVulnerableResult] = useState(null)
  const [secureResult, setSecureResult] = useState(null)

  const [vulnerableLoading, setVulnerableLoading] = useState(false)
  const [secureLoading, setSecureLoading] = useState(false)

  async function handleVulnerableLogin(event) {
    event.preventDefault()
    setVulnerableLoading(true)
    setVulnerableResult(null)

    try {
      const result = await api.vulnerableLogin(
        vulnerableUsername,
        vulnerablePassword,
      )
      setVulnerableResult(result)
    } catch {
      setVulnerableResult({
        success: false,
        message: 'Cannot connect to the backend. Check that the Flask API is running.',
      })
    } finally {
      setVulnerableLoading(false)
    }
  }

  async function handleSecureLogin(event) {
    event.preventDefault()
    setSecureLoading(true)
    setSecureResult(null)

    try {
      const result = await api.secureLogin(
        secureUsername,
        securePassword,
      )
      setSecureResult(result)
    } catch {
      setSecureResult({
        success: false,
        message: 'Cannot connect to the backend. Check that the Flask API is running.',
      })
    } finally {
      setSecureLoading(false)
    }
  }

  function ResultMessage({ result }) {
    if (!result) return null

    const successful = result.success === true

    return (
      <div className={`login-result ${successful ? 'result-success' : 'result-error'}`}>
        <strong>{successful ? '✓ Request successful' : '✕ Request rejected'}</strong>
        <p>{result.message || 'The server returned a response.'}</p>
        {result.user && (
          <p className="result-user">
            Logged in as: {result.user.username || result.user}
          </p>
        )}
      </div>
    )
  }

  return (
    <section className="login-lab-section" id="login-lab">
      <div className="login-section-heading">
        <div>
          <span className="section-eyebrow">HANDS-ON PRACTICE</span>
          <h2>Authentication Security Lab</h2>
          <p>Compare two different approaches to database authentication.</p>
        </div>
        <span className="local-label">● LOCAL LAB</span>
      </div>

      <div className="login-comparison">
        {/* Vulnerable Login */}
        <div className="login-panel vulnerable-panel">
          <div className="panel-heading">
            <div className="panel-icon vulnerable-icon">⚠</div>
            <div>
              <span className="panel-label">DEMONSTRATION 01</span>
              <h3>Vulnerable Login</h3>
            </div>
          </div>

          <p className="panel-description">
            This demonstration uses unsafe SQL query construction.
            It is intentionally vulnerable for local educational testing.
          </p>

          <form onSubmit={handleVulnerableLogin}>
            <label htmlFor="vulnerable-username">Username</label>
            <input
              id="vulnerable-username"
              type="text"
              placeholder="Enter username"
              value={vulnerableUsername}
              onChange={(event) => setVulnerableUsername(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="vulnerable-password">Password</label>
            <input
              id="vulnerable-password"
              type="password"
              placeholder="Enter password"
              value={vulnerablePassword}
              onChange={(event) => setVulnerablePassword(event.target.value)}
              maxLength={100}
              required
            />

            <button
              className="login-button vulnerable-button"
              type="submit"
              disabled={vulnerableLoading}
            >
              {vulnerableLoading ? 'Testing...' : 'Test Vulnerable Login →'}
            </button>
          </form>

          <ResultMessage result={vulnerableResult} />

          <div className="panel-note warning-note">
            <strong>Security warning</strong>
            <p>Unsafe SQL construction can allow user input to change a query's meaning.</p>
          </div>
        </div>

        {/* Secure Login */}
        <div className="login-panel secure-panel">
          <div className="panel-heading">
            <div className="panel-icon secure-icon">✓</div>
            <div>
              <span className="panel-label">DEMONSTRATION 02</span>
              <h3>Secure Login</h3>
            </div>
          </div>

          <p className="panel-description">
            This demonstration uses parameterized SQL queries.
            User input is treated as data rather than SQL code.
          </p>

          <form onSubmit={handleSecureLogin}>
            <label htmlFor="secure-username">Username</label>
            <input
              id="secure-username"
              type="text"
              placeholder="Enter username"
              value={secureUsername}
              onChange={(event) => setSecureUsername(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="secure-password">Password</label>
            <input
              id="secure-password"
              type="password"
              placeholder="Enter password"
              value={securePassword}
              onChange={(event) => setSecurePassword(event.target.value)}
              maxLength={100}
              required
            />

            <button
              className="login-button secure-button"
              type="submit"
              disabled={secureLoading}
            >
              {secureLoading ? 'Testing...' : 'Test Secure Login →'}
            </button>
          </form>

          <ResultMessage result={secureResult} />

          <div className="panel-note safe-note">
            <strong>Security protection</strong>
            <p>Parameterized queries keep SQL instructions separate from user input.</p>
          </div>
        </div>
      </div>

      <div className="sample-credentials">
        <h4>Sample Lab Accounts</h4>
        <p>Use these demonstration accounts to test normal authentication.</p>
        <div className="credential-list">
          <span>Admin: <code>admin / admin123</code></span>
          <span>Student: <code>student / student123</code></span>
          <span>Teacher: <code>teacher / teacher123</code></span>
        </div>
        <small>These are demonstration credentials, not real accounts.</small>
      </div>
    </section>
  )
}

export default LoginLab
