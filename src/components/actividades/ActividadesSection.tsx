import { useMemo, useState } from 'react'
import { ACTIVIDADES } from '../../data/actividades'
import { CONJUNTOS } from '../../data/conjuntos'
import type { Tematica } from '../../data/tematicas'
import type { Dificultad } from '../../data/actividades'
import { ActividadCard } from './ActividadCard'
import { FilterBar } from './FilterBar'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

export function ActividadesSection() {
  const [tematica, setTematica] = useState<Tematica | null>(null)
  const [isla, setIsla] = useState<string | null>(null)
  const [conjuntoId, setConjuntoId] = useState<number | null>(null)
  const [mes, setMes] = useState<string | null>(null)
  const [dificultad, setDificultad] = useState<Dificultad | null>(null)

  const mesesDisponibles = useMemo(() => {
    const set = new Set(ACTIVIDADES.map(a => a.fecha.slice(0, 7)))
    return Array.from(set).sort()
  }, [])

  const actividades = useMemo(() => {
    return ACTIVIDADES.filter(a => {
      if (tematica && a.tematica !== tematica) return false
      if (conjuntoId && a.conjuntoId !== conjuntoId) return false
      if (mes && !a.fecha.startsWith(mes)) return false
      if (dificultad && a.dificultad !== dificultad) return false
      if (isla) {
        const conjunto = CONJUNTOS.find(c => c.id === a.conjuntoId)
        if (!conjunto || conjunto.isla !== isla) return false
      }
      return true
    })
  }, [tematica, isla, conjuntoId, mes, dificultad])

  return (
    <section className="px-4 sm:px-10 lg:px-16 py-12 sm:py-16 bg-white">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2"
          style={labelStyle}
        >
          Rutas y actividades
        </p>
        <h2
          className="text-2xl sm:text-3xl font-light text-stone-900 leading-snug"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Experiencias en el patrimonio
        </h2>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <FilterBar
          tematica={tematica}
          isla={isla}
          conjuntoId={conjuntoId}
          mes={mes}
          dificultad={dificultad}
          mesesDisponibles={mesesDisponibles}
          onTematica={setTematica}
          onIsla={setIsla}
          onConjunto={setConjuntoId}
          onMes={setMes}
          onDificultad={setDificultad}
        />
      </div>

      {/* Grid */}
      {actividades.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {actividades.map(a => (
            <ActividadCard key={a.id} actividad={a} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-sm text-stone-400" style={labelStyle}>
            No hay actividades para los filtros seleccionados.
          </p>
        </div>
      )}
    </section>
  )
}
