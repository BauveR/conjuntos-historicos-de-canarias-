import { useMemo, useState } from 'react'
import { FilterBar } from './FilterBar'
import { FilterSheet, type FilterState } from './FilterSheet'
import { ActividadesSlider } from './ActividadesSlider'
import { ActividadesInactivas } from './ActividadesInactivas'
import { useDataContext } from '../../contexts/DataContext'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

export function ActividadesSection() {
  const {
    actividades, conjuntos,
    tematica, setTematica,
    isla, setIsla,
    conjuntoId, setConjuntoId,
    mes, setMes,
    dificultad, setDificultad,
    applyFilters,
  } = useDataContext()

  const [sheetOpen, setSheetOpen] = useState(false)

  const mesesDisponibles = useMemo(() => {
    const set = new Set(actividades.map(a => a.fecha.slice(0, 7)))
    return Array.from(set).sort()
  }, [actividades])

  const today = new Date().toISOString().slice(0, 10)

  const actividadesFiltradas = useMemo(() => {
    return actividades.filter(a => {
      if (tematica && a.tematica !== tematica) return false
      if (conjuntoId && a.conjuntoId !== conjuntoId) return false
      if (mes && !a.fecha.startsWith(mes)) return false
      if (dificultad && a.dificultad !== dificultad) return false
      if (isla) {
        const c = conjuntos.find(c => c.id === a.conjuntoId)
        if (!c || c.isla !== isla) return false
      }
      return true
    })
  }, [actividades, conjuntos, tematica, isla, conjuntoId, mes, dificultad])

  const disponibles = actividadesFiltradas.filter(a => !a.cancelada && a.plazasDisponibles > 0 && a.fecha >= today)
  const inactivas   = actividadesFiltradas.filter(a => !a.cancelada && (a.plazasDisponibles === 0 || a.fecha < today))
  const canceladas  = actividadesFiltradas.filter(a => !!a.cancelada)

  const currentFilters: FilterState = { tematica, isla, conjuntoId, mes, dificultad }

  return (
    <section className="px-6 sm:px-8 lg:px-10 py-12 sm:py-16 bg-white">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2" style={labelStyle}>
          Rutas y actividades
        </p>
        <h2 className="text-2xl sm:text-3xl font-light text-stone-900 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
          Experiencias en el patrimonio
        </h2>
      </div>

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
          onOpenSheet={() => setSheetOpen(true)}
        />
      </div>

      {actividades.length > 0 && actividadesFiltradas.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-stone-400" style={labelStyle}>
            No hay actividades para los filtros seleccionados.
          </p>
          <button
            onClick={() => applyFilters({ tematica: null, isla: null, conjuntoId: null, mes: null, dificultad: null })}
            className="px-4 py-2 rounded-full border border-stone-200 text-[11px] text-stone-500 tracking-wide hover:border-stone-400 transition-colors"
            style={labelStyle}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <ActividadesSlider actividades={disponibles} />
          <ActividadesInactivas actividades={[...inactivas, ...canceladas]} />
        </>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={currentFilters}
        mesesDisponibles={mesesDisponibles}
        onApply={applyFilters}
      />
    </section>
  )
}
