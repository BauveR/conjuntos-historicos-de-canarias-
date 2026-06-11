import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Tematica } from '../data/tematicas'
import type { Dificultad } from '../data/actividades'
import type { FilterState } from '../components/actividades/FilterSheet'

type AppContextValue = {
  // Map state
  selectedId: number | null
  setSelectedId: (id: number | null) => void
  selectedIsla: string | null
  setSelectedIsla: (isla: string | null) => void
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  // Activity filter state
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
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedIsla, setSelectedIsla] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [tematica, setTematica] = useState<Tematica | null>(null)
  const [isla, setIsla] = useState<string | null>(null)
  const [conjuntoId, setConjuntoId] = useState<number | null>(null)
  const [mes, setMes] = useState<string | null>(null)
  const [dificultad, setDificultad] = useState<Dificultad | null>(null)

  const applyFilters = (f: FilterState) => {
    setTematica(f.tematica)
    setIsla(f.isla)
    setConjuntoId(f.conjuntoId)
    setMes(f.mes)
    setDificultad(f.dificultad)
  }

  return (
    <AppContext.Provider value={{
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
