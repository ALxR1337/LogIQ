import { useNavigate } from 'react-router-dom'

export default function Hero() {
    const navigate = useNavigate()

    return (
        <main className="hero">
            <div className="hero-label">Cognitive Assessment</div>

            <h1 className="hero-title">
                Log<span className="iq">IQ</span>
            </h1>

            <p className="hero-tagline">
                A precision-engineered IQ test built on established psychometric
                models. 30 questions. No registration. Instant results.
            </p>

            <div className="hero-cta-group">
                <button className="cta-button" onClick={() => navigate('/test')}>
                    Begin Test <span className="cta-arrow">→</span>
                </button>
                <button className="cta-button cta-button--demo" onClick={() => navigate('/practice')}>
                    Try Demo <span className="cta-arrow">→</span>
                </button>
            </div>
        </main>
    )
}
