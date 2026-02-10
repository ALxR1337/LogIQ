import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuiz, getSavedSession, clearSavedSession } from '../context/QuizContext'
import { CATEGORY_LABELS } from '../data/questions'
import DotGrid from '../components/DotGrid'
import Modal from '../components/Modal'

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

function QuestionNavigator({ questions, currentIndex, answers, flagged, goToQuestion }) {
    return (
        <div className="question-navigator" role="navigation" aria-label="Question navigator">
            {questions.map((_, i) => {
                let cls = 'nav-dot'
                if (i === currentIndex) cls += ' nav-dot--active'
                if (answers[i] !== -1) cls += ' nav-dot--answered'
                if (flagged[i]) cls += ' nav-dot--flagged'
                const status = i === currentIndex ? ' (current)' :
                    answers[i] !== -1 ? ' (answered)' : ' (unanswered)'
                return (
                    <button
                        key={i}
                        className={cls}
                        onClick={() => goToQuestion(i)}
                        aria-label={`Question ${i + 1}${status}${flagged[i] ? ', flagged' : ''}`}
                        aria-current={i === currentIndex ? 'step' : undefined}
                    >
                        {i + 1}
                    </button>
                )
            })}
        </div>
    )
}

export default function Quiz() {
    const navigate = useNavigate()
    const {
        status, questions, currentIndex, answers, flagged,
        timeRemaining, startQuiz, resumeQuiz, selectAnswer, nextQuestion,
        prevQuestion, goToQuestion, toggleFlag, tick, finishQuiz,
        timerRef, TOTAL_TIME,
    } = useQuiz()

    const [showModal, setShowModal] = useState(false)
    const [showResumeModal, setShowResumeModal] = useState(false)
    const [savedSession, setSavedSession] = useState(null)
    const [showWarning, setShowWarning] = useState(null)
    const questionCardRef = useRef(null)
    const resumeChecked = useRef(false)

    // Check for saved session on mount
    useEffect(() => {
        if (resumeChecked.current) return
        resumeChecked.current = true
        const saved = getSavedSession()
        if (saved && status === 'idle') {
            setSavedSession(saved)
            setShowResumeModal(true)
        } else if (status === 'idle') {
            startQuiz()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Timer tick
    useEffect(() => {
        if (status !== 'active') return
        timerRef.current = setInterval(tick, 1000)
        return () => clearInterval(timerRef.current)
    }, [status, tick, timerRef])

    // Auto-submit on timeout
    useEffect(() => {
        if (status === 'active' && timeRemaining <= 0) {
            finishQuiz()
        }
    }, [status, timeRemaining, finishQuiz])

    // Time warnings
    useEffect(() => {
        if (status !== 'active') return
        const mins = timeRemaining / 1000 / 60
        if (mins <= 1 && showWarning !== '1min') {
            setShowWarning('1min')
            setTimeout(() => setShowWarning(null), 3000)
        } else if (mins <= 5 && mins > 1 && showWarning !== '5min') {
            setShowWarning('5min')
            setTimeout(() => setShowWarning(null), 3000)
        }
    }, [timeRemaining, status, showWarning])

    // Navigate to results when finished
    useEffect(() => {
        if (status === 'finished') {
            navigate('/results')
        }
    }, [status, navigate])

    // Tab close warning
    useEffect(() => {
        if (status !== 'active') return
        const handler = (e) => {
            e.preventDefault()
            e.returnValue = 'You have an active test. Are you sure you want to leave?'
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [status])

    // Focus management on question change
    useEffect(() => {
        if (questionCardRef.current && status === 'active') {
            questionCardRef.current.focus({ preventScroll: true })
        }
    }, [currentIndex, status])

    // Keyboard navigation
    useEffect(() => {
        if (status !== 'active' || showModal) return
        const handler = (e) => {
            // A/B/C/D keys to select options
            const key = e.key.toUpperCase()
            if (['A', 'B', 'C', 'D'].includes(key)) {
                const optionIdx = key.charCodeAt(0) - 65
                if (questions[currentIndex] && optionIdx < questions[currentIndex].options.length) {
                    selectAnswer(optionIdx)
                }
                return
            }
            // Arrow keys for prev/next
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                if (currentIndex < questions.length - 1) nextQuestion()
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                if (currentIndex > 0) prevQuestion()
            }
            // F key to toggle flag
            if (e.key === 'f' || e.key === 'F') {
                toggleFlag()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [status, showModal, currentIndex, questions, selectAnswer, nextQuestion, prevQuestion, toggleFlag])

    const handleSubmit = useCallback(() => {
        setShowModal(true)
    }, [])

    const handleConfirmSubmit = useCallback(() => {
        setShowModal(false)
        finishQuiz()
    }, [finishQuiz])

    const handleResumeQuiz = useCallback(() => {
        setShowResumeModal(false)
        if (savedSession) {
            resumeQuiz(savedSession)
        }
    }, [savedSession, resumeQuiz])

    const handleDiscardSaved = useCallback(() => {
        setShowResumeModal(false)
        clearSavedSession()
        setSavedSession(null)
        startQuiz()
    }, [startQuiz])

    // Show resume modal over the placeholder
    if (showResumeModal && savedSession) {
        const answeredCount = savedSession.answers.filter(a => a !== -1).length
        const totalCount = savedSession.answers.length
        const timeLeftMin = Math.floor(savedSession.timeRemaining / 60000)
        const elapsed = Date.now() - savedSession.savedAt
        const adjustedTimeLeft = Math.max(0, Math.floor((savedSession.timeRemaining - elapsed) / 60000))

        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <main className="quiz-placeholder" id="main-content">
                        <div className="placeholder-icon" aria-hidden="true">◉</div>
                        <p className="placeholder-text">Previous session found</p>
                    </main>
                </div>
                <Modal
                    isOpen={true}
                    onClose={handleDiscardSaved}
                    title="Resume Test?"
                    icon="⏳"
                >
                    <p className="modal-text">
                        You have an unfinished test with <strong>{answeredCount}/{totalCount}</strong> questions answered
                        and approximately <strong>{adjustedTimeLeft} min</strong> remaining.
                    </p>
                    <div className="modal-actions">
                        <button className="modal-btn modal-btn--cancel" onClick={handleDiscardSaved}>
                            Start Fresh
                        </button>
                        <button className="modal-btn modal-btn--confirm" onClick={handleResumeQuiz}>
                            Resume Test
                        </button>
                    </div>
                </Modal>
            </>
        )
    }

    if (status === 'idle' || questions.length === 0) {
        return (
            <>
                <DotGrid />
                <div className="page-wrapper">
                    <main className="quiz-placeholder" id="main-content">
                        <div className="placeholder-icon" aria-hidden="true">◉</div>
                        <p className="placeholder-text">Preparing your test...</p>
                    </main>
                </div>
            </>
        )
    }

    const question = questions[currentIndex]
    const progressPercent = ((currentIndex + 1) / questions.length) * 100
    const timePercent = (timeRemaining / TOTAL_TIME) * 100
    const isLowTime = timeRemaining < 5 * 60 * 1000
    const isCriticalTime = timeRemaining < 60 * 1000
    const unansweredCount = answers.filter(a => a === -1).length

    return (
        <>
            <DotGrid />
            <div className="page-wrapper">
                <div className="quiz-page" id="main-content">
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
                                aria-label="Quiz progress"
                            >
                                <div
                                    className="quiz-progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <div
                            className={`quiz-timer ${isLowTime ? 'quiz-timer--warning' : ''} ${isCriticalTime ? 'quiz-timer--critical' : ''}`}
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

                    {/* Time Warning Toast */}
                    {showWarning && (
                        <div
                            className={`quiz-toast ${showWarning === '1min' ? 'quiz-toast--critical' : ''}`}
                            role="alert"
                            aria-live="assertive"
                        >
                            {showWarning === '5min' ? '⚡ 5 minutes remaining' : '🔥 Less than 1 minute!'}
                        </div>
                    )}

                    {/* Screen reader live region for question changes */}
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

                        {/* Visual content */}
                        <QuestionGrid question={question} />
                        <SequenceDisplay question={question} />

                        {/* Options */}
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
                                aria-label="Submit test"
                            >
                                Submit ✓
                            </button>
                        )}
                    </div>

                    {/* Question Navigator */}
                    <QuestionNavigator
                        questions={questions}
                        currentIndex={currentIndex}
                        answers={answers}
                        flagged={flagged}
                        goToQuestion={goToQuestion}
                    />
                </div>
            </div>

            {/* Confirm Modal — using reusable Modal component */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Submit Test?"
                icon="⚠"
            >
                {unansweredCount > 0 ? (
                    <p className="modal-text">
                        You have <strong>{unansweredCount}</strong> unanswered
                        {unansweredCount === 1 ? ' question' : ' questions'}.
                        Are you sure you want to submit?
                    </p>
                ) : (
                    <p className="modal-text">
                        You've answered all questions. Ready to see your results?
                    </p>
                )}
                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={() => setShowModal(false)}>
                        Go Back
                    </button>
                    <button className="modal-btn modal-btn--confirm" onClick={handleConfirmSubmit}>
                        Submit Test
                    </button>
                </div>
            </Modal>
        </>
    )
}
