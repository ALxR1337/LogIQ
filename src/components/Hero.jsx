import { useNavigate } from 'react-router-dom'

export default function Hero() {
    const navigate = useNavigate()

    return (
        <section className="hero">
            <div className="hero-label">Free IQ Test</div>

            <h1 className="hero-title">
                Discover Your <span className="highlight">Cognitive Strengths</span>
            </h1>

            <p className="hero-tagline">
                Take a scientifically designed IQ test with 30 questions across
                5 cognitive areas. Get your score in under 25 minutes.
            </p>

            <div className="hero-cta-group">
                <button className="cta-button" onClick={() => navigate('/test')}>
                    Start Your Test <span className="cta-arrow">→</span>
                </button>
                <button className="cta-button cta-button--demo" onClick={() => navigate('/practice')}>
                    See How It Works <span className="cta-arrow">→</span>
                </button>
            </div>
        </section>
    )
}
