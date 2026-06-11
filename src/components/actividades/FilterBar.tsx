import { TEMATICAS, type Tematica } from '../../data/tematicas'
import { CONJUNTOS } from '../../data/conjuntos'
import type { Dificultad } from '../../data/actividades'

const ISLAS = ['Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro']
const DIFICULTADES: Dificultad[] = ['Fácil', 'Media', 'Difícil']
const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

function formatMes(yyyyMM: string) {
  const [year, month] = yyyyMM.split('-')
  const s = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type Props = {
  // Desktop filter values
  tematica: Tematica | null
  isla: string | null
  conjuntoId: number | null
  mes: string | null
  dificultad: Dificultad | null
  mesesDisponibles: string[]
  // Desktop setters
  onTematica: (t: Tematica | null) => void
  onIsla: (i: string | null) => void
  onConjunto: (id: number | null) => void
  onMes: (m: string | null) => void
  onDificultad: (d: Dificultad | null) => void
  // Mobile sheet
  activeCount: number
  onOpenSheet: () => void
}

const selectClass = "px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide bg-white appearance-none cursor-pointer hover:border-stone-400 transition-colors duration-200 pr-7"

export function FilterBar({
  tematica, isla, conjuntoId, mes, dificultad, mesesDisponibles,
  onTematica, onIsla, onConjunto, onMes, onDificultad,
  activeCount, onOpenSheet,
}: Props) {
  const conjuntosFiltrados = isla ? CONJUNTOS.filter(c => c.isla === isla) : CONJUNTOS
  const hasActive = !!(tematica || isla || conjuntoId || mes || dificultad)

  return (
    <>
      {/* ── Mobile: botón trigger ── */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={onOpenSheet}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide hover:border-stone-400 transition-colors duration-200"
          style={labelStyle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filtros
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[9px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {hasActive && (
          <button
            onClick={() => { onTematica(null); onIsla(null); onConjunto(null); onMes(null); onDificultad(null) }}
            className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors underline-offset-2"
            style={labelStyle}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ── Desktop: dropdowns en línea ── */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-widest uppercase text-stone-400 mr-1 whitespace-nowrap" style={labelStyle}>
          Filtra por:
        </span>

        <select value={tematica ?? ''} onChange={e => onTematica((e.target.value as Tematica) || null)} className={selectClass} style={labelStyle}>
          <option value="">Temáticas</option>
          {TEMATICAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={isla ?? ''} onChange={e => { onIsla(e.target.value || null); onConjunto(null) }} className={selectClass} style={labelStyle}>
          <option value="">Islas</option>
          {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <select value={conjuntoId ?? ''} onChange={e => onConjunto(e.target.value ? Number(e.target.value) : null)} className={selectClass} style={labelStyle}>
          <option value="">Conjuntos</option>
          {conjuntosFiltrados.map(c => <option key={c.id} value={c.id}>{c.nombre.replace('Conjunto Histórico de ', '')}</option>)}
        </select>

        <select value={dificultad ?? ''} onChange={e => onDificultad((e.target.value as Dificultad) || null)} className={selectClass} style={labelStyle}>
          <option value="">Dificultad</option>
          {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={mes ?? ''} onChange={e => onMes(e.target.value || null)} className={selectClass} style={labelStyle}>
          <option value="">Fecha</option>
          {mesesDisponibles.map(m => <option key={m} value={m}>{formatMes(m)}</option>)}
        </select>

        {hasActive && (
          <button
            onClick={() => { onTematica(null); onIsla(null); onConjunto(null); onMes(null); onDificultad(null) }}
            className="px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-400 tracking-wide hover:text-stone-700 hover:border-stone-400 transition-colors duration-200"
            style={labelStyle}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  )
}
