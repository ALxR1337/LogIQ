import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, children, title, icon }) {
    const contentRef = useRef(null)

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            // Focus trap — focus first focusable element
            const timer = setTimeout(() => {
                const focusable = contentRef.current?.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                focusable?.focus()
            }, 100)
            return () => {
                document.body.style.overflow = ''
                clearTimeout(timer)
            }
        }
    }, [isOpen])

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
        >
            <div
                className="modal-content"
                ref={contentRef}
                onClick={(e) => e.stopPropagation()}
            >
                {icon && <div className="modal-icon">{icon}</div>}
                {title && <h2 className="modal-title">{title}</h2>}
                {children}
            </div>
        </div>
    )
}
