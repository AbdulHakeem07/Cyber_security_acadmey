import { useState } from 'react'
import { api } from '../services/api'
import './InjectionSimulator.css'

const examples = [
  {
    label: 'Normal input',
    username: 'student',
    password: 'student123',
  },
  {
    label: 'Classic SQL injection',
    username: "' OR '1'='1' -- ",
    password: 'anything',
  },
  {
    label: 'Another test',
    username: "admin' -- ",
    password: 'anything',
  },
]

export default function InjectionSimulator() {
  const [username, setUsername] = useState("' OR '1'='1' -- ")
  const [password, setPassword] = useState('anything')
  const [mode, setMode] = useState('vulnerable')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  function loadExample(example) {
    setUsername(example.username)
    setPassword(example.password)
    setResult(null)
  }

  async function runSimulation() {
    if (!username.trim() || !password.trim()) {
      setResult({
        success: false,
        message: 'Please enter both a username and password before running the simulation.',
        user: null,
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response =
        mode === 'vulnerable'
          ? await api.vulnerableLogin(username, password)
          : await api.secureLogin(username, password)

      setResult({
        success: Boolean(response.success),
        message: response.message || 'No response message received.',
        user: response.user || null,
      })
    } catch {
      setResult({
        success: false,
        message: 'Could not connect to the backend. Check the Flask server.',
        user: null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="simulator-section" id="simulator">
      <div className="section-heading">
        <div>
          <span className="eyebrow">HANDS-ON SECURITY</span>
          <h2>SQL Injection Simulator</h2>
          <p>
            Compare an intentionally vulnerable login with a secure
            parameterized login.
          </p>
        </div>

        <span className="simulator-tag">LOCAL LAB</span>
      </div>

      <div className="simulator-card">
        <div className="simulator-controls">
          <label className="simulator-label" htmlFor="sim-mode">
            Login mode
          </label>

          <select
            id="sim-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value)
              setResult(null)
            }}
            disabled={loading}
          >
            <option value="vulnerable">Vulnerable SQL query</option>
            <option value="secure">Secure parameterized query</option>
          </select>

          <div className="simulator-examples">
            <span className="simulator-label">Try an example</span>

            <div className="example-buttons">
              {examples.map((example) => (
                <button
                  type="button"
                  key={example.label}
                  onClick={() => loadExample(example)}
                  disabled={loading}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="simulator-form">
          <label htmlFor="sim-username">Username / SQL input</label>

          <input
            id="sim-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={80}
            placeholder="Enter a username or test payload"
            disabled={loading}
          />

          <label htmlFor="sim-password">Password</label>

          <input
            id="sim-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={80}
            placeholder="Enter a demo password"
            disabled={loading}
          />

          <button
            type="button"
            className="run-simulation-button"
            onClick={runSimulation}
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? 'Running...' : 'Run simulation'}
          </button>
        </div>

        <div className="query-explanation">
          <h3>What happens?</h3>

          {mode === 'vulnerable' ? (
            <p>
              The vulnerable demonstration inserts user input directly into a
              SQL statement. Special SQL characters can change the meaning of
              the query.
            </p>
          ) : (
            <p>
              The secure demonstration uses placeholders and passes input as
              data. SQL characters in the input cannot change the query
              structure.
            </p>
          )}
        </div>

        {result && (
          <div
            className={`simulation-result ${
              result.success ? 'result-success' : 'result-failure'
            }`}
            role="status"
            aria-live="polite"
          >
            <h3>{result.success ? 'Login accepted' : 'Login rejected'}</h3>

            <p>{result.message}</p>

            {result.user && (
              <p>
                Demo account: <strong>{result.user.username}</strong>
                {' — '}
                {result.user.role}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="simulator-disclaimer">
        Educational demonstration only. Runs against the local lab database;
        never test these payloads on websites without permission.
      </p>
    </section>
  )
}
