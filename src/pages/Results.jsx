import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { useAuth } from '../context/AuthContext'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { generatePermalink, decodeResults } from '../utils/permalink'
import { generateCertificate } from '../utils/certificate'

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

/* Share Results — social sharing buttons + Web Share API */
function ShareResults({ results }) {
    const [copied, setCopied] = useState(false)
    const [shareUrl, setShareUrl] = useState('')

    useEffect(() => {
        setShareUrl(generatePermalink(results))
    }, [results])

    const shareText = `I scored ${results.iqScore} on LogIQ — top ${results.percentile}%! Take the test:`

    const handleNativeShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My LogIQ IQ Score',
                    text: shareText,
                    url: shareUrl,
                })
            } catch {
                // User cancelled or share failed — ignore
            }
        }
    }, [shareText, shareUrl])

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            // Fallback: select a hidden input
            const input = document.createElement('input')
            input.value = shareUrl
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        }
    }, [shareUrl])

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`

    const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share

    return (
        <div className="share-results">
            {supportsNativeShare && (
                <button className="share-btn share-btn--native" onClick={handleNativeShare} aria-label="Share results">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Share
                </button>
            )}
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--twitter" aria-label="Share on X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--facebook" aria-label="Share on Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--whatsapp" aria-label="Share on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--linkedin" aria-label="Share on LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            </a>
            <button
                className={`share-btn share-btn--copy ${copied ? 'share-btn--copied' : ''}`}
                onClick={handleCopyLink}
                aria-label={copied ? 'Link copied!' : 'Copy link'}
            >
                {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    )
}

/* Download Certificate button */
function CertificateButton({ results, userName }) {
    const [generating, setGenerating] = useState(false)

    const handleDownload = useCallback(async () => {
        setGenerating(true)
        try {
            await generateCertificate(results, userName)
        } catch (err) {
            console.error('Certificate generation failed:', err)
        }
        setGenerating(false)
    }, [results, userName])

    return (
        <button
            className="cta-button cta-button--certificate"
            onClick={handleDownload}
            disabled={generating}
        >
            {generating ? (
                <>Generating...</>
            ) : (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Certificate
                </>
            )}
        </button>
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
    const { isAuthenticated, user } = useAuth()
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

                    {/* Share & Certificate */}
                    <section className="results-section results-share-section">
                        <h2 className="results-section-title">Share Your Results</h2>
                        <ShareResults results={results} />
                        <div className="results-certificate-row">
                            <CertificateButton results={results} userName={user?.email} />
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

/**
 * SharedResults — read-only view for shared permalink (/results/:id)
 * No retake/navigation buttons, no auth gating.
 */
export function SharedResults() {
    const { id } = useParams()
    const [results, setResults] = useState(null)
    const [error, setError] = useState(false)

    useDocumentHead('Shared Results', 'View shared LogIQ IQ test results.')

    useEffect(() => {
        if (!id) {
            setError(true)
            return
        }
        const decoded = decodeResults(id)
        if (!decoded) {
            setError(true)
            return
        }
        setResults(decoded)
    }, [id])

    if (error) {
        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <Navbar />
                    <main className="results-page results-page--shared" id="main-content">
                        <section className="results-hero">
                            <span className="about-label">Invalid Link</span>
                            <h2 className="teaser-headline" style={{ marginTop: '2rem' }}>
                                This results link is invalid or expired
                            </h2>
                            <p className="teaser-subtext">
                                The shared results link may be corrupted or no longer valid.
                            </p>
                            <div className="results-actions" style={{ opacity: 1, animation: 'none' }}>
                                <Link to="/" className="cta-button">
                                    Take the Test <span className="cta-arrow">→</span>
                                </Link>
                            </div>
                        </section>
                    </main>
                    <Footer />
                </div>
            </>
        )
    }

    if (!results) return null

    const {
        iqScore, percentile, classification, classificationDescriptor,
        rawScore, totalQuestions, categories, difficultyBreakdown,
        totalTime, avgTimePerQuestion, fastestQuestion, slowestQuestion,
        sharedAt,
    } = results

    const sharedDate = sharedAt
        ? new Date(sharedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <Navbar />

                <main className="results-page results-page--shared" id="main-content">
                    {/* Score Hero */}
                    <section className="results-hero">
                        <span className="about-label">Shared Results</span>
                        {sharedDate && (
                            <p className="shared-date">{sharedDate}</p>
                        )}

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
                            Scored higher than <strong><AnimatedNumber target={percentile} duration={2000} suffix="%" /></strong> of test takers
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

                    {/* CTA — take the test */}
                    <div className="shared-results-cta">
                        <p className="shared-cta-text">Think you can do better?</p>
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
