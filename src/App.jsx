import { useEffect, useRef, useState } from 'react'
import './App.css'

import ResourceLinks from './components/ResourceLinks'
import TopicLesson from './components/TopicLesson'
import cybersecurityTopics from './data/cybersecurityTopics'

const THEME_KEY = 'cybersecurity-academy-theme'

const topics = cybersecurityTopics.map((topic) => ({
  ...topic,
  image: `/images/topics/${topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`,
}))
const topicCategories = ['All topics', ...new Set(topics.map((topic) => topic.category))]
const learningTools = [
  { label: 'SQL injection lessons', description: 'Learn the concepts and defenses', targetId: 'about' },
  { label: 'Authentication lab', description: 'Compare vulnerable and secure logins', targetId: 'login-lab' },
  { label: 'SQL injection simulator', description: 'Practice in the local demo', targetId: 'simulator' },
  { label: 'Database explorer', description: 'Inspect the sample lab data', targetId: 'database' },
  { label: 'Activity logs', description: 'Review recorded lab events', targetId: 'logs' },
]

function getProfileInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function ProfileAvatar({ profile, className = '' }) {
  return (
    <span className={`profile-avatar ${className}`} aria-hidden="true">
      {profile.pictureUrl
        ? <img src={profile.pictureUrl} alt="" />
        : getProfileInitials(profile.name)}
    </span>
  )
}

function readThemePreference() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark'
  } catch {
    return false
  }
}

