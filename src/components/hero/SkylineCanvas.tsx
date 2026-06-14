import { useEffect, useRef } from 'react'

const LAYERS = [
  { trailFrac: 0.80, opacity: 0.05, strokeWidth: 3, blur: 2 },
  { trailFrac: 0.60, opacity: 0.14, strokeWidth: 2, blur: 0 },
  { trailFrac: 0.38, opacity: 0.35, strokeWidth: 1.5, blur: 0 },
  { trailFrac: 0.18, opacity: 0.60, strokeWidth: 1, blur: 0 },
  { trailFrac: 0.07, opacity: 0.85, strokeWidth: 1, blur: 0 },
  { trailFrac: 0.02, opacity: 1.00, strokeWidth: 0.5, blur: 0 },
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

    let defs = svgEl.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svgEl.prepend(defs)
    }

    LAYERS.forEach((layer, li) => {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.id = `${prefix}-glow-${li}`
      filter.setAttribute('x', '-10%')
      filter.setAttribute('y', '-10%')
      filter.setAttribute('width', '120%')
      filter.setAttribute('height', '120%')

      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
      blur.setAttribute('in', 'SourceGraphic')
      blur.setAttribute('stdDeviation', String(layer.blur))
      blur.setAttribute('result', 'blur')

      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge')
      const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
      n1.setAttribute('in', 'blur')
      const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
      n2.setAttribute('in', 'SourceGraphic')
      merge.append(n1, n2)
      filter.append(blur, merge)
      defs!.append(filter)
    })

    const cls1Els = Array.from(svgEl.querySelectorAll('.cls-1'))
    const rules: string[] = []
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

      // Overlay strokes on top of the original filled shape — don't replace it
      const layerEls = LAYERS.map((layer, li) => {
        const clone = geo.cloneNode() as SVGElement
        clone.removeAttribute('class')
        clone.setAttribute('fill', 'none')
        clone.setAttribute('stroke', 'white')
        clone.setAttribute('stroke-width', String(layer.strokeWidth))
        clone.setAttribute('stroke-opacity', String(layer.opacity))
        clone.setAttribute('stroke-linecap', 'round')
        clone.setAttribute('stroke-linejoin', 'round')
        if (layer.blur > 0) clone.setAttribute('filter', `url(#${prefix}-glow-${li})`)
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
      // Insert comet strokes after the original element — original fill is preserved
      el.after(g)
    })

    const style = document.createElement('style')
    style.textContent = rules.join('\n')
    document.head.appendChild(style)

    return () => style.remove()
  }, [prefix])

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
