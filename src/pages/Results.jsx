import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'

function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}m ${sec}s`
}

function formatTimeShort(ms) {
    const sec = Math.round(ms / 1000)
    return `${sec}s`
}

/* Animated counter that counts up from 0 to target */
function AnimatedNumber({ target, duration = 2000, suffix = '' }) {
    const [value, setValue] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        const start = performance.now()
        const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) {
                ref.current = requestAnimationFrame(animate)
            }
        }
        ref.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(ref.current)
    }, [target, duration])

    return <>{value}{suffix}</>
}

/* SVG Bell Curve showing where user falls */
function BellCurve({ iqScore }) {
    const width = 500
    const height = 180
    const padding = { top: 20, bottom: 40, left: 20, right: 20 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    // Generate bell curve points (normal distribution)
    const points = []
    for (let x = 55; x <= 145; x += 1) {
        const z = (x - 100) / 15
        const y = Math.exp(-0.5 * z * z) / (15 * Math.sqrt(2 * Math.PI))
        points.push({ x, y })
    }

    const maxY = Math.max(...points.map(p => p.y))

    const toSVG = (pt) => ({
        x: padding.left + ((pt.x - 55) / 90) * chartW,
        y: padding.top + chartH - (pt.y / maxY) * chartH,
    })

    const pathData = points.map((pt, i) => {
        const { x, y } = toSVG(pt)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    // Fill area
    const firstPt = toSVG(points[0])
    const lastPt = toSVG(points[points.length - 1])
    const fillPath = `${pathData} L ${lastPt.x} ${padding.top + chartH} L ${firstPt.x} ${padding.top + chartH} Z`

    // User marker position
    const userX = padding.left + ((Math.max(55, Math.min(145, iqScore)) - 55) / 90) * chartW
    const userZ = (iqScore - 100) / 15
    const userY_val = Math.exp(-0.5 * userZ * userZ) / (15 * Math.sqrt(2 * Math.PI))
    const userY = padding.top + chartH - (userY_val / maxY) * chartH

    // Axis labels
    const labels = [70, 85, 100, 115, 130]

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="bell-curve-svg">
            {/* Gradient fill */}
            <defs>
                <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0, 240, 255, 0.2)" />
                    <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                </linearGradient>
            </defs>

            {/* Fill */}
            <path d={fillPath} fill="url(#bellGrad)" />

            {/* Curve line */}
            <path
                d={pathData}
                fill="none"
                stroke="rgba(0, 240, 255, 0.6)"
                strokeWidth="2"
            />

            {/* Axis line */}
            <line
                x1={padding.left}
                y1={padding.top + chartH}
                x2={padding.left + chartW}
                y2={padding.top + chartH}
                stroke="rgba(232, 230, 225, 0.1)"
                strokeWidth="1"
            />

            {/* Axis labels */}
            {labels.map(val => {
                const x = padding.left + ((val - 55) / 90) * chartW
                return (
                    <g key={val}>
                        <line
                            x1={x} y1={padding.top + chartH}
                            x2={x} y2={padding.top + chartH + 6}
                            stroke="rgba(232, 230, 225, 0.15)"
                            strokeWidth="1"
                        />
                        <text
                            x={x}
                            y={padding.top + chartH + 22}
                            textAnchor="middle"
                            fill="rgba(232, 230, 225, 0.35)"
                            fontSize="10"
                            fontFamily="'DM Mono', monospace"
                        >
                            {val}
                        </text>
                    </g>
                )
            })}

            {/* User marker */}
            <line
                x1={userX} y1={userY}
                x2={userX} y2={padding.top + chartH}
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="4,3"
                opacity="0.6"
            />
            <circle
                cx={userX}
                cy={userY}
                r="5"
                fill="var(--accent)"
                className="bell-curve-dot"
            />
            <text
                x={userX}
                y={userY - 12}
                textAnchor="middle"
                fill="var(--accent)"
                fontSize="11"
                fontFamily="'DM Mono', monospace"
                fontWeight="500"
            >
                {iqScore}
            </text>
        </svg>
    )
}

/* Category bar chart */
function CategoryChart({ categories }) {
    return (
        <div className="category-chart">
            {categories.map((cat, i) => (
                <div key={cat.key} className="category-row" style={{ animationDelay: `${1.8 + i * 0.1}s` }}>
                    <div className="category-label-row">
                        <span className="category-name">{cat.label}</span>
                        <span className="category-score">{cat.correct}/{cat.total}</span>
                    </div>
                    <div className="category-bar">
                        <div
                            className="category-bar-fill"
                            style={{
                                width: `${cat.percentage}%`,
                                animationDelay: `${2.0 + i * 0.1}s`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

/* Teaser Results — shown to unauthenticated users */
function ResultsTeaser() {
    return (
        <main className="results-page results-page--teaser" id="main-content">
            <section className="results-hero">
                <span className="about-label">Test Complete</span>

                <div className="score-display">
                    <div className="score-number score-number--blurred">
                        ???
                    </div>
                    <div className="score-label">IQ Score</div>
                </div>

                <div className="score-classification">
                    <span className="classification-badge classification-badge--blurred">■■■■■■■■</span>
                </div>

                <h2 className="teaser-headline">Your results are ready</h2>
                <p className="teaser-subtext">
                    You've completed all 30 questions. Create a free account to unlock your full IQ report 
                    with score, percentile ranking, bell curve placement, and category breakdown.
                </p>
            </section>

            {/* Blurred preview categories */}
            <section className="results-section teaser-preview">
                <h2 className="results-section-title">Category Breakdown</h2>
                <div className="category-chart category-chart--blurred">
                    {['Pattern Recognition', 'Sequence Completion', 'Logical Deduction', 'Spatial Reasoning', 'Analogies'].map((label, i) => (
                        <div key={label} className="category-row" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                            <div className="category-label-row">
                                <span className="category-name">{label}</span>
                                <span className="category-score teaser-redacted">■/■</span>
                            </div>
                            <div className="category-bar">
                                <div
                                    className="category-bar-fill category-bar-fill--teaser"
                                    style={{
                                        width: `${40 + Math.random() * 45}%`,
                                        animationDelay: `${1.0 + i * 0.1}s`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="teaser-overlay">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span>Create an account to view</span>
                </div>
            </section>

            {/* CTA */}
            <div className="teaser-cta-section">
                <Link to="/register" state={{ from: '/results' }} className="cta-button teaser-cta-main">
                    Register to See Results <span className="cta-arrow">→</span>
                </Link>
                <p className="teaser-login-link">
                    Already have an account?{' '}
                    <Link to="/login" state={{ from: '/results' }}>Log in</Link>
                </p>
            </div>

            {/* Trust signals */}
            <div className="teaser-trust">
                <span className="auth-trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Free forever
                </span>
                <span className="auth-trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                    No spam, ever
                </span>
                <span className="auth-trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Results saved to your account
                </span>
            </div>
        </main>
    )
}

export default function Results() {
    useDocumentHead('Your Results', 'View your LogIQ IQ test results: score, percentile ranking, category breakdown, and difficulty analysis.')
    const { results, resetQuiz, status } = useQuiz()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // If no results, redirect home
    useEffect(() => {
        if (status !== 'finished' || !results) {
            navigate('/')
        }
    }, [status, results, navigate])

    if (!results) return null

    // Practice mode results are always ungated
    const isPractice = !!results.practiceResults

    // Gate: unauthenticated users see teaser for full test results
    if (!isAuthenticated && !isPractice) {
        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <Navbar />
                    <ResultsTeaser />
                    <Footer />
                </div>
            </>
        )
    }

    const {
        iqScore, percentile, classification, classificationDescriptor,
        rawScore, totalQuestions, categories, difficultyBreakdown,
        totalTime, avgTimePerQuestion, fastestQuestion, slowestQuestion,
    } = results

    const handleRetake = () => {
        resetQuiz()
        navigate('/test')
    }

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="results-page" id="main-content">
                    {/* Score Hero */}
                    <section className="results-hero">
                        <span className="about-label">Your Results</span>

                        <div className="score-display">
                            <div className="score-number">
                                <AnimatedNumber target={iqScore} duration={2500} />
                            </div>
                            <div className="score-label">IQ Score</div>
                        </div>

                        <div className="score-classification">
                            <span className="classification-badge">{classification}</span>
                            <span className="classification-descriptor">{classificationDescriptor}</span>
                        </div>

                        <p className="percentile-text">
                            You scored higher than <strong><AnimatedNumber target={percentile} duration={2000} suffix="%" /></strong> of test takers
                        </p>
                    </section>

                    {/* Bell Curve */}
                    <section className="results-section results-bell">
                        <h2 className="results-section-title">Distribution Curve</h2>
                        <BellCurve iqScore={iqScore} />
                    </section>

                    {/* Stats Grid */}
                    <section className="results-stats-grid">
                        <div className="results-stat-card">
                            <div className="results-stat-value">{rawScore}<span className="accent">/{totalQuestions}</span></div>
                            <div className="results-stat-label">Correct Answers</div>
                        </div>
                        <div className="results-stat-card">
                            <div className="results-stat-value">{formatDuration(totalTime)}</div>
                            <div className="results-stat-label">Total Time</div>
                        </div>
                        <div className="results-stat-card">
                            <div className="results-stat-value">{formatTimeShort(avgTimePerQuestion)}</div>
                            <div className="results-stat-label">Avg / Question</div>
                        </div>
                        <div className="results-stat-card">
                            <div className="results-stat-value">{formatTimeShort(fastestQuestion)}<span className="accent"> → </span>{formatTimeShort(slowestQuestion)}</div>
                            <div className="results-stat-label">Fastest → Slowest</div>
                        </div>
                    </section>

                    {/* Category Breakdown */}
                    <section className="results-section">
                        <h2 className="results-section-title">Category Breakdown</h2>
                        <CategoryChart categories={categories} />
                    </section>

                    {/* Difficulty Analysis */}
                    <section className="results-section">
                        <h2 className="results-section-title">Difficulty Analysis</h2>
                        <div className="difficulty-grid">
                            <div className="difficulty-card">
                                <div className="difficulty-level">Easy</div>
                                <div className="difficulty-score">
                                    {difficultyBreakdown.easy.correct}/{difficultyBreakdown.easy.total}
                                </div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-bar-fill difficulty-bar-fill--easy"
                                        style={{ width: `${difficultyBreakdown.easy.total > 0 ? (difficultyBreakdown.easy.correct / difficultyBreakdown.easy.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="difficulty-card">
                                <div className="difficulty-level">Medium</div>
                                <div className="difficulty-score">
                                    {difficultyBreakdown.medium.correct}/{difficultyBreakdown.medium.total}
                                </div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-bar-fill difficulty-bar-fill--medium"
                                        style={{ width: `${difficultyBreakdown.medium.total > 0 ? (difficultyBreakdown.medium.correct / difficultyBreakdown.medium.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="difficulty-card">
                                <div className="difficulty-level">Hard</div>
                                <div className="difficulty-score">
                                    {difficultyBreakdown.hard.correct}/{difficultyBreakdown.hard.total}
                                </div>
                                <div className="difficulty-bar">
                                    <div
                                        className="difficulty-bar-fill difficulty-bar-fill--hard"
                                        style={{ width: `${difficultyBreakdown.hard.total > 0 ? (difficultyBreakdown.hard.correct / difficultyBreakdown.hard.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="results-actions">
                        <button className="cta-button" onClick={handleRetake}>
                            Retake Test <span className="cta-arrow">→</span>
                        </button>
                        <Link to="/" className="cta-button cta-button--secondary">
                            ← Back to Home
                        </Link>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    )
}