function App() {
  const [profile, setProfile] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(readThemePreference)
  const [authMode, setAuthMode] = useState(null)
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false)
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')
  const [serviceError, setServiceError] = useState('')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [activeTopic, setActiveTopic] = useState(null)
  const [topicQuery, setTopicQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All topics')
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false)
  const pendingToolTarget = useRef(null)

  useEffect(() => {
    let isCurrent = true

    async function restoreAccountSession() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.status === 401) return

        const result = await response.json()
        if (!response.ok || !result.user) {
          throw new Error(result.message || 'Could not restore the account session.')
        }
        if (isCurrent) setProfile(result.user)
      } catch {
        if (isCurrent) {
          setServiceError('Could not connect to the account server. Start the Flask backend and try again.')
        }
      }
    }

    restoreAccountSession()
    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    if (!authMode && !activeTopic && !isProfileEditorOpen && !isToolsMenuOpen) return undefined

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setAuthMode(null)
        setActiveTopic(null)
        setIsProfileEditorOpen(false)
        setIsToolsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [authMode, activeTopic, isProfileEditorOpen, isToolsMenuOpen])

  useEffect(() => {
    if (activeTopic?.name !== 'SQL injection' || !pendingToolTarget.current) return undefined

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingToolTarget.current)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      pendingToolTarget.current = null
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTopic])

  useEffect(() => {
    if (!isProfileEditorOpen || !profilePicturePreview.startsWith('blob:')) return undefined
    return () => URL.revokeObjectURL(profilePicturePreview)
  }, [isProfileEditorOpen, profilePicturePreview])

  function openAuth(mode) {
    setAuthError('')
    setServiceError('')
    setIsToolsMenuOpen(false)
    setIsPasswordVisible(false)
    setIsPasswordConfirmationVisible(false)
    setAuthMode(mode)
  }

  function switchAuthMode() {
    setAuthError('')
    setServiceError('')
    setIsPasswordVisible(false)
    setIsPasswordConfirmationVisible(false)
    setAuthMode((currentMode) => currentMode === 'signup' ? 'signin' : 'signup')
  }

  function openTool(targetId) {
    setIsToolsMenuOpen(false)
    if (!profile) {
      openAuth('signup')
      return
    }

    const sqlInjectionTopic = topics.find((topic) => topic.name === 'SQL injection')
    if (!sqlInjectionTopic) {
      setServiceError('The SQL Injection tools are not available right now.')
      return
    }

    if (activeTopic?.name === sqlInjectionTopic.name) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    pendingToolTarget.current = targetId
    setActiveTopic(sqlInjectionTopic)
  }

  function openProfileEditor() {
    if (!profile) return
    setProfileError('')
    setProfilePictureFile(null)
    setRemoveProfilePicture(false)
    setProfilePicturePreview(profile.pictureUrl || '')
    setIsProfileEditorOpen(true)
  }

  function handleProfilePictureSelect(event) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setProfilePictureFile(null)
      setRemoveProfilePicture(false)
      setProfilePicturePreview(profile.pictureUrl || '')
      setProfileError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfilePictureFile(null)
      setRemoveProfilePicture(false)
      setProfilePicturePreview(profile.pictureUrl || '')
      setProfileError('Choose an image smaller than 2 MB.')
      return
    }
    setProfileError('')
    setProfilePictureFile(file)
    setRemoveProfilePicture(false)
    setProfilePicturePreview(URL.createObjectURL(file))
  }

  async function saveProfile(event) {
    event.preventDefault()
    setProfileError('')
    const formData = new FormData()
    formData.set('name', String(new FormData(event.currentTarget).get('name') || '').trim())
    if (profilePictureFile) formData.set('picture', profilePictureFile)
    if (removeProfilePicture) formData.set('remove_picture', 'true')

    setIsProfileSubmitting(true)
    try {
      const response = await fetch('/api/auth/profile', { method: 'PUT', body: formData })
      const result = await response.json()
      if (!response.ok) {
        setProfileError(result.message || 'Could not update your account.')
        return
      }
      if (!result.user || typeof result.user.name !== 'string' || typeof result.user.email !== 'string') {
        throw new Error('The account server returned an invalid profile.')
      }
      setProfile(result.user)
      setIsProfileEditorOpen(false)
    } catch {
      setProfileError('Could not connect to the account server. Your profile was not updated.')
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  function toggleTheme() {
    const nextIsDarkMode = !isDarkMode
    try {
      localStorage.setItem(THEME_KEY, nextIsDarkMode ? 'dark' : 'light')
    } catch {
      setStorageError('Your theme preference could not be saved in this browser.')
    }
    setIsDarkMode(nextIsDarkMode)
  }

  async function handleAuth(event) {
    event.preventDefault()
    setAuthError('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')
    const requestBody = { email, password }
    if (authMode === 'signup') {
      const name = String(form.get('name') || '').trim()
      const passwordConfirmation = String(form.get('password-confirmation') || '')
      if (!name || !email || !password) {
        setAuthError('Enter your name, email address, and password to continue.')
        return
      }
      if (password !== passwordConfirmation) {
        setAuthError('The passwords do not match. Please enter them again.')
        return
      }
      requestBody.name = name
    }

    setIsAuthSubmitting(true)
    try {
      const response = await fetch(
        authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
      )
      const result = await response.json()
      if (!response.ok) {
        setAuthError(result.message || 'Could not complete the account request.')
        return
      }
      if (!result.user || typeof result.user.email !== 'string') {
        throw new Error('The account server returned an invalid response.')
      }
      setProfile(result.user)
      setServiceError('')
      setStorageError('')
      setAuthMode(null)
    } catch {
      setAuthError('Could not connect to the account server. Check that the Flask backend is running.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  async function signOut() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('The server could not end the session.')
      setProfile(null)
      setActiveTopic(null)
      setIsProfileEditorOpen(false)
      setServiceError('')
    } catch {
      setServiceError('Could not sign out because the account server is unavailable. Please try again.')
    }
  }

  function openTopic(topic) {
    if (!profile) {
      openAuth('signup')
      return
    }
    setActiveTopic(topic)
  }

  const normalizedQuery = topicQuery.trim().toLowerCase()
  const visibleTopics = topics.filter((topic) => {
    const matchesCategory = activeCategory === 'All topics' || topic.category === activeCategory
    const matchesQuery = !normalizedQuery
      || `${topic.name} ${topic.summary} ${topic.category}`.toLowerCase().includes(normalizedQuery)

    return matchesCategory && matchesQuery
  })

  if (authMode) {
    return (
      <div className={`academy account-page${isDarkMode ? ' theme-dark' : ''}`}>
        <header className="account-header">
          <a className="academy-brand" href="#home" onClick={() => setAuthMode(null)}>
            <img className="brand-logo" src="/images/cyber-logo.png" alt="" />
            <span>Cybersecurity<span className="brand-light">Academy</span></span>
          </a>
          <div className="account-header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              aria-pressed={isDarkMode}
            >
              <span className="theme-toggle-icon" aria-hidden="true">{isDarkMode ? '☀' : '☾'}</span>
              <span className="theme-toggle-label">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <button className="account-back" type="button" onClick={() => setAuthMode(null)}>
              <span aria-hidden="true">←</span> Back to home
            </button>
          </div>
        </header>

        <main className={`account-layout${authMode === 'signup' ? ' account-signup-mode' : ' account-signin-mode'}`}>
          <section className="account-form-panel">
            <span className="account-step">YOUR NEXT STEP <span>01 / 02</span></span>
            <span className="section-eyebrow">{authMode === 'signup' ? 'CREATE YOUR LEARNING PROFILE' : 'YOUR LEARNING PROFILE'}</span>
            <h1>{authMode === 'signup' ? <>Build your cyber<br />confidence.</> : <>Welcome<br />back.</>}</h1>
            <p className="account-lead">
              {authMode === 'signup'
                ? 'Create a profile to unlock every topic, lesson, and defensive practice lab.'
                : 'Sign in with the email you used to create your learning profile.'}
            </p>

            <form className="auth-form account-auth-form" onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <label>
                  Your name
                  <input autoComplete="name" name="name" type="text" placeholder="Alex Morgan" maxLength={60} required />
                </label>
              )}
              <label>
                Email address
                <input autoComplete="email" name="email" type="email" placeholder="you@example.com" maxLength={254} required />
              </label>
              <label>
                Password
                <span className="password-input-wrap">
                  <input
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    aria-label="Password"
                    minLength={8}
                    maxLength={128}
                    placeholder={authMode === 'signup' ? 'At least 8 characters' : 'Your password'}
                    required
                  />
                  <button
                    className="password-visibility-toggle"
                    type="button"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                  >
                    {isPasswordVisible ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4.3 4.3 3 21 19.7 19.7 21l-3.1-3.1a10.7 10.7 0 0 1-4.6 1.1C6.5 19 2.4 15.7 1 12c.7-1.9 2.1-3.6 4-4.8L3 4.3Zm8.8 5.2a2.6 2.6 0 0 0 2.7 2.7l-2.7-2.7ZM12 5c5.3 0 9.5 3.3 11 7-.6 1.7-1.8 3.1-3.3 4.2l-2.2-2.2a5.6 5.6 0 0 0-7.5-7.5L8.2 4.7A12 12 0 0 1 12 5Zm-5.8 4a8.6 8.6 0 0 0-2.9 3 9.2 9.2 0 0 0 8 5c.8 0 1.6-.1 2.3-.3l-1.8-1.8a5.6 5.6 0 0 1-6-5.9L6.2 9Z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.3 0 9.5 3.3 11 7-1.5 3.7-5.7 7-11 7S2.5 15.7 1 12c1.5-3.7 5.7-7 11-7Zm0 2c-4.1 0-7.4 2.3-8.8 5 1.4 2.7 4.7 5 8.8 5s7.4-2.3 8.8-5c-1.4-2.7-4.7-5-8.8-5Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
                    )}
                  </button>
                </span>
              </label>
              {authMode === 'signup' && (
                <label>
                  Confirm password
                  <span className="password-input-wrap">
                    <input
                      autoComplete="new-password"
                      name="password-confirmation"
                      type={isPasswordConfirmationVisible ? 'text' : 'password'}
                      aria-label="Confirm password"
                      minLength={8}
                      maxLength={128}
                      placeholder="Enter your password again"
                      required
                    />
                    <button
                      className="password-visibility-toggle"
                      type="button"
                      onClick={() => setIsPasswordConfirmationVisible((visible) => !visible)}
                      aria-label={isPasswordConfirmationVisible ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={isPasswordConfirmationVisible}
                    >
                      {isPasswordConfirmationVisible ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4.3 4.3 3 21 19.7 19.7 21l-3.1-3.1a10.7 10.7 0 0 1-4.6 1.1C6.5 19 2.4 15.7 1 12c.7-1.9 2.1-3.6 4-4.8L3 4.3Zm8.8 5.2a2.6 2.6 0 0 0 2.7 2.7l-2.7-2.7ZM12 5c5.3 0 9.5 3.3 11 7-.6 1.7-1.8 3.1-3.3 4.2l-2.2-2.2a5.6 5.6 0 0 0-7.5-7.5L8.2 4.7A12 12 0 0 1 12 5Zm-5.8 4a8.6 8.6 0 0 0-2.9 3 9.2 9.2 0 0 0 8 5c.8 0 1.6-.1 2.3-.3l-1.8-1.8a5.6 5.6 0 0 1-6-5.9L6.2 9Z" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c5.3 0 9.5 3.3 11 7-1.5 3.7-5.7 7-11 7S2.5 15.7 1 12c1.5-3.7 5.7-7 11-7Zm0 2c-4.1 0-7.4 2.3-8.8 5 1.4 2.7 4.7 5 8.8 5s7.4-2.3 8.8-5c-1.4-2.7-4.7-5-8.8-5Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" /></svg>
                      )}
                    </button>
                  </span>
                </label>
              )}
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="button button-green auth-submit" type="submit" disabled={isAuthSubmitting}>
                {isAuthSubmitting
                  ? 'Please wait…'
                  : authMode === 'signup' ? 'Create profile & explore' : 'Sign in'}
                {!isAuthSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="account-demo-note">
              Your password is stored as a one-way hash in the app database. Use a unique password; this locally hosted learning demo is not designed for public production accounts.
            </p>
          </section>

          <aside className="account-showcase account-welcome-panel">
            <div className="account-welcome-content">
              <span className="section-eyebrow">
                {authMode === 'signup' ? 'ALREADY HAVE AN ACCOUNT?' : 'NEW TO THE ACADEMY?'}
              </span>
              <div className="welcome-emblem" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                  <path d="M24 4 40 10v12c0 10.2-6.7 17.6-16 22C14.7 39.6 8 32.2 8 22V10l16-6Z" />
                  <path d="m17 24 5 5 10-11" />
                </svg>
              </div>
              <h2>{authMode === 'signup' ? 'Welcome back!' : 'Hello, welcome!'}</h2>
              <p>
                {authMode === 'signup'
                  ? 'Sign in to pick up where you left off and continue learning.'
                  : 'Create a free profile to explore lessons and practice in a safe space.'}
              </p>
              <button className="button welcome-switch" type="button" onClick={switchAuthMode}>
                {authMode === 'signup' ? 'Sign in' : 'Create account'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="welcome-points" aria-label="Learning approach">
              <span><i>01</i> Learn</span>
              <span><i>02</i> Practice</span>
              <span><i>03</i> Protect</span>
            </div>
          </aside>
        </main>
        {storageError && <p className="storage-warning" role="status">{storageError}</p>}
        {serviceError && <p className="storage-warning" role="alert">{serviceError}</p>}
        <footer className="account-resource-footer">
          <ResourceLinks />
        </footer>
      </div>
    )
  }

  return (
    <div className={`academy${isDarkMode ? ' theme-dark' : ''}${isProfileEditorOpen ? ' profile-editor-open' : ''}`}>
      <header className="site-header">
        <a className="academy-brand" href="#home" aria-label="Cybersecurity Academy home">
          <img className="brand-logo" src="/images/cyber-logo.png" alt="" />
          <span>Cybersecurity<span className="brand-light">Academy</span></span>
        </a>

        <nav className="header-nav" aria-label="Main navigation">
          <a className="header-nav-link is-current" href="#home">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 10v10" /></svg>
            <span>Dashboard</span>
          </a>
          <a className="header-nav-link" href="#about-academy">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3.4-1.4 6.4-.8 9 1.2v13c-2.6-2-5.6-2.6-9-1.2zM21 5.5c-3.4-1.4-6.4-.8-9 1.2v13c2.6-2 5.6-2.6 9-1.2z" /></svg>
            <span>Learn</span>
          </a>
          <a
            className="header-nav-link"
            href={profile ? '#topics' : '#about-academy'}
            onClick={(event) => {
              if (!profile) {
                event.preventDefault()
                openAuth('signup')
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /><path d="m14 10 6-6" /></svg>
            <span>Practice</span>
          </a>
          <div className="header-tools-wrap">
            <button
              className="header-nav-link header-tools-toggle"
              type="button"
              aria-label={isToolsMenuOpen ? 'Close learning tools menu' : 'Open learning tools menu'}
              aria-haspopup="menu"
              aria-expanded={isToolsMenuOpen}
              aria-controls="header-tools-menu"
              onClick={() => setIsToolsMenuOpen((isOpen) => !isOpen)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6.5 17.5 3l3.5 3.5-3.5 3.5zM4 20l8.8-8.8M7.5 4H4v3.5M20 16.5V20h-3.5" /><circle cx="7" cy="17" r="3" /></svg>
              <span>Tools</span>
            </button>
            {isToolsMenuOpen && (
              <div className="header-tools-menu" id="header-tools-menu" role="menu" aria-label="Learning tools">
                {learningTools.map((tool) => (
                  <button
                    className="header-tools-item"
                    type="button"
                    role="menuitem"
                    key={tool.targetId}
                    onClick={() => openTool(tool.targetId)}
                  >
                    <strong>{tool.label}</strong>
                    <small>{tool.description}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <a className="header-nav-link" href="#site-footer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3.5a5 5 0 0 1-10 0zM7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4M12 12.5V18m-4 2h8m-7-2h6" /></svg>
            <span>Resources</span>
          </a>
        </nav>

        <div className="header-actions">
          <button
            className="header-icon-button"
            type="button"
            aria-label={profile ? 'Search learning topics' : 'Explore learning topics'}
            onClick={() => {
              if (!profile) {
                openAuth('signup')
                return
              }
              document.querySelector('.topic-search input')?.focus()
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 4.3 4.3" /></svg>
          </button>
          <button
            className="theme-toggle header-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            aria-pressed={isDarkMode}
          >
            <span className="theme-toggle-icon" aria-hidden="true">{isDarkMode ? '☀' : '☾'}</span>
            <span className="theme-toggle-label">{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          {profile ? (
            <>
              <button className="button button-outline header-button" type="button" onClick={signOut}>
                Sign out
              </button>
              <button
                className="profile-trigger"
                type="button"
                onClick={openProfileEditor}
                aria-label={`Edit profile for ${profile.name}`}
              >
                <ProfileAvatar profile={profile} />
              </button>
            </>
          ) : (
            <>
              <button className="signin-link" type="button" onClick={() => openAuth('signin')}>
                Sign in
              </button>
              <button className="button button-green header-button" type="button" onClick={() => openAuth('signup')}>
                Create account
              </button>
            </>
          )}
        </div>
      </header>

      {isProfileEditorOpen && profile && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isProfileSubmitting) {
              setIsProfileEditorOpen(false)
            }
          }}
        >
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <button
              className="profile-modal-close"
              type="button"
              onClick={() => setIsProfileEditorOpen(false)}
              aria-label="Close account settings"
              disabled={isProfileSubmitting}
            >
              ×
            </button>
            <span className="section-eyebrow">YOUR ACCOUNT</span>
            <h2 id="profile-modal-title">Personalize your profile</h2>
            <p className="profile-modal-lead">Update your display name and add a picture that appears with your account.</p>
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <div className="profile-picture-editor">
                {profilePicturePreview
                  ? <img className="profile-picture-preview" src={profilePicturePreview} alt="Profile picture preview" />
                  : <ProfileAvatar
                    profile={removeProfilePicture ? { ...profile, pictureUrl: null } : profile}
                    className="profile-picture-preview profile-avatar-large"
                  />}
                <div className="profile-picture-actions">
                  <label className="profile-picture-upload">
                    Choose a picture
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePictureSelect} />
                  </label>
                  {(profilePicturePreview || profilePictureFile) && (
                    <button
                      className="profile-picture-remove"
                      type="button"
                      onClick={() => {
                        setProfilePictureFile(null)
                        setProfilePicturePreview('')
                        setRemoveProfilePicture(Boolean(profile.pictureUrl))
                      }}
                    >
                      Remove picture
                    </button>
                  )}
                  <span className="profile-picture-hint">JPG, PNG, or WebP · up to 2 MB</span>
                </div>
              </div>
              <label className="profile-name-label">
                Display name
                <input name="name" type="text" defaultValue={profile.name} maxLength={60} required />
              </label>
              <label className="profile-name-label">
                Email address
                <input type="email" value={profile.email} readOnly />
              </label>
              {profileError && <p className="profile-edit-error" role="alert">{profileError}</p>}
              <button className="button button-green profile-save-button" type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? 'Saving changes…' : 'Save changes'}
                {!isProfileSubmitting && <span aria-hidden="true">→</span>}
              </button>
            </form>
          </section>
        </div>
      )}

      <main>
        {activeTopic ? (
          <TopicLesson
            key={activeTopic.name}
            topic={activeTopic}
            onClose={() => setActiveTopic(null)}
          />
        ) : (
          <>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <span className="kicker"><span className="kicker-dot" /> YOUR STARTING POINT FOR ONLINE SAFETY</span>
            <h1>Make the digital world a little <span>safer.</span></h1>
            <p className="hero-description">
              Build real-world cybersecurity knowledge, one clear lesson at a time.
              Learn the risks, understand the defenses, and practice in a safe space.
            </p>
            <div className="hero-actions">
              {profile ? (
                <a className="button button-green" href="#topics">Explore the topics <span aria-hidden="true">→</span></a>
              ) : (
                <button className="button button-green" type="button" onClick={() => openAuth('signup')}>
                  Create your free profile <span aria-hidden="true">→</span>
                </button>
              )}
              {!profile && <button className="hero-signin" type="button" onClick={() => openAuth('signin')}>Already have an account? <u>Sign in</u></button>}
              {profile &&               <a className="hero-signin" href="#topics">Continue learning <span aria-hidden="true">→</span></a>}
            </div>
            <div className="hero-proof">
              <span className="proof-icon" aria-hidden="true">✓</span>
              <span><strong>Learn safely</strong> · Educational content focused on defense</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="/images/cybersecurity-team.png"
              alt="Cybersecurity professional protecting a digital network"
            />
            <div className="image-shade" />
            <div className="visual-badge"><span aria-hidden="true">✳</span> KNOWLEDGE IS YOUR FIRST LINE OF DEFENSE</div>
            <div className="visual-card">
              <span className="visual-lock" aria-hidden="true">⌑</span>
              <div><strong>Security starts with you.</strong><span>Understand. Protect. Repeat.</span></div>
              <span className="visual-arrow" aria-hidden="true">↗</span>
            </div>
            <span className="visual-caption">A safer internet is built together</span>
          </div>
        </section>

        <section className="trust-strip" aria-label="Learning approach">
          <span><i>01</i> Clear, beginner-friendly lessons</span>
          <span><i>02</i> Practical, defensive thinking</span>
          <span><i>03</i> Safe, local practice labs</span>
        </section>

        <section className="intro-section" id="about-academy">
          <div className="intro-label"><span>THE BIG PICTURE</span><span className="intro-line" /></div>
          <div className="intro-content">
            <h2>Cybersecurity is how we <em>protect</em> the things that matter online.</h2>
            <div className="intro-text">
              <p>Cybersecurity is the practice of protecting devices, networks, applications, and data from unauthorized access, damage, or disruption.</p>
              <p>It brings together people, processes, and technology to keep information safer, reduce risk, and respond when something goes wrong.</p>
              {profile ? (
                <a className="text-link" href="#topics">Browse all {topics.length} learning topics <span aria-hidden="true">↗</span></a>
              ) : (
                <button className="text-link definition-signup" type="button" onClick={() => openAuth('signup')}>
                  Create a profile to explore the full library <span aria-hidden="true">↗</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {profile && (
          <>
        <section className="topics-section" id="topics">
          <div className="section-title-row">
            <div>
              <span className="section-eyebrow">YOUR LEARNING PATH</span>
              <h2>Explore {topics.length} cybersecurity topics</h2>
              <p>Every topic includes a clear explanation and a safe, defensive lab.</p>
            </div>
          </div>

          <div className="topic-tools">
            <label className="topic-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={topicQuery}
                onChange={(event) => setTopicQuery(event.target.value)}
                placeholder="Search cybersecurity topics"
                aria-label="Search cybersecurity topics"
              />
            </label>
            <label className="topic-filter-label">
              <span>Filter by area</span>
              <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
                {topicCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <span className="topic-count">Showing {visibleTopics.length} of {topics.length}</span>
          </div>

          <div className="topics-grid">
            {visibleTopics.map((topic, index) => (
              <article className={`topic-card ${!profile ? 'topic-locked' : ''}`} key={topic.name}>
                <div className="topic-image">
                  <img
                    src={topic.image}
                    alt={`${topic.name} cybersecurity illustration`}
                    loading="lazy"
                  />
                  <span className="topic-number">{String(index + 1).padStart(2, '0')}</span>
                  {!profile && <span className="topic-lock" aria-label="Profile required">⌑</span>}
                </div>
                <div className="topic-body">
                  <span className="topic-category">{topic.category}</span>
                  <h3>{topic.name}</h3>
                  <p>{topic.summary}</p>
                  <button className="topic-link" type="button" onClick={() => openTopic(topic)}>
                    {profile ? 'Open lesson' : 'Unlock lesson'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          {visibleTopics.length === 0 && (
            <p className="topic-empty">No topics match your search. Try another word or choose a different area.</p>
          )}
        </section>

          </>
        )}
          </>
        )}
      </main>

      <footer className="site-footer" id="site-footer">
        <a className="academy-brand footer-brand" href="#home">
          <img className="brand-logo" src="/images/cyber-logo.png" alt="" />
          <span>Cybersecurity<span className="brand-light">Academy</span></span>
        </a>
        <span>Learn to protect. Practice responsibly.</span>
        <ResourceLinks />
        <a href="#home">Back to top ↑</a>
      </footer>

      <div className="demo-disclaimer">
        <span aria-hidden="true">ⓘ</span>
        Learning accounts are stored in the local app database. Do not reuse passwords or use this local demo for sensitive accounts.
      </div>
      {storageError && <p className="storage-warning" role="status">{storageError}</p>}
      {serviceError && <p className="storage-warning" role="alert">{serviceError}</p>}

    </div>
  )
}

export default App
