import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="footer">
            <span className="footer-text">© 2026 LogIQ</span>
            <span className="footer-dot"></span>
            <span className="footer-text">Precision Psychometrics</span>
            <span className="footer-dot"></span>
            <Link to="/privacy" className="footer-link">Privacy</Link>
            <Link to="/terms" className="footer-link">Terms</Link>
        </footer>
    )
}
