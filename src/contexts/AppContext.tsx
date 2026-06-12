import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Tematica } from '../data/tematicas'
import type { Dificultad, Actividad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import type { FilterState } from '../components/actividades/FilterSheet'
import { subscribeActividades, subscribeConjuntos } from '../lib/db'

type AppContextValue = {
  actividades: Actividad[]
  conjuntos: Conjunto[]
  dataLoading: boolean

  selectedId: number | null
  setSelectedId: (id: number | null) => void
  selectedIsla: string | null
  setSelectedIsla: (isla: string | null) => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  tematica: Tematica | null
  setTematica: (v: Tematica | null) => void
  isla: string | null
  setIsla: (v: string | null) => void
  conjuntoId: number | null
  setConjuntoId: (v: number | null) => void
  mes: string | null
  setMes: (v: string | null) => void
  dificultad: Dificultad | null
  setDificultad: (v: Dificultad | null) => void
  applyFilters: (f: FilterState) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [conjuntos, setConjuntos] = useState<Conjunto[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedIsla, setSelectedIsla] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [tematica, setTematica] = useState<Tematica | null>(null)
  const [isla, setIsla] = useState<string | null>(null)
  const [conjuntoId, setConjuntoId] = useState<number | null>(null)
  const [mes, setMes] = useState<string | null>(null)
  const [dificultad, setDificultad] = useState<Dificultad | null>(null)

  useEffect(() => {
    let actLoaded = false
    let conjLoaded = false

    const unsub1 = subscribeActividades(data => {
      setActividades(data)
      actLoaded = true
      if (conjLoaded) setDataLoading(false)
    })
    const unsub2 = subscribeConjuntos(data => {
      setConjuntos(data)
      conjLoaded = true
      if (actLoaded) setDataLoading(false)
    })

    return () => { unsub1(); unsub2() }
  }, [])

  const applyFilters = (f: FilterState) => {
    setTematica(f.tematica)
    setIsla(f.isla)
    setConjuntoId(f.conjuntoId)
    setMes(f.mes)
    setDificultad(f.dificultad)
  }

  return (
    <AppContext.Provider value={{
      actividades, conjuntos, dataLoading,
      selectedId, setSelectedId,
      selectedIsla, setSelectedIsla,
      drawerOpen, setDrawerOpen,
      tematica, setTematica,
      isla, setIsla,
      conjuntoId, setConjuntoId,
      mes, setMes,
      dificultad, setDificultad,
      applyFilters,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
