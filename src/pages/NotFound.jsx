import { Link } from 'react-router-dom'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

export default function NotFound() {
    useDocumentHead('404 — Page Not Found', 'The page you\'re looking for doesn\'t exist. Navigate back to LogIQ and take the test.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="notfound-page" id="main-content">
                    <div className="notfound-content">
                        {/* Glitch 404 */}
                        <div className="notfound-code" aria-hidden="true">
                            <span className="notfound-digit" data-text="4">4</span>
                            <span className="notfound-digit notfound-digit--zero" data-text="0">0</span>
                            <span className="notfound-digit" data-text="4">4</span>
                        </div>

                        {/* Decorative scanline */}
                        <div className="notfound-scanline" aria-hidden="true" />

                        <h1 className="notfound-title">
                            Signal not found<span className="accent-dot">.</span>
                        </h1>
                        <p className="notfound-text">
                            The neural pathway you followed doesn't lead anywhere.
                            <br />
                            This page has been lost to the void.
                        </p>

                        <div className="notfound-actions">
                            <Link to="/" className="cta-button notfound-cta">
                                Back to Home <span className="cta-arrow">→</span>
                            </Link>
                            <Link to="/test" className="cta-button cta-button--secondary notfound-cta">
                                Take the Test <span className="cta-arrow">→</span>
                            </Link>
                        </div>

                        {/* Ambient error code */}
                        <div className="notfound-error-code" aria-hidden="true">
                            ERR::ROUTE_NULL — requested path returned ∅
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
