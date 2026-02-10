import { useRef, useEffect } from 'react'

const CONFIG = {
    dotSpacing: 38,
    dotRadius: 0.8,
    dotColor: [0, 240, 255],
    dotBaseAlpha: 0.08,
    mouseRadius: 220,
    mouseAlphaBoost: 0.35,
    mouseScaleBoost: 2.8,
    pulseSpeed: 0.0008,
    pulseAmplitude: 0.03,
}

export default function DotGrid() {
    const canvasRef = useRef(null)
    const mouseRef = useRef({ x: -9999, y: -9999 })
    const animationRef = useRef(null)
    const sizeRef = useRef({ width: 0, height: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const w = window.innerWidth
            const h = window.innerHeight
            sizeRef.current = { width: w, height: h }
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = w + 'px'
            canvas.style.height = h + 'px'
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        function draw(timestamp) {
            const { width, height } = sizeRef.current
            ctx.clearRect(0, 0, width, height)

            const cols = Math.ceil(width / CONFIG.dotSpacing) + 1
            const rows = Math.ceil(height / CONFIG.dotSpacing) + 1
            const offsetX = (width - (cols - 1) * CONFIG.dotSpacing) / 2
            const offsetY = (height - (rows - 1) * CONFIG.dotSpacing) / 2
            const pulse = Math.sin(timestamp * CONFIG.pulseSpeed) * CONFIG.pulseAmplitude
            const centerX = width / 2
            const centerY = height / 2
            const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
            const { x: mouseX, y: mouseY } = mouseRef.current

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = offsetX + col * CONFIG.dotSpacing
                    const y = offsetY + row * CONFIG.dotSpacing

                    const distCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
                    const normalizedDist = distCenter / maxDist

                    const wave = Math.sin(distCenter * 0.015 - timestamp * 0.001) * 0.5 + 0.5

                    let alpha = CONFIG.dotBaseAlpha + pulse + wave * 0.04
                    alpha *= 1 - normalizedDist * 0.5

                    const dx = x - mouseX
                    const dy = y - mouseY
                    const mouseDist = Math.sqrt(dx * dx + dy * dy)
                    let radius = CONFIG.dotRadius

                    if (mouseDist < CONFIG.mouseRadius) {
                        const proximity = 1 - mouseDist / CONFIG.mouseRadius
                        const eased = proximity * proximity
                        alpha += CONFIG.mouseAlphaBoost * eased
                        radius += CONFIG.dotRadius * CONFIG.mouseScaleBoost * eased
                    }

                    alpha = Math.max(0, Math.min(1, alpha))
                    if (alpha < 0.01) continue

                    ctx.beginPath()
                    ctx.arc(x, y, radius, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(${CONFIG.dotColor[0]}, ${CONFIG.dotColor[1]}, ${CONFIG.dotColor[2]}, ${alpha})`
                    ctx.fill()
                }
            }

            animationRef.current = requestAnimationFrame(draw)
        }

        // Mouse tracking (throttled)
        let moveTimeout
        function onMouseMove(e) {
            if (moveTimeout) return
            moveTimeout = setTimeout(() => {
                mouseRef.current = { x: e.clientX, y: e.clientY }
                moveTimeout = null
            }, 16)
        }

        function onMouseLeave() {
            mouseRef.current = { x: -9999, y: -9999 }
        }

        window.addEventListener('resize', resize)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseleave', onMouseLeave)

        resize()
        animationRef.current = requestAnimationFrame(draw)

        return () => {
            window.removeEventListener('resize', resize)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseleave', onMouseLeave)
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            id="grid-canvas"
            aria-hidden="true"
        />
    )
}
