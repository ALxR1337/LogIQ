import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'logiq_auth'
const USERS_STORAGE_KEY = 'logiq_users'

// --- Storage helpers ---
function getStoredAuth() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!raw) return null
        const data = JSON.parse(raw)
        // Validate token hasn't expired (30 days)
        if (Date.now() - data.issuedAt > 30 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(AUTH_STORAGE_KEY)
            return null
        }
        return data
    } catch {
        return null
    }
}

function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function persistAuth(user) {
    const authData = {
        user: { email: user.email, id: user.id, createdAt: user.createdAt },
        issuedAt: Date.now(),
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
}

// Simple hash for password (not cryptographic — for demo/localStorage only)
function simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// --- Reducer ---
const initialState = {
    user: null,
    loading: true,
    error: null,
}

function authReducer(state, action) {
    switch (action.type) {
        case 'AUTH_LOADED':
            return { ...state, user: action.user, loading: false, error: null }
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.user, loading: false, error: null }
        case 'REGISTER_SUCCESS':
            return { ...state, user: action.user, loading: false, error: null }
        case 'AUTH_ERROR':
            return { ...state, error: action.error, loading: false }
        case 'CLEAR_ERROR':
            return { ...state, error: null }
        case 'LOGOUT':
            return { ...initialState, loading: false }
        default:
            return state
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Auto-check auth status on mount
    useEffect(() => {
        const stored = getStoredAuth()
        if (stored?.user) {
            dispatch({ type: 'AUTH_LOADED', user: stored.user })
        } else {
            dispatch({ type: 'AUTH_LOADED', user: null })
        }
    }, [])

    const login = useCallback((email, password) => {
        dispatch({ type: 'CLEAR_ERROR' })

        const users = getUsers()
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (!user) {
            dispatch({ type: 'AUTH_ERROR', error: 'No account found with this email address.' })
            return false
        }

        const hashedPassword = simpleHash(password)
        if (user.passwordHash !== hashedPassword) {
            dispatch({ type: 'AUTH_ERROR', error: 'Incorrect password. Please try again.' })
            return false
        }

        persistAuth(user)
        dispatch({ type: 'LOGIN_SUCCESS', user: { email: user.email, id: user.id, createdAt: user.createdAt } })
        return true
    }, [])

    const register = useCallback((email, password) => {
        dispatch({ type: 'CLEAR_ERROR' })

        const users = getUsers()
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (exists) {
            dispatch({ type: 'AUTH_ERROR', error: 'An account with this email already exists.' })
            return false
        }

        const newUser = {
            id: generateId(),
            email: email.toLowerCase().trim(),
            passwordHash: simpleHash(password),
            createdAt: new Date().toISOString(),
        }

        users.push(newUser)
        saveUsers(users)
        persistAuth(newUser)
        dispatch({
            type: 'REGISTER_SUCCESS',
            user: { email: newUser.email, id: newUser.id, createdAt: newUser.createdAt },
        })
        return true
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        dispatch({ type: 'LOGOUT' })
    }, [])

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' })
    }, [])

    const deleteAccount = useCallback(() => {
        if (!state.user) return
        const users = getUsers().filter(u => u.id !== state.user.id)
        saveUsers(users)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        dispatch({ type: 'LOGOUT' })
    }, [state.user])

    const value = {
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
        clearError,
        deleteAccount,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext
