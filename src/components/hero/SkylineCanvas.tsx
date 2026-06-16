import { useEffect, useRef } from 'react'

const LAYERS = [
  { trailFrac: 0.85, opacity: 0.20, strokeWidth: 3 },
  { trailFrac: 0.45, opacity: 0.95, strokeWidth: 1.2 },
] as const

const SPEED = 30
const MIN_LEN = 200

export function SkylineCanvas({
  svg,
  prefix,
  className,
}: {
  svg: string
  prefix: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const svgEl = container.querySelector('svg')
    if (!svgEl) return

    const cls1Els = Array.from(svgEl.querySelectorAll('.cls-1'))
    const rules: string[] = []
    const insertedGroups: SVGGElement[] = []
    let animIdx = 0

    cls1Els.forEach((el) => {
      if (!('getTotalLength' in el)) return
      const geo = el as SVGGeometryElement
      const total = geo.getTotalLength()
      if (total < MIN_LEN) return

      const i = animIdx++
      const p = `${prefix}${i}`
      const duration = Math.max(2, total / SPEED)
      const delay = -(i * 1.3)

      const layerEls = LAYERS.map((layer, li) => {
        const clone = geo.cloneNode() as SVGElement
        clone.removeAttribute('class')
        clone.setAttribute('fill', 'none')
        clone.setAttribute('stroke', 'white')
        clone.setAttribute('stroke-width', String(layer.strokeWidth))
        clone.setAttribute('stroke-opacity', String(layer.opacity))
        clone.setAttribute('stroke-linecap', 'round')
        clone.setAttribute('stroke-linejoin', 'round')
        clone.setAttribute('class', `${p}l${li}`)
        return clone
      })

      rules.push(`@keyframes ${p}{from{stroke-dashoffset:0}to{stroke-dashoffset:${total}}}`)
      LAYERS.forEach((layer, li) => {
        const trail = total * layer.trailFrac
        const gap = total - trail
        rules.push(
          `.${p}l${li}{stroke-dasharray:${trail} ${gap};animation:${p} ${duration.toFixed(2)}s linear ${delay.toFixed(1)}s infinite}`
        )
      })

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.append(...layerEls)
      el.after(g)
      insertedGroups.push(g)
    })

    const style = document.createElement('style')
    style.textContent = rules.join('\n')
    document.head.appendChild(style)

    return () => {
      style.remove()
      insertedGroups.forEach(g => g.remove())
    }
  }, [prefix])

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
