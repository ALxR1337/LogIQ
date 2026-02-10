/**
 * LogIQ — Lightweight Client-Side Analytics
 *
 * Tracks quiz engagement metrics entirely in localStorage.
 * No external services, no PII collection, zero network requests.
 *
 * Tracked metrics:
 *   - Test completion rate (starts vs completions)
 *   - Average IQ score across completed tests
 *   - Drop-off question (where users abandon the test)
 *   - Time spent per question (averaged across sessions)
 */

const ANALYTICS_KEY = 'logiq_analytics'
const MAX_EVENTS = 1000

// --- Internal helpers ---

function getEvents() {
    try {
        const raw = localStorage.getItem(ANALYTICS_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveEvents(events) {
    try {
        // Cap storage to prevent localStorage bloat — keep most recent events
        const capped = events.slice(-MAX_EVENTS)
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(capped))
    } catch { /* ignore quota errors */ }
}

function pushEvent(type, data = {}) {
    const events = getEvents()
    events.push({ type, data, ts: Date.now() })
    saveEvents(events)
}

// --- Event Tracking API ---

/** Track when a user starts a quiz */
export function trackQuizStart(mode = 'full') {
    pushEvent('quiz_start', { mode })
}

/** Track quiz completion with final score data */
export function trackQuizComplete(mode, iqScore, totalQuestions, timeSpentMs) {
    pushEvent('quiz_complete', { mode, iqScore, totalQuestions, timeSpentMs })
}

/** Track when a user abandons the quiz before finishing */
export function trackQuizAbandon(mode, lastQuestionIndex, totalQuestions) {
    pushEvent('quiz_abandon', { mode, lastQuestionIndex, totalQuestions })
}

/** Track time spent on a specific question */
export function trackQuestionTime(questionIndex, timeSpentMs) {
    pushEvent('question_time', { questionIndex, timeSpentMs })
}

// --- Aggregation & Reporting ---

/**
 * Compute a summary of all tracked analytics data.
 * @returns {Object} Summary object with completion rate, avg score, drop-off, etc.
 */
export function getAnalyticsSummary() {
    const events = getEvents()

    const fullStarts = events.filter(e => e.type === 'quiz_start' && e.data.mode === 'full')
    const fullCompletions = events.filter(e => e.type === 'quiz_complete' && e.data.mode === 'full')
    const fullAbandons = events.filter(e => e.type === 'quiz_abandon' && e.data.mode === 'full')
    const questionTimes = events.filter(e => e.type === 'question_time')

    // 1. Test completion rate
    const completionRate = fullStarts.length > 0
        ? Math.round((fullCompletions.length / fullStarts.length) * 100)
        : 0

    // 2. Average IQ score
    const avgScore = fullCompletions.length > 0
        ? Math.round(
            fullCompletions.reduce((sum, e) => sum + (e.data.iqScore || 0), 0) / fullCompletions.length
        )
        : null

    // 3. Drop-off question — which question index users abandon at most frequently
    const dropOffMap = {}
    fullAbandons.forEach(e => {
        const idx = e.data.lastQuestionIndex
        dropOffMap[idx] = (dropOffMap[idx] || 0) + 1
    })
    const dropOffQuestion = Object.keys(dropOffMap).length > 0
        ? Number(Object.entries(dropOffMap).sort((a, b) => b[1] - a[1])[0][0])
        : null

    // 4. Average time per question (across all sessions)
    const timeByQuestion = {}
    questionTimes.forEach(e => {
        const idx = e.data.questionIndex
        if (!timeByQuestion[idx]) timeByQuestion[idx] = []
        timeByQuestion[idx].push(e.data.timeSpentMs)
    })
    const avgTimePerQuestion = Object.entries(timeByQuestion)
        .map(([idx, times]) => ({
            questionIndex: Number(idx),
            avgTimeMs: Math.round(times.reduce((s, t) => s + t, 0) / times.length),
            samples: times.length,
        }))
        .sort((a, b) => a.questionIndex - b.questionIndex)

    return {
        totalStarts: fullStarts.length,
        totalCompletions: fullCompletions.length,
        completionRate,
        avgScore,
        dropOffQuestion,
        dropOffCounts: dropOffMap,
        avgTimePerQuestion,
        totalEvents: events.length,
    }
}

/** Clear all analytics data */
export function clearAnalytics() {
    localStorage.removeItem(ANALYTICS_KEY)
}
