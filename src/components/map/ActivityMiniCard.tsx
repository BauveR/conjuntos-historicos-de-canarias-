import { Link } from 'react-router-dom'
import type { Actividad } from '../../data/actividades'
import { TEMATICA_COLORS } from '../../data/tematicas'
import { labelStyle } from '../../styles/typography'

type Props = {
  actividad: Actividad
  onNavigate?: () => void
  size?: 'sm' | 'md'
}

const sizeClass = { sm: 'w-36', md: 'w-40' }

export function ActivityMiniCard({ actividad, onNavigate, size = 'sm' }: Props) {
  return (
    <Link
      to={`/actividades/${actividad.id}`}
      onClick={onNavigate}
      className={`flex-none ${sizeClass[size]} flex flex-col gap-2 group`}
    >
      <div className="aspect-4/3 rounded-xl overflow-hidden">
        <img
          src={actividad.imagen}
          alt={actividad.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <span
        className="px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase text-white font-bold w-fit"
        style={{ backgroundColor: TEMATICA_COLORS[actividad.tematica] }}
      >
        {actividad.tematica}
      </span>
      <p className="text-xs text-stone-800 leading-snug line-clamp-2" style={labelStyle}>
        {actividad.titulo}
      </p>
    </Link>
  )
}
