import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
        const id = ++toastIdCounter
        setToasts(prev => [...prev, { id, message, type, duration }])
        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="toast-container" role="status" aria-live="polite">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        if (toast.duration > 0) {
            const timer = setTimeout(onRemove, toast.duration)
            return () => clearTimeout(timer)
        }
    }, [toast.duration, onRemove])

    return (
        <div className={`toast-item toast-item--${toast.type}`} onClick={onRemove}>
            <span className="toast-icon">
                {toast.type === 'warning' ? '⚡' :
                    toast.type === 'error' ? '✕' :
                        toast.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
        </div>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
