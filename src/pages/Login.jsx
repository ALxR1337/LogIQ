import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

// --- Login Rate Limiting ---
const RATE_LIMIT_KEY = 'logiq_login_rl'
const MAX_FAILURES = 5
const LOCKOUT_DURATION = 60 * 1000 // 60 seconds

function getRateLimitState() {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY)
        if (!raw) return { failures: 0, lockedUntil: 0 }
        return JSON.parse(raw)
    } catch {
        return { failures: 0, lockedUntil: 0 }
    }
}

function setRateLimitState(state) {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state))
}

function recordFailure() {
    const state = getRateLimitState()
    state.failures++
    if (state.failures >= MAX_FAILURES) {
        state.lockedUntil = Date.now() + LOCKOUT_DURATION
    } else {
        // Exponential backoff: 1s, 2s, 4s, 8s
        state.lockedUntil = Date.now() + Math.pow(2, state.failures - 1) * 1000
    }
    setRateLimitState(state)
    return state
}

function resetRateLimit() {
    localStorage.removeItem(RATE_LIMIT_KEY)
}

export default function Login() {
    useDocumentHead('Log In', 'Log in to your LogIQ account to view your full IQ test results, score breakdown, and percentile ranking.')
    const { login, error, clearError, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [touched, setTouched] = useState({ email: false, password: false })
    const [submitting, setSubmitting] = useState(false)
    const [rateLimitMsg, setRateLimitMsg] = useState(null)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    // Where to redirect after login
    const from = location.state?.from || '/'

    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, from])

    useEffect(() => {
        clearError()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const passwordValid = password.length >= 6

    const canSubmit = emailValid && passwordValid && !submitting && cooldownSeconds <= 0

    // Rate limit cooldown timer
    useEffect(() => {
        const rl = getRateLimitState()
        if (rl.lockedUntil > Date.now()) {
            const remaining = Math.ceil((rl.lockedUntil - Date.now()) / 1000)
            setCooldownSeconds(remaining)
            setRateLimitMsg(
                rl.failures >= MAX_FAILURES
                    ? `Too many failed attempts. Try again in ${remaining}s.`
                    : `Please wait ${remaining}s before trying again.`
            )
        }
    }, [])

    // Countdown timer for rate limit
    useEffect(() => {
        if (cooldownSeconds <= 0) {
            setRateLimitMsg(null)
            return
        }
        const interval = setInterval(() => {
            setCooldownSeconds(prev => {
                const next = prev - 1
                if (next <= 0) {
                    setRateLimitMsg(null)
                    return 0
                }
                const rl = getRateLimitState()
                setRateLimitMsg(
                    rl.failures >= MAX_FAILURES
                        ? `Too many failed attempts. Try again in ${next}s.`
                        : `Please wait ${next}s before trying again.`
                )
                return next
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [cooldownSeconds > 0]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = (e) => {
        e.preventDefault()
        setTouched({ email: true, password: true })

        if (!canSubmit) return

        // Check rate limit before attempting
        const rl = getRateLimitState()
        if (rl.lockedUntil > Date.now()) {
            const remaining = Math.ceil((rl.lockedUntil - Date.now()) / 1000)
            setCooldownSeconds(remaining)
            return
        }

        setSubmitting(true)
        // Simulated slight delay for UX feel
        setTimeout(async () => {
            const success = await login(email, password)
            if (success) {
                resetRateLimit()
                navigate(from, { replace: true })
            } else {
                // Record failure and apply rate limit
                const newState = recordFailure()
                if (newState.lockedUntil > Date.now()) {
                    const remaining = Math.ceil((newState.lockedUntil - Date.now()) / 1000)
                    setCooldownSeconds(remaining)
                }
            }
            setSubmitting(false)
        }, 400)
    }

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="auth-page" id="main-content">
                    <div className="auth-container">
                        <div className="auth-header">
                            <span className="about-label">Welcome Back</span>
                            <h1 className="auth-title">
                                Log in<span className="accent-dot">.</span>
                            </h1>
                            <p className="auth-subtitle">
                                Access your results and cognitive profile
                            </p>
                        </div>

                        {error && (
                            <div className="auth-error" role="alert">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {rateLimitMsg && (
                            <div className="auth-error auth-error--rate-limit" role="alert">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span>{rateLimitMsg}</span>
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-email">
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    className={`auth-input ${touched.email && !emailValid ? 'auth-input--error' : ''}`}
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); clearError() }}
                                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                                {touched.email && !emailValid && (
                                    <span className="auth-field-error">Enter a valid email address</span>
                                )}
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-password">
                                    Password
                                </label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        className={`auth-input ${touched.password && !passwordValid ? 'auth-input--error' : ''}`}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); clearError() }}
                                        onBlur={() => setTouched(t => ({ ...t, password: true }))}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="auth-toggle-password"
                                        onClick={() => setShowPassword(s => !s)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {touched.password && !passwordValid && (
                                    <span className="auth-field-error">Password must be at least 6 characters</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="cta-button auth-submit"
                                disabled={!canSubmit}
                            >
                                {submitting ? (
                                    <>
                                        <span className="auth-spinner" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>Log In <span className="cta-arrow">→</span></>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p className="auth-switch">
                                Don't have an account?{' '}
                                <Link to="/register" state={{ from }} className="auth-switch-link">
                                    Create one
                                </Link>
                            </p>
                        </div>

                        <div className="auth-trust">
                            <span className="auth-trust-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                Secure & encrypted
                            </span>
                            <span className="auth-trust-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Free forever
                            </span>
                            <span className="auth-trust-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                                </svg>
                                No spam
                            </span>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
