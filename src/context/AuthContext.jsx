import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'logiq_auth'
const USERS_STORAGE_KEY = 'logiq_users'
const AUTH_INTEGRITY_SECRET = 'logiq_auth_integrity_v2'

// --- Crypto helpers ---

/** Generate a random 16-byte hex salt */
function generateSalt() {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Hash password with SHA-256 + per-user salt (Web Crypto API) */
async function hashPassword(password, salt) {
    const encoder = new TextEncoder()
    const data = encoder.encode(salt + ':' + password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Legacy hash for migration from old simpleHash accounts */
function legacyHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

// --- Integrity checksum (FNV-1a) ---

function computeChecksum(obj) {
    const str = AUTH_INTEGRITY_SECRET + ':' + JSON.stringify(obj)
    let h = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return (h >>> 0).toString(36)
}

// --- User store obfuscation ---
// Prevents casual browsing of user data in DevTools.
// Not true encryption — client-side auth is inherently demo-grade.

function encodeStore(data) {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    } catch {
        return JSON.stringify(data)
    }
}

function decodeStore(raw) {
    try {
        // Try obfuscated (base64) format first
        return JSON.parse(decodeURIComponent(escape(atob(raw))))
    } catch {
        // Fall back to plain JSON (migration from old format)
        try {
            return JSON.parse(raw)
        } catch {
            return []
        }
    }
}

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
        // Validate integrity checksum — detect DevTools tampering
        if (data._checksum) {
            const { _checksum, ...payload } = data
            if (_checksum !== computeChecksum(payload)) {
                localStorage.removeItem(AUTH_STORAGE_KEY)
                return null
            }
        }
        return data
    } catch {
        return null
    }
}

function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY)
        if (!raw) return []
        return decodeStore(raw)
    } catch {
        return []
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, encodeStore(users))
}

function persistAuth(user) {
    const payload = {
        user: { email: user.email, id: user.id, createdAt: user.createdAt },
        issuedAt: Date.now(),
    }
    const authData = {
        ...payload,
        _checksum: computeChecksum(payload),
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
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

    const login = useCallback(async (email, password) => {
        dispatch({ type: 'CLEAR_ERROR' })

        const users = getUsers()
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (!user) {
            dispatch({ type: 'AUTH_ERROR', error: 'No account found with this email address.' })
            return false
        }

        // Try SHA-256 hash (new accounts have a salt)
        if (user.salt) {
            const hashed = await hashPassword(password, user.salt)
            if (user.passwordHash !== hashed) {
                dispatch({ type: 'AUTH_ERROR', error: 'Incorrect password. Please try again.' })
                return false
            }
        } else {
            // Legacy migration: verify with old simpleHash
            const legacyHashed = legacyHash(password)
            if (user.passwordHash !== legacyHashed) {
                dispatch({ type: 'AUTH_ERROR', error: 'Incorrect password. Please try again.' })
                return false
            }
            // Upgrade to SHA-256 + salt transparently
            const salt = generateSalt()
            const newHash = await hashPassword(password, salt)
            user.salt = salt
            user.passwordHash = newHash
            saveUsers(users)
        }

        persistAuth(user)
        dispatch({ type: 'LOGIN_SUCCESS', user: { email: user.email, id: user.id, createdAt: user.createdAt } })
        return true
    }, [])

    const register = useCallback(async (email, password) => {
        dispatch({ type: 'CLEAR_ERROR' })

        const users = getUsers()
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase())

        if (exists) {
            dispatch({ type: 'AUTH_ERROR', error: 'An account with this email already exists.' })
            return false
        }

        const salt = generateSalt()
        const hashed = await hashPassword(password, salt)

        const newUser = {
            id: generateId(),
            email: email.toLowerCase().trim(),
            passwordHash: hashed,
            salt,
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
