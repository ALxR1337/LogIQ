/**
 * LogIQ Question Bank
 *
 * 30 questions across 5 cognitive domains (6 per domain):
 * - pattern-recognition: Visual matrix/grid pattern completion
 * - sequence-completion: Number, letter, or shape sequences
 * - logical-deduction: Verbal/abstract logic puzzles
 * - spatial-reasoning: Mental rotation, reflection, folding
 * - analogies: Relational reasoning ("A is to B as C is to ?")
 *
 * Each question uses text-based rendering with symbols/shapes
 * that can be displayed directly in the browser.
 *
 * Difficulty: 1 (easy) → 5 (hard), scaling within each category.
 */

const questions = [
    // ============================================================
    //  PATTERN RECOGNITION (6 questions) — IDs 1-6
    // ============================================================
    {
        id: 1,
        category: 'pattern-recognition',
        difficulty: 1,
        question: 'Which shape completes the pattern?',
        grid: [
            ['●', '▲', '■'],
            ['▲', '■', '●'],
            ['■', '●', '?'],
        ],
        options: ['■', '▲', '●', '◆'],
        correctAnswer: 2, // ▲
    },
    {
        id: 2,
        category: 'pattern-recognition',
        difficulty: 2,
        question: 'Which shape completes the 3×3 grid?',
        grid: [
            ['◆', '◆', '●'],
            ['◆', '●', '●'],
            ['●', '●', '?'],
        ],
        options: ['◆', '●', '▲', '■'],
        correctAnswer: 1, // ●
    },
    {
        id: 3,
        category: 'pattern-recognition',
        difficulty: 2,
        question: 'Each row and column contains unique shapes. What replaces the "?"',
        grid: [
            ['▲', '■', '●', '◆'],
            ['●', '◆', '▲', '■'],
            ['◆', '●', '■', '▲'],
            ['■', '▲', '?', '●'],
        ],
        options: ['■', '◆', '▲', '●'],
        correctAnswer: 1, // ◆
    },
    {
        id: 4,
        category: 'pattern-recognition',
        difficulty: 3,
        question: 'The pattern follows a rule. What fills the missing cell?',
        grid: [
            ['●●', '●', '●●●'],
            ['●●●', '●●', '●'],
            ['●', '●●●', '?'],
        ],
        options: ['●', '●●', '●●●', '●●●●'],
        correctAnswer: 1, // ●●
    },
    {
        id: 5,
        category: 'pattern-recognition',
        difficulty: 4,
        question: 'Each row transforms by a rule. What completes the final row?',
        grid: [
            ['▲', '▲▲', '▲▲▲'],
            ['■', '■■', '■■■'],
            ['●', '●●', '?'],
        ],
        options: ['●', '●●', '●●●', '●●●●'],
        correctAnswer: 2, // ●●●
    },
    {
        id: 6,
        category: 'pattern-recognition',
        difficulty: 5,
        question: 'The grid follows two simultaneous rules (row + column). What goes in "?"',
        grid: [
            ['▲●', '▲■', '▲◆'],
            ['■●', '■■', '■◆'],
            ['◆●', '◆■', '?'],
        ],
        options: ['◆▲', '◆◆', '●◆', '■●'],
        correctAnswer: 1, // ◆◆
    },

    // ============================================================
    //  SEQUENCE COMPLETION (6 questions) — IDs 7-12
    // ============================================================
    {
        id: 7,
        category: 'sequence-completion',
        difficulty: 1,
        question: 'What number comes next in the sequence?',
        sequence: ['2', '4', '6', '8', '?'],
        options: ['9', '10', '12', '16'],
        correctAnswer: 1, // 10
    },
    {
        id: 8,
        category: 'sequence-completion',
        difficulty: 2,
        question: 'What comes next?',
        sequence: ['1', '1', '2', '3', '5', '8', '?'],
        options: ['11', '12', '13', '15'],
        correctAnswer: 2, // 13
    },
    {
        id: 9,
        category: 'sequence-completion',
        difficulty: 2,
        question: 'What letter comes next?',
        sequence: ['A', 'C', 'E', 'G', '?'],
        options: ['H', 'I', 'J', 'K'],
        correctAnswer: 1, // I
    },
    {
        id: 10,
        category: 'sequence-completion',
        difficulty: 3,
        question: 'What comes next in this sequence?',
        sequence: ['3', '6', '12', '24', '?'],
        options: ['36', '48', '30', '42'],
        correctAnswer: 1, // 48
    },
    {
        id: 11,
        category: 'sequence-completion',
        difficulty: 4,
        question: 'Find the next term.',
        sequence: ['1', '4', '9', '16', '25', '?'],
        options: ['30', '36', '49', '32'],
        correctAnswer: 1, // 36
    },
    {
        id: 12,
        category: 'sequence-completion',
        difficulty: 5,
        question: 'What number continues this pattern?',
        sequence: ['2', '3', '5', '7', '11', '13', '?'],
        options: ['15', '17', '19', '14'],
        correctAnswer: 1, // 17 (primes)
    },

    // ============================================================
    //  LOGICAL DEDUCTION (6 questions) — IDs 13-18
    // ============================================================
    {
        id: 13,
        category: 'logical-deduction',
        difficulty: 1,
        question: 'All roses are flowers. Some flowers fade quickly. Which statement MUST be true?',
        options: [
            'All roses fade quickly',
            'Some roses are flowers',
            'No roses fade quickly',
            'Flowers are roses',
        ],
        correctAnswer: 1, // Some roses are flowers
    },
    {
        id: 14,
        category: 'logical-deduction',
        difficulty: 2,
        question: 'If it rains, the ground is wet. The ground is not wet. What can you conclude?',
        options: [
            'It rained',
            'It did not rain',
            'The ground is dry only inside',
            'Nothing can be concluded',
        ],
        correctAnswer: 1, // It did not rain (modus tollens)
    },
    {
        id: 15,
        category: 'logical-deduction',
        difficulty: 3,
        question: 'A is taller than B. C is shorter than B. D is taller than A. Who is the shortest?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2, // C
    },
    {
        id: 16,
        category: 'logical-deduction',
        difficulty: 3,
        question: 'All engineers are problem-solvers. No poets are engineers. Which MUST be true?',
        options: [
            'No poets are problem-solvers',
            'Some problem-solvers are not poets',
            'All problem-solvers are engineers',
            'Poets cannot solve problems',
        ],
        correctAnswer: 1, // Some problem-solvers are not poets
    },
    {
        id: 17,
        category: 'logical-deduction',
        difficulty: 4,
        question: 'In a row of 5 houses, the red house is immediately left of the green house. The blue house is at one end. The yellow house is next to the blue house. Where is the white house?',
        options: [
            'Position 1',
            'Position 3',
            'Position 5',
            'Cannot be determined',
        ],
        correctAnswer: 1, // Position 3 (Blue-Yellow-White-Red-Green or reversed logic)
    },
    {
        id: 18,
        category: 'logical-deduction',
        difficulty: 5,
        question: 'If no X are Y, and all Y are Z, which MUST be true?',
        options: [
            'No X are Z',
            'Some Z are not X',
            'All Z are Y',
            'All X are Z',
        ],
        correctAnswer: 1, // Some Z are not X
    },

    // ============================================================
    //  SPATIAL REASONING (6 questions) — IDs 19-24
    // ============================================================
    {
        id: 19,
        category: 'spatial-reasoning',
        difficulty: 1,
        question: 'If you rotate "▶" 90° clockwise, what do you get?',
        options: ['▲', '▼', '◀', '▶'],
        correctAnswer: 1, // ▼
    },
    {
        id: 20,
        category: 'spatial-reasoning',
        difficulty: 2,
        question: 'Which is the mirror image of "bq" reflected horizontally?',
        options: ['qb', 'dp', 'bd', 'pq'],
        correctAnswer: 1, // dp
    },
    {
        id: 21,
        category: 'spatial-reasoning',
        difficulty: 2,
        question: 'If you fold a square piece of paper in half and punch a hole in the center of the fold, how many holes appear when unfolded?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1, // 2
    },
    {
        id: 22,
        category: 'spatial-reasoning',
        difficulty: 3,
        question: 'A cube has a different symbol on each face: ●, ■, ▲, ◆, ★, ○. If ● is on top and ■ faces you, ▲ is to the right. What is on the bottom?',
        options: ['○', '◆', '★', '▲'],
        correctAnswer: 0, // ○
    },
    {
        id: 23,
        category: 'spatial-reasoning',
        difficulty: 4,
        question: 'How many cubes are in this 3D staircase? Row 1: 1 cube. Row 2: 2 cubes stacked + 1. Row 3: 3 stacked + 2 stacked + 1.',
        options: ['6', '9', '10', '12'],
        correctAnswer: 2, // 10 (1 + 3 + 6)
    },
    {
        id: 24,
        category: 'spatial-reasoning',
        difficulty: 5,
        question: 'A shape is rotated 270° counterclockwise, then reflected over the vertical axis. This is equivalent to:',
        options: [
            'Rotating 90° clockwise then reflecting vertically',
            'Reflecting horizontally only',
            'Rotating 90° clockwise then reflecting horizontally',
            'Rotating 90° counterclockwise only',
        ],
        correctAnswer: 2, // Rotating 90° CW then reflecting horizontally
    },

    // ============================================================
    //  ANALOGIES (6 questions) — IDs 25-30
    // ============================================================
    {
        id: 25,
        category: 'analogies',
        difficulty: 1,
        question: 'Hand is to Glove as Foot is to ___?',
        options: ['Shoe', 'Leg', 'Toe', 'Ankle'],
        correctAnswer: 0, // Shoe
    },
    {
        id: 26,
        category: 'analogies',
        difficulty: 2,
        question: 'Author is to Book as Composer is to ___?',
        options: ['Music', 'Symphony', 'Instrument', 'Orchestra'],
        correctAnswer: 1, // Symphony
    },
    {
        id: 27,
        category: 'analogies',
        difficulty: 2,
        question: '▲ is to △ as ■ is to ___?',
        options: ['□', '◆', '○', '●'],
        correctAnswer: 0, // □ (filled to unfilled)
    },
    {
        id: 28,
        category: 'analogies',
        difficulty: 3,
        question: 'Telescope is to Stars as Microscope is to ___?',
        options: ['Laboratory', 'Cells', 'Lens', 'Science'],
        correctAnswer: 1, // Cells
    },
    {
        id: 29,
        category: 'analogies',
        difficulty: 4,
        question: 'Velocity is to Speed as Displacement is to ___?',
        options: ['Distance', 'Acceleration', 'Direction', 'Position'],
        correctAnswer: 0, // Distance (vector to scalar)
    },
    {
        id: 30,
        category: 'analogies',
        difficulty: 5,
        question: 'Entropy is to Order as Inflation is to ___?',
        options: [
            'Purchasing Power',
            'Money Supply',
            'Interest Rate',
            'Economic Growth',
        ],
        correctAnswer: 0, // Purchasing Power (inverse relationship)
    },
]

