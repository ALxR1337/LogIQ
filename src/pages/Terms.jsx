import { Link } from 'react-router-dom'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

export default function Terms() {
    useDocumentHead('Terms of Service', 'LogIQ terms of service — usage terms, disclaimers, and intellectual property notice.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="legal-page" id="main-content">
                    <div className="about-hero">
                        <span className="about-label">Legal</span>
                        <h1 className="about-title">
                            Terms of service<span className="accent-dot">.</span>
                        </h1>
                        <p className="legal-updated">Last updated: February 10, 2026</p>
                    </div>

                    <div className="legal-content">
                        <section className="legal-section">
                            <h2 className="legal-heading">1. Acceptance of Terms</h2>
                            <p className="legal-text">
                                By accessing and using LogIQ, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use the service.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">2. Nature of the Service</h2>
                            <p className="legal-text">
                                LogIQ is a <strong>recreational and educational cognitive assessment tool</strong>.
                                It is not a clinical diagnostic instrument. The IQ scores and percentile
                                rankings provided are estimates based on psychometric models and should not
                                be interpreted as medical, psychological, or professional evaluations.
                            </p>
                            <p className="legal-text">
                                For a clinically valid IQ assessment, consult a licensed psychologist or
                                qualified mental health professional who can administer standardized,
                                normed instruments in a controlled setting.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">3. Permitted Use</h2>
                            <p className="legal-text">
                                You may use LogIQ for personal, non-commercial purposes. You agree not to:
                            </p>
                            <ul className="legal-list">
                                <li>Reproduce, distribute, or create derivative works from the test content.</li>
                                <li>Use automated scripts or bots to access the service.</li>
                                <li>Attempt to reverse-engineer the scoring algorithm.</li>
                                <li>Misrepresent LogIQ results as clinically validated scores.</li>
                                <li>Use the service for employment screening or academic admissions.</li>
                                <li>Create multiple accounts for the purpose of circumventing usage limits.</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">4. Account Creation & Data Retention</h2>
                            <p className="legal-text">
                                Creating an account is optional but required to view full test results. By registering,
                                you provide an email address and password. Your credentials are stored locally in your
                                browser using hashed passwords — LogIQ does not transmit or store credentials on any
                                external server.
                            </p>
                            <p className="legal-text">
                                Your email is used solely for authentication purposes. We will never send marketing
                                emails without your explicit opt-in consent. You may delete your account at any time,
                                which permanently removes all associated data from your browser.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">5. Intellectual Property</h2>
                            <p className="legal-text">
                                All content on LogIQ — including questions, scoring algorithms, design,
                                graphics, and code — is the intellectual property of LogIQ's creators.
                                Unauthorized reproduction or distribution of test materials is prohibited.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">6. Disclaimer of Warranties</h2>
                            <p className="legal-text">
                                LogIQ is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
                                warranties of any kind, either express or implied. We do not guarantee:
                            </p>
                            <ul className="legal-list">
                                <li>The accuracy or reliability of test results.</li>
                                <li>That the service will be uninterrupted or error-free.</li>
                                <li>That results will match those from clinical IQ tests.</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">7. Limitation of Liability</h2>
                            <p className="legal-text">
                                To the fullest extent permitted by law, LogIQ and its creators shall not be
                                liable for any indirect, incidental, special, consequential, or punitive
                                damages arising from your use of the service. This includes, but is not
                                limited to, damages related to:
                            </p>
                            <ul className="legal-list">
                                <li>Decisions made based on test results.</li>
                                <li>Emotional distress resulting from scores.</li>
                                <li>Loss of data or service interruptions.</li>
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">8. Score Interpretation</h2>
                            <p className="legal-text">
                                Test scores are influenced by many factors including test environment,
                                fatigue, anxiety, familiarity with test formats, and momentary concentration.
                                A single test session does not capture the full spectrum of cognitive ability.
                                Treat your result as an interesting data point, not a definitive label.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">9. Modifications</h2>
                            <p className="legal-text">
                                We reserve the right to modify, suspend, or discontinue LogIQ at any time
                                without notice. We may also update these terms periodically. Continued use
                                after changes constitutes acceptance of the revised terms.
                            </p>
                        </section>

                        <section className="legal-section">
                            <h2 className="legal-heading">10. Governing Law</h2>
                            <p className="legal-text">
                                These terms shall be governed by and construed in accordance with applicable
                                laws. Any disputes arising from the use of LogIQ shall be resolved through
                                good-faith negotiation.
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
