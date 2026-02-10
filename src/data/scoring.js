/**
 * LogIQ Scoring Engine
 *
 * Maps raw scores onto a normal distribution (μ=100, σ=15)
 * to produce IQ estimates and percentile rankings.
 */

import { CATEGORY_LABELS, CATEGORY_COUNT } from './questions'

/**
 * Normal distribution CDF approximation (Abramowitz & Stegun).
 * Used to calculate percentile from z-score.
 */
function normalCDF(z) {
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = z < 0 ? -1 : 1
    const x = Math.abs(z) / Math.sqrt(2)
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return 0.5 * (1.0 + sign * y)
}

/**
 * IQ classification labels
 */
const IQ_CLASSIFICATIONS = [
    { min: 145, label: 'Exceptionally Gifted', descriptor: 'Top 0.1%' },
    { min: 130, label: 'Highly Gifted', descriptor: 'Top 2%' },
    { min: 120, label: 'Superior', descriptor: 'Top 9%' },
    { min: 110, label: 'Above Average', descriptor: 'Top 25%' },
    { min: 90, label: 'Average', descriptor: 'Middle 50%' },
    { min: 80, label: 'Below Average', descriptor: 'Bottom 25%' },
    { min: 70, label: 'Borderline', descriptor: 'Bottom 9%' },
    { min: 0, label: 'Extremely Low', descriptor: 'Bottom 2%' },
]

/**
 * Difficulty weight multipliers.
 * Harder questions are worth more to the weighted score.
 */
const DIFFICULTY_WEIGHTS = {
    1: 1.0,
    2: 1.3,
    3: 1.6,
    4: 2.0,
    5: 2.5,
}

/**
 * Calculate comprehensive results from quiz answers.
 *
 * @param {Array} questions - The questions array (in order presented)
 * @param {Array} answers - User's answers (index-based, -1 = unanswered)
 * @param {number} startTime - Session start timestamp (ms)
 * @param {number} endTime - Session end timestamp (ms)
 * @param {Array} questionTimes - Time spent per question (ms)
 * @returns {Object} Full results object
 */
export function calculateResults(questions, answers, startTime, endTime, questionTimes) {
    const totalQuestions = questions.length

    // --- Raw Score ---
    let correctCount = 0
    let weightedScore = 0
    let maxWeightedScore = 0

    const categoryScores = {}
    const difficultyBreakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } }

    for (let i = 0; i < totalQuestions; i++) {
        const q = questions[i]
        const isCorrect = answers[i] === q.correctAnswer
        const weight = DIFFICULTY_WEIGHTS[q.difficulty] || 1

        maxWeightedScore += weight
        if (isCorrect) {
            correctCount++
            weightedScore += weight
        }

        // Category breakdown
        if (!categoryScores[q.category]) {
            categoryScores[q.category] = { correct: 0, total: 0 }
        }
        categoryScores[q.category].total++
        if (isCorrect) categoryScores[q.category].correct++

        // Difficulty breakdown
        if (q.difficulty <= 2) {
            difficultyBreakdown.easy.total++
            if (isCorrect) difficultyBreakdown.easy.correct++
        } else if (q.difficulty <= 3) {
            difficultyBreakdown.medium.total++
            if (isCorrect) difficultyBreakdown.medium.correct++
        } else {
            difficultyBreakdown.hard.total++
            if (isCorrect) difficultyBreakdown.hard.correct++
        }
    }

    // --- IQ Score Mapping ---
    // Map weighted percentage to IQ bell curve
    const weightedPercentage = weightedScore / maxWeightedScore
    // Use inverse normal approximation: center at 100, SD 15
    // Map raw percentage to z-score (0% → -3σ, 100% → +3σ, 50% → 0)
    const zScore = (weightedPercentage - 0.5) * 6 // maps [0,1] → [-3, +3]
    const iqScore = Math.round(100 + zScore * 15)
    const clampedIQ = Math.max(55, Math.min(145, iqScore))

    // --- Percentile ---
    const percentileZ = (clampedIQ - 100) / 15
    const percentile = Math.round(normalCDF(percentileZ) * 100)

    // --- Classification ---
    const classification = IQ_CLASSIFICATIONS.find(c => clampedIQ >= c.min) || IQ_CLASSIFICATIONS[IQ_CLASSIFICATIONS.length - 1]

    // --- Time Analysis ---
    const totalTime = endTime - startTime
    const avgTimePerQuestion = questionTimes.length > 0
        ? questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length
        : 0
    const fastestQuestion = questionTimes.length > 0 ? Math.min(...questionTimes) : 0
    const slowestQuestion = questionTimes.length > 0 ? Math.max(...questionTimes) : 0

    // --- Per-Category Results ---
    const categories = Object.entries(categoryScores).map(([key, val]) => ({
        key,
        label: CATEGORY_LABELS[key] || key,
        correct: val.correct,
        total: val.total,
        percentage: Math.round((val.correct / val.total) * 100),
    }))

    return {
        iqScore: clampedIQ,
        percentile,
        classification: classification.label,
        classificationDescriptor: classification.descriptor,
        rawScore: correctCount,
        totalQuestions,
        weightedScore: Math.round(weightedScore * 10) / 10,
        maxWeightedScore: Math.round(maxWeightedScore * 10) / 10,
        categories,
        difficultyBreakdown,
        totalTime,
        avgTimePerQuestion: Math.round(avgTimePerQuestion),
        fastestQuestion: Math.round(fastestQuestion),
        slowestQuestion: Math.round(slowestQuestion),
    }
}

export { IQ_CLASSIFICATIONS, DIFFICULTY_WEIGHTS }
