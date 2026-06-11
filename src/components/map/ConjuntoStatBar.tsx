import type { Conjunto } from '../../data/conjuntos'
import { labelStyle } from '../../styles/typography'

type Props = {
  conjunto: Conjunto
  count: number
}

export function ConjuntoStatBar({ conjunto, count }: Props) {
  const stats = [
    `${count} actividad${count !== 1 ? 'es' : ''}`,
    ...(conjunto.declaraciones ?? []),
    ...(conjunto.fundacion ? [`Fundada en ${conjunto.fundacion}`] : []),
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-400" style={labelStyle}>
      {stats.map((stat, i) => (
        <span key={stat} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-stone-200">·</span>}
          {stat}
        </span>
      ))}
    </div>
  )
}
