import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuiz } from '../context/QuizContext'
import { CATEGORY_LABELS } from '../data/questions'
import DotGrid from '../components/DotGrid'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import { useDocumentHead } from '../hooks/useDocumentHead'

function formatTime(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000))
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function QuestionGrid({ question }) {
    if (!question.grid) return null
    return (
        <div className="question-grid-container" role="img" aria-label="Pattern grid puzzle">
            <div
                className="question-grid"
                style={{ gridTemplateColumns: `repeat(${question.grid[0].length}, 1fr)` }}
            >
                {question.grid.flat().map((cell, i) => (
                    <div
                        key={i}
                        className={`grid-cell ${cell === '?' ? 'grid-cell--missing' : ''}`}
                        aria-label={cell === '?' ? 'Missing cell' : cell}
                    >
                        {cell}
                    </div>
                ))}
            </div>
        </div>
    )
}

function SequenceDisplay({ question }) {
    if (!question.sequence) return null
    return (
        <div className="sequence-display" role="img" aria-label="Number sequence puzzle">
            {question.sequence.map((item, i) => (
                <span
                    key={i}
                    className={`sequence-item ${item === '?' ? 'sequence-item--missing' : ''}`}
                    aria-label={item === '?' ? 'Missing item' : String(item)}
                >
                    {item}
                </span>
            ))}
        </div>
    )
}

/* Practice Results — simplified view */
function PracticeResults({ results, onContinue, onHome, onRetry }) {
    const { correctCount, totalQuestions, practiceResults } = results

    return (
        <div className="practice-results">
            <span className="about-label">Practice Complete</span>

            <div className="practice-score-display">
                <div className="practice-score-number">
                    {correctCount}<span className="practice-score-sep">/</span>{totalQuestions}
                </div>
                <div className="practice-score-label">Correct Answers</div>
            </div>

            <div className="practice-breakdown">
                {practiceResults.map((r, i) => (
                    <div key={i} className={`practice-result-row ${r.isCorrect ? 'practice-result-row--correct' : 'practice-result-row--wrong'}`}>
                        <span className="practice-result-icon" aria-hidden="true">
                            {r.isCorrect ? '✓' : '✗'}
                        </span>
                        <span className="practice-result-category">
                            {CATEGORY_LABELS[r.question.category]}
                        </span>
                        <span className="practice-result-status">
                            {r.isCorrect ? 'Correct' : `Answer: ${r.question.options[r.question.correctAnswer]}`}
                        </span>
                    </div>
                ))}
            </div>

            <div className="practice-actions">
                <button className="cta-button" onClick={onContinue}>
                    Take Full Test <span className="cta-arrow">→</span>
                </button>
                <button className="cta-button cta-button--secondary" onClick={onRetry}>
                    ↻ Try Again
                </button>
                <Link to="/" className="cta-button cta-button--secondary" onClick={onHome}>
                    ← Back to Home
                </Link>
            </div>
        </div>
    )
}

