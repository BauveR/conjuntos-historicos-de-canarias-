import { TEMATICAS, type Tematica } from '../../data/tematicas'
import { CONJUNTOS } from '../../data/conjuntos'

const ISLAS = ['Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro']

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

type Props = {
  tematica: Tematica | null
  isla: string | null
  conjuntoId: number | null
  onTematica: (t: Tematica | null) => void
  onIsla: (i: string | null) => void
  onConjunto: (id: number | null) => void
}

export function FilterBar({ tematica, isla, conjuntoId, onTematica, onIsla, onConjunto }: Props) {
  const conjuntosFiltrados = isla
    ? CONJUNTOS.filter(c => c.isla === isla)
    : CONJUNTOS

  return (
    <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-widest uppercase text-stone-400 mr-1 whitespace-nowrap" style={labelStyle}>
          Filtra por:
        </span>
        <select
          value={tematica ?? ''}
          onChange={e => onTematica((e.target.value as Tematica) || null)}
          className="px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide bg-white appearance-none cursor-pointer hover:border-stone-400 transition-colors duration-200 pr-7"
          style={labelStyle}
        >
          <option value="">Temáticas</option>
          {TEMATICAS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={isla ?? ''}
          onChange={e => {
            onIsla(e.target.value || null)
            onConjunto(null)
          }}
          className="px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide bg-white appearance-none cursor-pointer hover:border-stone-400 transition-colors duration-200 pr-7"
          style={labelStyle}
        >
          <option value="">Islas</option>
          {ISLAS.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <select
          value={conjuntoId ?? ''}
          onChange={e => onConjunto(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide bg-white appearance-none cursor-pointer hover:border-stone-400 transition-colors duration-200 pr-7"
          style={labelStyle}
        >
          <option value="">Conjuntos</option>
          {conjuntosFiltrados.map(c => (
            <option key={c.id} value={c.id}>{c.nombre.replace('Conjunto Histórico de ', '')}</option>
          ))}
        </select>

        {(tematica || isla || conjuntoId) && (
          <button
            onClick={() => { onTematica(null); onIsla(null); onConjunto(null) }}
            className="px-3 py-1.5 rounded-full border border-stone-200 text-[11px] text-stone-400 tracking-wide hover:text-stone-700 hover:border-stone-400 transition-colors duration-200"
            style={labelStyle}
          >
            Limpiar filtros
          </button>
        )}
    </div>
  )
}
