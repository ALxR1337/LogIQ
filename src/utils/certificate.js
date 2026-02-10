/**
 * LogIQ — Certificate Generator
 *
 * Generates a downloadable PNG certificate using the Canvas API.
 * No external dependencies required.
 */

/**
 * Generate and download a LogIQ IQ test certificate
 * @param {Object} results - The results object from scoring
 * @param {string} [userName] - Optional user display name
 */
export async function generateCertificate(results, userName) {
    const canvas = document.createElement('canvas')
    const W = 1200
    const H = 800
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Wait for fonts to be ready
    await document.fonts.ready

    // === Background ===
    // Deep dark gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#060a14')
    bgGrad.addColorStop(0.5, '#0a0e1a')
    bgGrad.addColorStop(1, '#060a14')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(232, 230, 225, 0.03)'
    ctx.lineWidth = 0.5
    for (let x = 0; x < W; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
    }
    for (let y = 0; y < H; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
    }

    // Corner accent lines
    const accentColor = '#00f0ff'
    const accentDim = 'rgba(0, 240, 255, 0.15)'
    const accentGlow = 'rgba(0, 240, 255, 0.3)'

    ctx.strokeStyle = accentColor
    ctx.lineWidth = 2
    // Top-left corner
    ctx.beginPath()
    ctx.moveTo(40, 40)
    ctx.lineTo(40, 80)
    ctx.moveTo(40, 40)
    ctx.lineTo(80, 40)
    ctx.stroke()
    // Top-right corner
    ctx.beginPath()
    ctx.moveTo(W - 40, 40)
    ctx.lineTo(W - 40, 80)
    ctx.moveTo(W - 40, 40)
    ctx.lineTo(W - 80, 40)
    ctx.stroke()
    // Bottom-left corner
    ctx.beginPath()
    ctx.moveTo(40, H - 40)
    ctx.lineTo(40, H - 80)
    ctx.moveTo(40, H - 40)
    ctx.lineTo(80, H - 40)
    ctx.stroke()
    // Bottom-right corner
    ctx.beginPath()
    ctx.moveTo(W - 40, H - 40)
    ctx.lineTo(W - 40, H - 80)
    ctx.moveTo(W - 40, H - 40)
    ctx.lineTo(W - 80, H - 40)
    ctx.stroke()

    // Inner border with very subtle accent
    ctx.strokeStyle = accentDim
    ctx.lineWidth = 1
    ctx.strokeRect(60, 60, W - 120, H - 120)

    // === Header Label ===
    ctx.font = '500 11px "DM Mono", monospace'
    ctx.fillStyle = 'rgba(232, 230, 225, 0.4)'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '3px'
    ctx.fillText('CERTIFICATE OF ASSESSMENT', W / 2, 110)

    // === LogIQ Title ===
    ctx.font = 'italic 52px "Instrument Serif", Georgia, serif'
    ctx.fillStyle = '#e8e6e1'
    ctx.fillText('LogIQ', W / 2, 165)

    // Thin divider line
    ctx.strokeStyle = 'rgba(232, 230, 225, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - 100, 185)
    ctx.lineTo(W / 2 + 100, 185)
    ctx.stroke()

    // === IQ Score (main focus) ===
    // Glow effect behind score
    ctx.shadowColor = accentGlow
    ctx.shadowBlur = 60
    ctx.font = '400 140px "Instrument Serif", Georgia, serif'
    ctx.fillStyle = accentColor
    ctx.fillText(String(results.iqScore), W / 2, 340)
    ctx.shadowBlur = 0

    // Score label
    ctx.font = '400 11px "DM Mono", monospace'
    ctx.fillStyle = 'rgba(232, 230, 225, 0.35)'
    ctx.fillText('IQ SCORE', W / 2, 370)

    // === Classification Badge ===
    const classText = results.classification.toUpperCase()
    ctx.font = '500 13px "DM Mono", monospace'
    const classWidth = ctx.measureText(classText).width + 40
    const classX = (W - classWidth) / 2
    const classY = 395
    // Badge background
    ctx.fillStyle = 'rgba(0, 240, 255, 0.06)'
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.rect(classX, classY, classWidth, 32)
    ctx.fill()
    ctx.stroke()
    // Badge text
    ctx.fillStyle = accentColor
    ctx.fillText(classText, W / 2, classY + 22)

    // Descriptor
    ctx.font = '300 11px "DM Mono", monospace'
    ctx.fillStyle = 'rgba(232, 230, 225, 0.3)'
    ctx.fillText(results.classificationDescriptor, W / 2, classY + 55)

    // === Stats Row ===
    const statsY = 500
    const statsData = [
        { label: 'PERCENTILE', value: `${results.percentile}%` },
        { label: 'CORRECT', value: `${results.rawScore}/${results.totalQuestions}` },
        { label: 'TIME', value: formatDuration(results.totalTime) },
    ]

    const statsSpacing = 220
    const statsStartX = W / 2 - statsSpacing

    statsData.forEach((stat, i) => {
        const x = statsStartX + i * statsSpacing
        // Value
        ctx.font = '400 28px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = '#e8e6e1'
        ctx.fillText(stat.value, x, statsY)
        // Label
        ctx.font = '400 9px "DM Mono", monospace'
        ctx.fillStyle = 'rgba(232, 230, 225, 0.3)'
        ctx.fillText(stat.label, x, statsY + 20)
    })

    // === Category Breakdown (mini bars) ===
    const catY = 560
    const barWidth = 140
    const barHeight = 4
    const catSpacing = 180
    const categories = results.categories || []
    const numCats = Math.min(categories.length, 5)
    const totalBarWidth = numCats * catSpacing - (catSpacing - barWidth)
    const catStartX = (W - totalBarWidth) / 2

    categories.slice(0, 5).forEach((cat, i) => {
        const x = catStartX + i * catSpacing
        const centerX = x + barWidth / 2

        // Category name
        ctx.font = '400 8px "DM Mono", monospace'
        ctx.fillStyle = 'rgba(232, 230, 225, 0.35)'
        ctx.textAlign = 'center'
        ctx.fillText(cat.label.toUpperCase(), centerX, catY)

        // Bar background
        ctx.textAlign = 'left'
        ctx.fillStyle = 'rgba(232, 230, 225, 0.06)'
        roundRect(ctx, x, catY + 8, barWidth, barHeight, 2)
        ctx.fill()

        // Bar fill
        const fillW = (cat.percentage / 100) * barWidth
        const barGrad = ctx.createLinearGradient(x, 0, x + fillW, 0)
        barGrad.addColorStop(0, 'rgba(0, 240, 255, 0.7)')
        barGrad.addColorStop(1, accentColor)
        ctx.fillStyle = barGrad
        roundRect(ctx, x, catY + 8, fillW, barHeight, 2)
        ctx.fill()

        // Score text
        ctx.textAlign = 'center'
        ctx.font = '400 9px "DM Mono", monospace'
        ctx.fillStyle = 'rgba(232, 230, 225, 0.4)'
        ctx.fillText(`${cat.correct}/${cat.total}`, centerX, catY + 30)
    })

    // === Footer ===
    // Date
    ctx.textAlign = 'center'
    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    ctx.font = '300 10px "DM Mono", monospace'
    ctx.fillStyle = 'rgba(232, 230, 225, 0.25)'
    ctx.fillText(dateStr, W / 2, H - 120)

    // User name (if provided)
    if (userName) {
        ctx.font = '400 14px "DM Mono", monospace'
        ctx.fillStyle = 'rgba(232, 230, 225, 0.5)'
        ctx.fillText(userName, W / 2, H - 95)
    }

    // Watermark
    ctx.font = 'italic 16px "Instrument Serif", Georgia, serif'
    ctx.fillStyle = 'rgba(232, 230, 225, 0.12)'
    ctx.fillText('logiq.app', W / 2, H - 60)

    // === Download ===
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `logiq-iq-${results.iqScore}-certificate.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/** Draw a rounded rectangle path */
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
}

/** Format ms to "Xm Ys" */
function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}m ${sec}s`
}
