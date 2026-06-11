import { Link } from 'react-router-dom'
import type { Actividad } from '../../data/actividades'
import { CONJUNTOS } from '../../data/conjuntos'
import { TEMATICA_COLORS } from '../../data/tematicas'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

function plazasBadge(disponibles: number, total: number) {
  if (total === 0) return null
  const pct = disponibles / total
  if (pct <= 0.10) return { text: `${disponibles} plazas`, className: 'bg-red-500 text-white' }
  if (pct < 0.40)  return { text: `${disponibles} plazas`, className: 'bg-orange-400 text-white' }
  if (pct >= 0.60) return { text: `${disponibles} plazas`, className: 'bg-blue-500 text-white' }
  return null
}

type Props = { actividad: Actividad }

export function ActividadCard({ actividad }: Props) {
  const conjunto = CONJUNTOS.find(c => c.id === actividad.conjuntoId)
  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
  const badge = plazasBadge(actividad.plazasDisponibles, actividad.plazas)

  return (
    <Link to={`/actividades/${actividad.id}`} className="group flex flex-col gap-3">
      {/* Imagen */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
        <img
          src={actividad.imagen}
          alt={actividad.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge temática */}
        <span
          className="absolute top-3 left-3 px-3 py-1 text-white font-bold text-[10px] tracking-widest uppercase rounded-full"
          style={{ ...labelStyle, backgroundColor: TEMATICA_COLORS[actividad.tematica] }}
        >
          {actividad.tematica}
        </span>
        {/* Badge plazas */}
        {badge && (
          <span
            className={`absolute top-3 right-3 px-3 py-1 font-bold text-[10px] tracking-widest uppercase rounded-full ${badge.className}`}
            style={labelStyle}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-1">
        <h3
          className="text-sm text-stone-900 leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors"
          style={labelStyle}
        >
          {actividad.titulo}
        </h3>

        {conjunto && (
          <p className="text-[11px] text-stone-400 tracking-wide" style={labelStyle}>
            {conjunto.nombre} · {conjunto.isla}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-500" style={labelStyle}>
          <span>{fecha} · {actividad.hora}</span>
          <span className="text-stone-300">·</span>
          <span>{actividad.duracion}</span>
          <span className="text-stone-300">·</span>
          <span>{actividad.dificultad}</span>
        </div>

        <p className="text-[11px] text-stone-400" style={labelStyle}>
          {actividad.plazasDisponibles} de {actividad.plazas} plazas disponibles
        </p>

        <span
          className="mt-1 text-[10px] tracking-widest uppercase text-stone-400 group-hover:text-stone-700 transition-colors duration-200 flex items-center gap-1"
          style={labelStyle}
        >
          Ver detalle
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