export default function Practice() {
    useDocumentHead('Practice Mode', 'Try a quick 5-question demo of the LogIQ IQ test. One question from each cognitive domain, 5-minute timer.')
    const navigate = useNavigate()
    const {
        status, mode, questions, currentIndex, answers, flagged,
        timeRemaining, startPractice, selectAnswer, nextQuestion,
        prevQuestion, goToQuestion, toggleFlag, tick, finishQuiz,
        resetQuiz, results, timerRef, PRACTICE_TIME,
    } = useQuiz()

    const [showModal, setShowModal] = useState(false)
    const questionCardRef = useRef(null)

    // Start practice on mount if not active
    useEffect(() => {
        if (status === 'idle' || mode !== 'practice') {
            startPractice()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Timer tick
    useEffect(() => {
        if (status !== 'active' || mode !== 'practice') return
        timerRef.current = setInterval(tick, 1000)
        return () => clearInterval(timerRef.current)
    }, [status, mode, tick, timerRef])

    // Auto-submit on timeout
    useEffect(() => {
        if (status === 'active' && mode === 'practice' && timeRemaining <= 0) {
            finishQuiz()
        }
    }, [status, mode, timeRemaining, finishQuiz])

    // Focus management on question change
    useEffect(() => {
        if (questionCardRef.current && status === 'active') {
            questionCardRef.current.focus({ preventScroll: true })
        }
    }, [currentIndex, status])

    // Keyboard navigation
    useEffect(() => {
        if (status !== 'active' || mode !== 'practice' || showModal) return
        const handler = (e) => {
            const key = e.key.toUpperCase()
            if (['A', 'B', 'C', 'D'].includes(key)) {
                const optionIdx = key.charCodeAt(0) - 65
                if (questions[currentIndex] && optionIdx < questions[currentIndex].options.length) {
                    selectAnswer(optionIdx)
                }
                return
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                if (currentIndex < questions.length - 1) nextQuestion()
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                if (currentIndex > 0) prevQuestion()
            }
            if (e.key === 'f' || e.key === 'F') {
                toggleFlag()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [status, mode, showModal, currentIndex, questions, selectAnswer, nextQuestion, prevQuestion, toggleFlag])

    const handleSubmit = useCallback(() => {
        setShowModal(true)
    }, [])

    const handleConfirmSubmit = useCallback(() => {
        setShowModal(false)
        finishQuiz()
    }, [finishQuiz])

    const handleContinueToFull = useCallback(() => {
        resetQuiz()
        navigate('/test')
    }, [resetQuiz, navigate])

    const handleRetry = useCallback(() => {
        resetQuiz()
        // Small delay so state resets before startPractice runs
        setTimeout(() => {
            startPractice()
        }, 50)
    }, [resetQuiz, startPractice])

    const handleHome = useCallback(() => {
        resetQuiz()
    }, [resetQuiz])

    // Show results if finished in practice mode
    if (status === 'finished' && mode === 'practice' && results) {
        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <Navbar />
                    <main className="practice-page" id="main-content">
                        <PracticeResults
                            results={results}
                            onContinue={handleContinueToFull}
                            onHome={handleHome}
                            onRetry={handleRetry}
                        />
                    </main>
                    <Footer />
                </div>
            </>
        )
    }

    if (status === 'idle' || questions.length === 0 || mode !== 'practice') {
        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <main className="quiz-placeholder" id="main-content">
                        <div className="placeholder-icon" aria-hidden="true">◉</div>
                        <p className="placeholder-text">Preparing practice mode...</p>
                    </main>
                </div>
            </>
        )
    }

    const question = questions[currentIndex]
    const progressPercent = ((currentIndex + 1) / questions.length) * 100
    const timePercent = (timeRemaining / PRACTICE_TIME) * 100
    const isLowTime = timeRemaining < 60 * 1000
    const unansweredCount = answers.filter(a => a === -1).length

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <div className="quiz-page practice-mode" id="main-content">
                    {/* Practice Mode Badge */}
                    <div className="practice-badge">
                        <span className="practice-badge-dot" aria-hidden="true" />
                        Practice Mode
                    </div>

                    {/* Top Bar */}
                    <header className="quiz-header">
                        <div className="quiz-progress-section">
                            <span className="quiz-counter" aria-label={`Question ${currentIndex + 1} of ${questions.length}`}>
                                <span className="quiz-counter-current">{currentIndex + 1}</span>
                                <span className="quiz-counter-sep" aria-hidden="true">/</span>
                                <span className="quiz-counter-total">{questions.length}</span>
                            </span>
                            <div
                                className="quiz-progress-bar"
                                role="progressbar"
                                aria-valuenow={currentIndex + 1}
                                aria-valuemin={1}
                                aria-valuemax={questions.length}
                                aria-label="Practice progress"
                            >
                                <div
                                    className="quiz-progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div
                            className={`quiz-timer ${isLowTime ? 'quiz-timer--critical' : ''}`}
                            aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
                        >
                            <span className="timer-icon" aria-hidden="true">⏱</span>
                            <span className="timer-value">{formatTime(timeRemaining)}</span>
                            <div className="timer-bar" aria-hidden="true">
                                <div
                                    className="timer-bar-fill"
                                    style={{ width: `${timePercent}%` }}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Screen reader live region */}
                    <div className="sr-only" aria-live="polite" aria-atomic="true">
                        Question {currentIndex + 1} of {questions.length}: {question.question}
                    </div>

                    {/* Category Label */}
                    <div className="quiz-category-label">
                        {CATEGORY_LABELS[question.category]}
                        <span className="quiz-difficulty" aria-label={`Difficulty ${question.difficulty} out of 5`}>
                            {'●'.repeat(question.difficulty)}
                            {'○'.repeat(5 - question.difficulty)}
                        </span>
                    </div>

                    {/* Question Card */}
                    <div
                        className="question-card"
                        key={question.id}
                        ref={questionCardRef}
                        tabIndex={-1}
                        aria-label={`Question ${currentIndex + 1}`}
                    >
                        <h2 className="question-text">{question.question}</h2>

                        <QuestionGrid question={question} />
                        <SequenceDisplay question={question} />

                        <div className="options-grid" role="radiogroup" aria-label="Answer options">
                            {question.options.map((option, i) => (
                                <button
                                    key={i}
                                    className={`option-button ${answers[currentIndex] === i ? 'option-button--selected' : ''}`}
                                    onClick={() => selectAnswer(i)}
                                    role="radio"
                                    aria-checked={answers[currentIndex] === i}
                                    aria-label={`Option ${String.fromCharCode(65 + i)}: ${option}`}
                                >
                                    <span className="option-letter" aria-hidden="true">
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="quiz-controls">
                        <button
                            className="quiz-btn quiz-btn--secondary"
                            onClick={prevQuestion}
                            disabled={currentIndex === 0}
                            aria-label="Previous question"
                        >
                            ← Prev
                        </button>

                        <div className="quiz-controls-center">
                            <button
                                className={`quiz-btn quiz-btn--flag ${flagged[currentIndex] ? 'quiz-btn--flag-active' : ''}`}
                                onClick={toggleFlag}
                                aria-label={flagged[currentIndex] ? 'Unflag this question' : 'Flag for review'}
                                aria-pressed={flagged[currentIndex]}
                            >
                                {flagged[currentIndex] ? '⚑' : '⚐'}
                            </button>
                        </div>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                className="quiz-btn quiz-btn--primary"
                                onClick={nextQuestion}
                                aria-label="Next question"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                className="quiz-btn quiz-btn--submit"
                                onClick={handleSubmit}
                                aria-label="Submit practice"
                            >
                                Submit ✓
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Submit Practice?"
                icon="◎"
            >
                {unansweredCount > 0 ? (
                    <p className="modal-text">
                        You have <strong>{unansweredCount}</strong> unanswered
                        {unansweredCount === 1 ? ' question' : ' questions'}.
                        Submit anyway?
                    </p>
                ) : (
                    <p className="modal-text">
                        You've answered all questions. Ready to see how you did?
                    </p>
                )}
                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={() => setShowModal(false)}>
                        Go Back
                    </button>
                    <button className="modal-btn modal-btn--confirm" onClick={handleConfirmSubmit}>
                        See Results
                    </button>
                </div>
            </Modal>
        </>
    )
}
