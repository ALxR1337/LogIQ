import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const { isAuthenticated, user, logout } = useAuth()

    const closeMenu = () => setMenuOpen(false)

    const handleLogout = () => {
        closeMenu()
        logout()
    }

    return (
        <nav className="nav" role="navigation" aria-label="Main navigation">
            <Link to="/" className="nav-logo" onClick={closeMenu}>
                Log<span className="iq">IQ</span>
            </Link>

            {/* Hamburger button — mobile only */}
            <button
                className={`nav-hamburger ${menuOpen ? 'nav-hamburger--open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
            >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
            </button>

            {/* Overlay — mobile only */}
            {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}

            {/* Nav links */}
            <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
                <li>
                    <Link
                        to="/about"
                        onClick={closeMenu}
                        aria-current={location.pathname === '/about' ? 'page' : undefined}
                    >
                        About
                    </Link>
                </li>
                <li>
                    <Link
                        to="/faq"
                        onClick={closeMenu}
                        aria-current={location.pathname === '/faq' ? 'page' : undefined}
                    >
                        FAQ
                    </Link>
                </li>

                {isAuthenticated ? (
                    <>
                        <li className="nav-user-info">
                            <span className="nav-user-email" title={user?.email}>
                                {user?.email}
                            </span>
                        </li>
                        <li>
                            <button
                                className="nav-auth-btn nav-auth-btn--logout"
                                onClick={handleLogout}
                            >
                                Log Out
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="nav-auth-link"
                                aria-current={location.pathname === '/login' ? 'page' : undefined}
                            >
                                Log In
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/register"
                                onClick={closeMenu}
                                className="nav-auth-btn"
                                aria-current={location.pathname === '/register' ? 'page' : undefined}
                            >
                                Sign Up
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}
