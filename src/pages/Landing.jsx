import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatsStrip from '../components/StatsStrip'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

const STEPS = [
    { icon: '📝', title: 'Start the Test', text: 'Answer 30 carefully designed questions at your own pace.' },
    { icon: '🧩', title: '5 Cognitive Areas', text: 'Patterns, sequences, logic, spatial reasoning, and analogies.' },
    { icon: '⏱️', title: 'Under 25 Minutes', text: 'Most people finish in about 15 minutes. No time pressure.' },
    { icon: '📊', title: 'Get Your Score', text: 'See your IQ score, percentile, and a full breakdown instantly.' },
]

const TRUST_ITEMS = [
    'Based on established psychometric models',
    'No payment required for results',
    'Your data stays private',
    'Taken by 2.4M+ people worldwide',
]

export default function Landing() {
    useDocumentHead(null, 'Discover your cognitive strengths with a free, scientifically designed IQ test. 30 questions, instant results, detailed breakdown.')
    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />
                <main id="main-content">
                    <Hero />
                    <StatsStrip />

                    {/* How It Works */}
                    <section className="how-it-works">
                        <div className="how-it-works-inner">
                            <h2 className="section-title">How It Works</h2>
                            <p className="section-subtitle">Four simple steps to discover your cognitive profile</p>
                            <div className="steps-grid">
                                {STEPS.map((step, i) => (
                                    <div className="step-card" key={i}>
                                        <span className="step-number">{i + 1}</span>
                                        <span className="step-icon" aria-hidden="true">{step.icon}</span>
                                        <h3 className="step-title">{step.title}</h3>
                                        <p className="step-text">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Trust Strip */}
                    <section className="trust-section" aria-label="Trust indicators">
                        <div className="trust-items">
                            {TRUST_ITEMS.map((item, i) => (
                                <div className="trust-item" key={i}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    )
}
