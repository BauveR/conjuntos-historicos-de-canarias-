import type { Conjunto } from '../../data/conjuntos'
import { ACTIVIDADES } from '../../data/actividades'
import { HandTap } from '../HandTap'
import { labelStyle, titleStyle } from '../../styles/typography'
import { ActivityMiniCard } from './ActivityMiniCard'
import { ConjuntoStatBar } from './ConjuntoStatBar'

type Props = {
  conjunto: Conjunto | null
  onClose?: () => void
}

export function ConjuntoPanel({ conjunto, onClose }: Props) {
  const actividades = conjunto
    ? ACTIVIDADES.filter(a => a.conjuntoId === conjunto.id)
    : []

  if (!conjunto) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-10 gap-4">
        <HandTap className="w-40 h-40" />
        <p className="text-xs tracking-widest uppercase text-stone-400" style={labelStyle}>
          Selecciona un conjunto en el mapa
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Hero image */}
      <div className="relative w-full aspect-16/7 shrink-0 overflow-hidden">
        <img src={conjunto.imagen} alt={conjunto.nombre} className="w-full h-full object-cover" />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm cursor-pointer"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 px-8 py-7">
        <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400" style={labelStyle}>
          {conjunto.isla} — {conjunto.municipio}
        </p>

        <h2 className="text-2xl font-thin text-stone-900 uppercase tracking-tight leading-tight" style={titleStyle}>
          {conjunto.nombre}
        </h2>

        <div className="w-8 h-px bg-stone-200" />

        <p className="text-sm text-stone-500 leading-relaxed" style={labelStyle}>
          {conjunto.descripcion}
        </p>

        <ConjuntoStatBar conjunto={conjunto} count={actividades.length} />

        <div className="w-full h-px bg-stone-100" />

        <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400" style={labelStyle}>
          Actividades
        </p>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-8 px-8" style={{ scrollbarWidth: 'none' }}>
          {actividades.map(act => (
            <ActivityMiniCard key={act.id} actividad={act} />
          ))}
        </div>
      </div>
    </div>
  )
}
