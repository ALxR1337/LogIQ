import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h3>Log<span className="iq">IQ</span></h3>
                        <p>A scientifically designed IQ assessment you can take in under 25 minutes.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <Link to="/test">Take the Test</Link>
                        <Link to="/practice">Practice Mode</Link>
                        <Link to="/about">About</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <Link to="/faq">FAQ</Link>
                        <Link to="/about">Methodology</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span className="footer-text">© {new Date().getFullYear()} LogIQ. All rights reserved.</span>
                    <div className="footer-links-bottom">
                        <Link to="/privacy" className="footer-link">Privacy</Link>
                        <Link to="/terms" className="footer-link">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
