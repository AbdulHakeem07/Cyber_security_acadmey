
const API_BASE = '/api'

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    let data = {}

    try {
      data = await response.json()
    } catch {
      data = {
        message: 'The server returned an invalid or empty response.',
      }
    }

    const result =
      data && typeof data === 'object' && !Array.isArray(data)
        ? data
        : { message: 'Unexpected server response.' }

    return {
      ...result,
      success: response.ok && result.success !== false,
      status: response.status,
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      message:
        'Cannot connect to the backend. Make sure the Flask server is running.',
      error: error.message,
    }
  }
}

export const api = {
  getStatus: () => request('/status'),

  getUsers: () => request('/users'),

  getLogs: () => request('/logs'),

  vulnerableLogin: (username, password) =>
    request('/login/vulnerable', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  secureLogin: (username, password) =>
    request('/login/secure', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}
