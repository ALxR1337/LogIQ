import { Link } from 'react-router-dom'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

export default function About() {
    useDocumentHead('About', 'Learn how LogIQ works, the five cognitive areas we test, and how your score is calculated.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="about-page" id="main-content">
                    <div className="about-hero">
                        <span className="about-label">About LogIQ</span>
                        <h1 className="about-title">
                            A smarter way to<br />
                            understand your mind<span className="accent-dot">.</span>
                        </h1>
                    </div>

                    <div className="about-grid">
                        <section className="about-card">
                            <div className="about-card-number">01</div>
                            <h2 className="about-card-title">What is LogIQ?</h2>
                            <p className="about-card-text">
                                LogIQ is a free, scientifically designed IQ test that explores
                                your strengths across five key cognitive areas: pattern recognition,
                                sequence completion, logical deduction, spatial reasoning, and analogical thinking.
                            </p>
                            <p className="about-card-text">
                                Built on decades of psychometric research, it gives you a reliable
                                estimate of your IQ score — no sign-ups, no paywalls, no gimmicks.
                            </p>
                        </section>

                        <section className="about-card">
                            <div className="about-card-number">02</div>
                            <h2 className="about-card-title">Methodology</h2>
                            <p className="about-card-text">
                                Each of our 30 questions is calibrated against established psychometric frameworks
                                including Raven's Progressive Matrices and the Wechsler Adult Intelligence Scale (WAIS).
                            </p>
                            <p className="about-card-text">
                                Questions scale in difficulty using an adaptive model. Your raw score is mapped
                                onto a normal distribution (μ=100, σ=15) to produce your IQ estimate and
                                percentile ranking.
                            </p>
                        </section>

                        <section className="about-card">
                            <div className="about-card-number">03</div>
                            <h2 className="about-card-title">Five Domains</h2>
                            <div className="about-domains">
                                <div className="domain-item">
                                    <span className="domain-icon">◆</span>
                                    <div>
                                        <strong>Pattern Recognition</strong>
                                        <p>Visual matrix patterns — identifying rules in grids of shapes</p>
                                    </div>
                                </div>
                                <div className="domain-item">
                                    <span className="domain-icon">◆</span>
                                    <div>
                                        <strong>Sequence Completion</strong>
                                        <p>Number, letter, and shape sequences — predicting the next element</p>
                                    </div>
                                </div>
                                <div className="domain-item">
                                    <span className="domain-icon">◆</span>
                                    <div>
                                        <strong>Logical Deduction</strong>
                                        <p>Verbal and abstract logic — drawing valid conclusions from premises</p>
                                    </div>
                                </div>
                                <div className="domain-item">
                                    <span className="domain-icon">◆</span>
                                    <div>
                                        <strong>Spatial Reasoning</strong>
                                        <p>Mental rotation, reflection, and folding — visualizing transformations</p>
                                    </div>
                                </div>
                                <div className="domain-item">
                                    <span className="domain-icon">◆</span>
                                    <div>
                                        <strong>Analogies</strong>
                                        <p>Relational reasoning — "A is to B as C is to ?"</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="about-card about-card-disclaimer">
                            <div className="about-card-number">!</div>
                            <h2 className="about-card-title">Important Disclaimer</h2>
                            <p className="about-card-text">
                                LogIQ is a <strong>recreational cognitive exercise</strong>, not a clinical
                                diagnostic tool. Our results provide an estimate of cognitive ability based
                                on limited test items. A comprehensive IQ assessment requires administration
                                by a qualified psychologist with standardized, normed instruments.
                            </p>
                            <p className="about-card-text">
                                Factors like fatigue, distraction, and test anxiety can influence your score.
                                Treat your result as an interesting data point, not a definitive measure.
                            </p>
                        </section>
                    </div>

                    <div className="about-cta">
                        <Link to="/test" className="cta-button">
                            Take the Test <span className="cta-arrow">→</span>
                        </Link>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
