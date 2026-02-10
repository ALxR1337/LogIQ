import { Link } from 'react-router-dom'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

export default function Privacy() {
    useDocumentHead('Privacy Policy', 'LogIQ privacy policy — learn how we handle your data, what we store, and your rights.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="legal-page" id="main-content">
                    <div className="about-hero">
                        <span className="about-label">Legal</span>
                        <h1 className="about-title">
                            Privacy policy<span className="accent-dot">.</span>
                        </h1>
                        <p className="legal-updated">Last updated: February 10, 2026</p>
                    </div>

                    <div className="legal-content">
                        <section className="legal-section">
                            <h2 className="legal-heading">1. Overview</h2>
                            <p className="legal-text">
                                LogIQ is a browser-based cognitive assessment tool. We are committed to
                                protecting your privacy. This policy explains what data we collect (very little),
                                how it's used, and your rights.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">2. Data Collection</h2>
                            <p className="legal-text">
                                LogIQ runs primarily in your browser. Your test answers, scores, and results are
                                processed client-side and are never transmitted to any external server.
                            </p>
                            <p className="legal-text">
                                <strong>Account Data:</strong> If you create an account, we store your email address
                                and a hashed password in your browser's local storage. This data is used solely
                                for authentication and never leaves your device or is transmitted to third parties.
                            </p>
                            <p className="legal-text">
                                <strong>Session Data:</strong> Quiz progress is stored in your browser's <code>localStorage</code> for
                                session continuity (auto-save during a test) and your cookie consent preference.
                                This data never leaves your device.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">3. Cookies & Local Storage</h2>
                            <p className="legal-text">
                                LogIQ uses <code>localStorage</code> (not traditional cookies) for the following purposes:
                            </p>
                            <ul className="legal-list">
                                <li>
                                    <strong>Quiz auto-save</strong> — temporarily stores your progress during a test
                                    session. Automatically expires after 24 hours.
                                </li>
                                <li>
                                    <strong>Cookie consent preference</strong> — remembers whether you've accepted
                                    or declined the consent notice.
                                </li>
                                <li>
                                    <strong>Authentication</strong> — stores your login session token and account
                                    credentials (email and hashed password) locally in your browser.
                                </li>
                            </ul>
                            <p className="legal-text">
                                No third-party cookies are used. No tracking cookies are set.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">4. Third-Party Services</h2>
                            <p className="legal-text">
                                LogIQ loads fonts from Google Fonts. Google may collect anonymized usage
                                data through font requests. No other third-party services, analytics platforms,
                                or advertising networks are integrated.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">5. Data Sharing</h2>
                            <p className="legal-text">
                                We do not sell, trade, rent, or share any user data with third parties.
                                Since we don't collect data, there is nothing to share.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">6. Your Rights</h2>
                            <p className="legal-text">
                                Since all data is stored locally in your browser, you have full control:
                            </p>
                            <ul className="legal-list">
                                <li>Clear your browser's localStorage at any time to remove all LogIQ data.</li>
                                <li>Use your browser's privacy/incognito mode to prevent any data persistence.</li>
                                <li>Decline the cookie consent banner to minimize data storage.</li>
                                <li>Delete your account at any time — all associated data will be permanently removed from your browser.</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">7. Children's Privacy</h2>
                            <p className="legal-text">
                                LogIQ is not directed at children under 13. We do not knowingly collect
                                information from children. The test is designed for adults and older adolescents.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">8. Changes to This Policy</h2>
                            <p className="legal-text">
                                We may update this privacy policy from time to time. Changes will be reflected
                                on this page with an updated revision date. Continued use of LogIQ after
                                changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">9. Contact</h2>
                            <p className="legal-text">
                                If you have questions about this privacy policy, please reach out via the
                                repository's issue tracker or contact form.
                            </p>
                        </section>
                    </div>

                    <div className="about-cta">
                        <Link to="/" className="cta-button">
                            Back to Home <span className="cta-arrow">→</span>
                        </Link>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
