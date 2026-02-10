import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'logiq-cookie-consent'

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY)
        if (!stored) {
            // Delay appearance for a smoother experience
            const timer = setTimeout(() => {
                setVisible(true)
                // Trigger entrance animation
                requestAnimationFrame(() => setAnimating(true))
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const dismiss = (choice) => {
        setAnimating(false)
        setTimeout(() => {
            localStorage.setItem(CONSENT_KEY, JSON.stringify({
                consent: choice,
                timestamp: Date.now(),
            }))
            setVisible(false)
        }, 350)
    }

    if (!visible) return null

    return (
        <div
            className={`cookie-banner ${animating ? 'cookie-banner--visible' : ''}`}
            role="dialog"
            aria-label="Cookie consent"
            aria-describedby="cookie-desc"
        >
            <div className="cookie-inner">
                <div className="cookie-text-group">
                    <p className="cookie-heading">Data & Privacy</p>
                    <p className="cookie-desc" id="cookie-desc">
                        LogIQ stores minimal data in your browser's localStorage for test
                        auto-save functionality. No personal data is collected or transmitted.{' '}
                        <Link to="/privacy" className="cookie-link">Learn more</Link>
                    </p>
                </div>
                <div className="cookie-actions">
                    <button
                        className="cookie-btn cookie-btn--accept"
                        onClick={() => dismiss('accepted')}
                    >
                        Accept
                    </button>
                    <button
                        className="cookie-btn cookie-btn--decline"
                        onClick={() => dismiss('declined')}
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    )
}
