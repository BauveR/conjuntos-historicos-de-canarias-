import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Tematica, TematicaData } from '../data/tematicas'
import type { Dificultad, Actividad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import type { FilterState } from '../components/actividades/FilterSheet'
import { subscribeActividades, subscribeConjuntos, subscribeTematicas } from '../lib/db'

type DataContextValue = {
  actividades: Actividad[]
  conjuntos: Conjunto[]
  tematicas: TematicaData[]
  dataLoading: boolean
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

const DataContext = createContext<DataContextValue | null>(null)

let _actividades: Actividad[] = []
let _conjuntos: Conjunto[] = []
let _tematicas: TematicaData[] = []

export function DataProvider({ children }: { children: ReactNode }) {
  const [actividades, setActividades] = useState<Actividad[]>(_actividades)
  const [conjuntos, setConjuntos] = useState<Conjunto[]>(_conjuntos)
  const [tematicas, setTematicas] = useState<TematicaData[]>(_tematicas)
  const [dataLoading, setDataLoading] = useState(true)

  const [tematica, setTematica] = useState<Tematica | null>(null)
  const [isla, setIsla] = useState<string | null>(null)
  const [conjuntoId, setConjuntoId] = useState<number | null>(null)
  const [mes, setMes] = useState<string | null>(null)
  const [dificultad, setDificultad] = useState<Dificultad | null>(null)

  useEffect(() => {
    let actLoaded = false
    let conjLoaded = false
    let temLoaded = false

    const checkLoaded = () => { if (actLoaded && conjLoaded && temLoaded) setDataLoading(false) }

    const unsub1 = subscribeActividades(data => {
      _actividades = data
      setActividades(data)
      actLoaded = true
      checkLoaded()
    })
    const unsub2 = subscribeConjuntos(data => {
      _conjuntos = data
      setConjuntos(data)
      conjLoaded = true
      checkLoaded()
    })
    const unsub3 = subscribeTematicas(data => {
      _tematicas = data
      setTematicas(data)
      temLoaded = true
      checkLoaded()
    })

    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const applyFilters = (f: FilterState) => {
    setTematica(f.tematica)
    setIsla(f.isla)
    setConjuntoId(f.conjuntoId)
    setMes(f.mes)
    setDificultad(f.dificultad)
  }

  return (
    <DataContext.Provider value={{
      actividades, conjuntos, tematicas, dataLoading,
      tematica, setTematica,
      isla, setIsla,
      conjuntoId, setConjuntoId,
      mes, setMes,
      dificultad, setDificultad,
      applyFilters,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDataContext must be used within DataProvider')
  return ctx
}
