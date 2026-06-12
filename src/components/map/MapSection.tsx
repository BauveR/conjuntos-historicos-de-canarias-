import { useState, useEffect, useRef } from 'react'
import { ConjuntosMap } from './ConjuntosMap'
import { ConjuntoPanel } from './ConjuntoPanel'
import { ConjuntoDrawer } from './ConjuntoDrawer'
import { IslaFilter } from './IslaFilter'
import { MapHint } from './MapHint'
import { useAppContext } from '../../contexts/AppContext'
import { SM_BREAKPOINT } from '../../hooks/useIsDesktop'

export function MapSection() {
  const { conjuntos, selectedId, setSelectedId, selectedIsla, setSelectedIsla, drawerOpen, setDrawerOpen } = useAppContext()
  const [mapVisible, setMapVisible] = useState(false)
  const [mapActive, setMapActive] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const selected = conjuntos.find(c => c.id === selectedId) ?? null

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSelect = (id: number) => {
    setMapActive(true)
    setSelectedId(id)
    if (!window.matchMedia(SM_BREAKPOINT).matches) {
      setDrawerOpen(true)
    }
  }

  const handleIslaSelect = (isla: string | null) => {
    setSelectedIsla(isla)
    setSelectedId(null)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedId(null)
  }

  const handleDrawerNavigate = () => setDrawerOpen(false)

  return (
    <section className="w-full bg-white px-4 sm:px-10 lg:px-32 py-6 sm:py-8 overscroll-contain">

      <div className="mb-3">
        <IslaFilter selectedIsla={selectedIsla} onSelect={handleIslaSelect} />
      </div>

      <div className="flex flex-row w-full h-[68svh] sm:h-[78svh] overflow-hidden rounded-3xl border border-stone-100 shadow-sm">

        <div ref={mapContainerRef} className="h-full flex-1 min-w-0 touch-none isolate relative">

          <MapHint visible={mapVisible} active={mapActive} />

          <div className="h-full">
            <ConjuntosMap
              conjuntos={conjuntos}
              selectedId={selectedId}
              selectedIsla={selectedIsla}
              active={mapActive}
              onSelect={handleSelect}
              onActivate={() => setMapActive(true)}
            />
          </div>
        </div>

        <div
          className="hidden sm:block h-full shrink-0 overflow-hidden border-l border-stone-100 bg-white"
          style={{
            width: selected ? '40%' : '0',
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {selected && (
            <ConjuntoPanel
              key={selected.id}
              conjunto={selected}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>

      <ConjuntoDrawer
        conjunto={selected}
        open={drawerOpen}
        onClose={handleDrawerClose}
        onNavigate={handleDrawerNavigate}
      />
    </section>
  )
}