/**
 * Shuffle questions using Fisher-Yates algorithm.
 * Returns a new shuffled array (does not mutate input).
 */
export function shuffleQuestions(qs) {
    const shuffled = [...qs]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

/**
 * Get questions sorted by difficulty (easy → hard).
 */
export function getQuestionsByDifficulty() {
    return [...questions].sort((a, b) => a.difficulty - b.difficulty)
}

/**
 * Get questions grouped by category.
 */
export function getQuestionsByCategory() {
    const grouped = {}
    for (const q of questions) {
        if (!grouped[q.category]) grouped[q.category] = []
        grouped[q.category].push(q)
    }
    return grouped
}

/**
 * Get a session-ready set of questions:
 * sorted by difficulty with slight randomization within each tier.
 */
export function getSessionQuestions() {
    const byDifficulty = {}
    for (const q of questions) {
        if (!byDifficulty[q.difficulty]) byDifficulty[q.difficulty] = []
        byDifficulty[q.difficulty].push(q)
    }

    const result = []
    for (const diff of [1, 2, 3, 4, 5]) {
        if (byDifficulty[diff]) {
            result.push(...shuffleQuestions(byDifficulty[diff]))
        }
    }
    return result
}

/**
 * Get 5 practice questions — 1 from each category, easy-medium difficulty only.
 */
export function getPracticeQuestions() {
    const categories = ['pattern-recognition', 'sequence-completion', 'logical-deduction', 'spatial-reasoning', 'analogies']
    const practiceSet = []
    for (const cat of categories) {
        const candidates = questions.filter(q => q.category === cat && q.difficulty <= 3)
        // Pick one random from the easy-medium pool
        const pick = candidates[Math.floor(Math.random() * candidates.length)]
        if (pick) practiceSet.push(pick)
    }
    return shuffleQuestions(practiceSet)
}

export const CATEGORY_LABELS = {
    'pattern-recognition': 'Pattern Recognition',
    'sequence-completion': 'Sequence Completion',
    'logical-deduction': 'Logical Deduction',
    'spatial-reasoning': 'Spatial Reasoning',
    'analogies': 'Analogies',
}

export const CATEGORY_COUNT = 6

export default questions
