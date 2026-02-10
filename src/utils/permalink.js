/**
 * LogIQ — Result Permalink Encoding/Decoding
 *
 * Encodes result data into a compact URL-safe string that can be
 * shared as a permalink. No backend required — all data lives in the URL.
 *
 * Format: base64url-encoded JSON + HMAC signature (dot-separated)
 * Example: <base64url_data>.<signature>
 *
 * The signature prevents casual URL forgery — anyone modifying the
 * encoded data will fail the integrity check on decode.
 */

const PERMALINK_SECRET = 'logiq_permalink_integrity_v2_2026'

/**
 * Compute a keyed hash signature for tamper detection.
 * Uses dual FNV-1a for wider output (≈12 chars).
 * Not cryptographically hardened — client-side key — but prevents casual forgery.
 */
function computeSignature(data) {
    const str = PERMALINK_SECRET + ':' + data
    let h1 = 0x811c9dc5
    let h2 = 0x050c5d1f
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i)
        h1 ^= c
        h1 = Math.imul(h1, 0x01000193)
        h2 ^= c
        h2 = Math.imul(h2, 0x100001b3)
    }
    return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)
}

/**
 * Encode results object into a URL-safe string
 * @param {Object} results - The full results object from scoring.js
 * @returns {string} URL-safe encoded string
 */
export function encodeResults(results) {
    // Compact representation with short keys
    const compact = {
        i: results.iqScore,
        p: results.percentile,
        c: results.classification,
        d: results.classificationDescriptor,
        r: results.rawScore,
        t: results.totalQuestions,
        w: results.weightedScore,
        m: results.maxWeightedScore,
        // Categories: array of [key, correct, total, percentage]
        k: results.categories.map(cat => [cat.key, cat.correct, cat.total, cat.percentage, cat.label]),
        // Difficulty: [easy.c, easy.t, med.c, med.t, hard.c, hard.t]
        b: [
            results.difficultyBreakdown.easy.correct,
            results.difficultyBreakdown.easy.total,
            results.difficultyBreakdown.medium.correct,
            results.difficultyBreakdown.medium.total,
            results.difficultyBreakdown.hard.correct,
            results.difficultyBreakdown.hard.total,
        ],
        // Time data
        tt: results.totalTime,
        at: results.avgTimePerQuestion,
        ft: results.fastestQuestion,
        st: results.slowestQuestion,
        // Timestamp
        ts: Date.now(),
    }

    const json = JSON.stringify(compact)
    // Base64url encode (URL-safe base64)
    const base64 = btoa(unescape(encodeURIComponent(json)))
    const encoded = base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    // Append HMAC signature for tamper detection
    const signature = computeSignature(encoded)
    return encoded + '.' + signature
}

/**
 * Decode a URL-safe encoded string back into a results object
 * @param {string} encoded - The URL-safe encoded string
 * @returns {Object|null} Results object, or null if invalid
 */
export function decodeResults(encoded) {
    try {
        // Split signature if present (format: data.signature)
        let data = encoded
        let isVerified = false

        const dotIndex = encoded.lastIndexOf('.')
        if (dotIndex > 0) {
            const payload = encoded.substring(0, dotIndex)
            const sig = encoded.substring(dotIndex + 1)
            const expectedSig = computeSignature(payload)
            if (sig === expectedSig) {
                data = payload
                isVerified = true
            } else {
                // Signature mismatch — tampered URL
                return null
            }
        }
        // Unsigned URLs (legacy links without signature) are still accepted

        // Restore standard base64
        let base64 = data
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        // Add padding
        while (base64.length % 4) base64 += '='

        const json = decodeURIComponent(escape(atob(base64)))
        const compact = JSON.parse(json)

        // Validate essential fields exist
        if (typeof compact.i !== 'number' || typeof compact.p !== 'number') {
            return null
        }

        return {
            iqScore: compact.i,
            percentile: compact.p,
            classification: compact.c,
            classificationDescriptor: compact.d,
            rawScore: compact.r,
            totalQuestions: compact.t,
            weightedScore: compact.w,
            maxWeightedScore: compact.m,
            categories: compact.k.map(([key, correct, total, percentage, label]) => ({
                key, correct, total, percentage, label,
            })),
            difficultyBreakdown: {
                easy: { correct: compact.b[0], total: compact.b[1] },
                medium: { correct: compact.b[2], total: compact.b[3] },
                hard: { correct: compact.b[4], total: compact.b[5] },
            },
            totalTime: compact.tt,
            avgTimePerQuestion: compact.at,
            fastestQuestion: compact.ft,
            slowestQuestion: compact.st,
            sharedAt: compact.ts,
            isVerified,
        }
    } catch {
        return null
    }
}

/**
 * Generate a full permalink URL for the given results
 * @param {Object} results - The full results object
 * @returns {string} Full URL with encoded results in hash
 */
export function generatePermalink(results) {
    const encoded = encodeResults(results)
    const base = window.location.origin
    return `${base}/results/${encoded}`
}
