import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import { getSessionQuestions, getPracticeQuestions } from '../data/questions'
import { calculateResults } from '../data/scoring'
import { trackQuizStart, trackQuizComplete, trackQuizAbandon, trackQuestionTime } from '../utils/analytics'

const QuizContext = createContext(null)

const TOTAL_TIME = 25 * 60 * 1000 // 25 minutes in ms
const PRACTICE_TIME = 5 * 60 * 1000 // 5 minutes in ms
const SAVE_KEY = 'logiq_quiz_session'
const SAVE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// --- Auto-save helpers ---
function saveSession(state) {
    try {
        const data = {
            questions: state.questions,
            answers: state.answers,
            flagged: state.flagged,
            currentIndex: state.currentIndex,
            timeRemaining: state.timeRemaining,
            startTime: state.startTime,
            questionTimes: state.questionTimes,
            questionStartTimes: state.questionStartTimes,
            savedAt: Date.now(),
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch { /* ignore quota errors */ }
}

export function getSavedSession() {
    try {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return null
        const data = JSON.parse(raw)
        // Check expiry
        if (Date.now() - data.savedAt > SAVE_EXPIRY) {
            localStorage.removeItem(SAVE_KEY)
            return null
        }
        return data
    } catch {
        return null
    }
}

export function clearSavedSession() {
    localStorage.removeItem(SAVE_KEY)
}

const initialState = {
    status: 'idle', // idle | active | finished
    mode: 'full', // full | practice
    questions: [],
    currentIndex: 0,
    answers: [],
    flagged: [],
    startTime: null,
    endTime: null,
    questionStartTimes: [],
    questionTimes: [],
    timeRemaining: TOTAL_TIME,
    results: null,
}

function quizReducer(state, action) {
    switch (action.type) {
        case 'START_QUIZ': {
            const questions = getSessionQuestions()
            return {
                ...initialState,
                status: 'active',
                mode: 'full',
                questions,
                answers: new Array(questions.length).fill(-1),
                flagged: new Array(questions.length).fill(false),
                questionStartTimes: new Array(questions.length).fill(0),
                questionTimes: new Array(questions.length).fill(0),
                startTime: Date.now(),
                timeRemaining: TOTAL_TIME,
            }
        }

        case 'START_PRACTICE': {
            const questions = getPracticeQuestions()
            return {
                ...initialState,
                status: 'active',
                mode: 'practice',
                questions,
                answers: new Array(questions.length).fill(-1),
                flagged: new Array(questions.length).fill(false),
                questionStartTimes: new Array(questions.length).fill(0),
                questionTimes: new Array(questions.length).fill(0),
                startTime: Date.now(),
                timeRemaining: PRACTICE_TIME,
            }
        }

        case 'RESUME_QUIZ': {
            const saved = action.savedSession
            const elapsed = Date.now() - saved.savedAt
            const adjustedRemaining = Math.max(0, saved.timeRemaining - elapsed)
            return {
                ...initialState,
                status: 'active',
                mode: 'full',
                questions: saved.questions,
                answers: saved.answers,
                flagged: saved.flagged,
                currentIndex: saved.currentIndex,
                startTime: Date.now() - (TOTAL_TIME - adjustedRemaining),
                questionStartTimes: saved.questionStartTimes.map(() => 0),
                questionTimes: saved.questionTimes,
                timeRemaining: adjustedRemaining,
            }
        }

        case 'SELECT_ANSWER':
            return {
                ...state,
                answers: state.answers.map((a, i) =>
                    i === state.currentIndex ? action.answerIndex : a
                ),
            }

        case 'NEXT_QUESTION': {
            const now = Date.now()
            const newTimes = [...state.questionTimes]
            newTimes[state.currentIndex] = (newTimes[state.currentIndex] || 0) + (now - (state.questionStartTimes[state.currentIndex] || now))
            const newStarts = [...state.questionStartTimes]
            const nextIdx = Math.min(state.currentIndex + 1, state.questions.length - 1)
            newStarts[nextIdx] = now
            return {
                ...state,
                currentIndex: nextIdx,
                questionTimes: newTimes,
                questionStartTimes: newStarts,
            }
        }

        case 'PREV_QUESTION': {
            const now = Date.now()
            const newTimes = [...state.questionTimes]
            newTimes[state.currentIndex] = (newTimes[state.currentIndex] || 0) + (now - (state.questionStartTimes[state.currentIndex] || now))
            const newStarts = [...state.questionStartTimes]
            const prevIdx = Math.max(state.currentIndex - 1, 0)
            newStarts[prevIdx] = now
            return {
                ...state,
                currentIndex: prevIdx,
                questionTimes: newTimes,
                questionStartTimes: newStarts,
            }
        }

        case 'GO_TO_QUESTION': {
            const now = Date.now()
            const newTimes = [...state.questionTimes]
            newTimes[state.currentIndex] = (newTimes[state.currentIndex] || 0) + (now - (state.questionStartTimes[state.currentIndex] || now))
            const newStarts = [...state.questionStartTimes]
            newStarts[action.index] = now
            return {
                ...state,
                currentIndex: action.index,
                questionTimes: newTimes,
                questionStartTimes: newStarts,
            }
        }

        case 'TOGGLE_FLAG':
            return {
                ...state,
                flagged: state.flagged.map((f, i) =>
                    i === state.currentIndex ? !f : f
                ),
            }

        case 'TICK': {
            const totalForMode = state.mode === 'practice' ? PRACTICE_TIME : TOTAL_TIME
            return {
                ...state,
                timeRemaining: Math.max(0, totalForMode - (Date.now() - state.startTime)),
            }
        }

        case 'FINISH_QUIZ': {
            const now = Date.now()
            const finalTimes = [...state.questionTimes]
            finalTimes[state.currentIndex] = (finalTimes[state.currentIndex] || 0) + (now - (state.questionStartTimes[state.currentIndex] || now))
            if (state.mode === 'practice') {
                // Practice mode: simple correct/incorrect tally, no IQ scoring
                const practiceResults = []
                for (let i = 0; i < state.questions.length; i++) {
                    practiceResults.push({
                        question: state.questions[i],
                        userAnswer: state.answers[i],
                        isCorrect: state.answers[i] === state.questions[i].correctAnswer,
                    })
                }
                return {
                    ...state,
                    status: 'finished',
                    endTime: now,
                    questionTimes: finalTimes,
                    results: { practiceResults, correctCount: practiceResults.filter(r => r.isCorrect).length, totalQuestions: state.questions.length },
                }
            }
            const results = calculateResults(
                state.questions,
                state.answers,
                state.startTime,
                now,
                finalTimes,
            )
            return {
                ...state,
                status: 'finished',
                endTime: now,
                questionTimes: finalTimes,
                results,
            }
        }

        case 'RESET':
            return { ...initialState }

        default:
            return state
    }
}

export function QuizProvider({ children }) {
    const [state, dispatch] = useReducer(quizReducer, initialState)
    const timerRef = useRef(null)
    const stateRef = useRef(state)
    stateRef.current = state

    // --- Auto-save: persist full quiz state on every meaningful change ---
    useEffect(() => {
        if (state.status === 'active' && state.mode === 'full') {
            saveSession(state)
        }
        // Clear saved session on finish or reset
        if (state.status === 'finished' || state.status === 'idle') {
            clearSavedSession()
        }
    }, [state.status, state.mode, state.answers, state.flagged, state.currentIndex, state.timeRemaining])

    const startQuiz = useCallback(() => {
        clearSavedSession()
        dispatch({ type: 'START_QUIZ' })
        trackQuizStart('full')
        // Start the first question timer
        setTimeout(() => {
            dispatch({ type: 'GO_TO_QUESTION', index: 0 })
        }, 0)
    }, [])

    const startPractice = useCallback(() => {
        dispatch({ type: 'START_PRACTICE' })
        trackQuizStart('practice')
        setTimeout(() => {
            dispatch({ type: 'GO_TO_QUESTION', index: 0 })
        }, 0)
    }, [])

    const resumeQuiz = useCallback((savedSession) => {
        clearSavedSession()
        dispatch({ type: 'RESUME_QUIZ', savedSession })
        setTimeout(() => {
            dispatch({ type: 'GO_TO_QUESTION', index: savedSession.currentIndex })
        }, 0)
    }, [])

    const selectAnswer = useCallback((answerIndex) => {
        dispatch({ type: 'SELECT_ANSWER', answerIndex })
    }, [])

    const nextQuestion = useCallback(() => {
        dispatch({ type: 'NEXT_QUESTION' })
    }, [])

    const prevQuestion = useCallback(() => {
        dispatch({ type: 'PREV_QUESTION' })
    }, [])

    const goToQuestion = useCallback((index) => {
        dispatch({ type: 'GO_TO_QUESTION', index })
    }, [])

    const toggleFlag = useCallback(() => {
        dispatch({ type: 'TOGGLE_FLAG' })
    }, [])

    const tick = useCallback(() => {
        dispatch({ type: 'TICK' })
    }, [])

    const finishQuiz = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        clearSavedSession()

        // Track per-question times before finishing
        const currentState = stateRef.current
        if (currentState.status === 'active') {
            const now = Date.now()
            const finalTimes = [...currentState.questionTimes]
            finalTimes[currentState.currentIndex] =
                (finalTimes[currentState.currentIndex] || 0) +
                (now - (currentState.questionStartTimes[currentState.currentIndex] || now))
            finalTimes.forEach((t, i) => {
                if (t > 0) trackQuestionTime(i, t)
            })
        }

        dispatch({ type: 'FINISH_QUIZ' })
    }, [])

    // Track completion after state updates to 'finished'
    const prevStatusRef = useRef(state.status)
    useEffect(() => {
        if (prevStatusRef.current === 'active' && state.status === 'finished' && state.results) {
            const timeSpent = state.endTime - (state.startTime || state.endTime)
            if (state.mode === 'full' && state.results.iqScore != null) {
                trackQuizComplete('full', state.results.iqScore, state.results.totalQuestions, timeSpent)
            } else if (state.mode === 'practice') {
                trackQuizComplete('practice', null, state.results.totalQuestions, timeSpent)
            }
        }
        prevStatusRef.current = state.status
    }, [state.status, state.results, state.mode, state.endTime, state.startTime])

    const resetQuiz = useCallback(() => {
        // If resetting from an active quiz, track as abandonment
        const currentState = stateRef.current
        if (currentState.status === 'active') {
            trackQuizAbandon(currentState.mode, currentState.currentIndex, currentState.questions.length)
        }
        if (timerRef.current) clearInterval(timerRef.current)
        clearSavedSession()
        dispatch({ type: 'RESET' })
    }, [])

    const value = {
        ...state,
        startQuiz,
        startPractice,
        resumeQuiz,
        selectAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        toggleFlag,
        tick,
        finishQuiz,
        resetQuiz,
        timerRef,
        TOTAL_TIME,
        PRACTICE_TIME,
    }

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    )
}

export function useQuiz() {
    const ctx = useContext(QuizContext)
    if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
    return ctx
}

export default QuizContext
