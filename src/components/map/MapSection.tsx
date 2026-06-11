import { CONJUNTOS } from '../../data/conjuntos'
import { ConjuntosMap } from './ConjuntosMap'
import { ConjuntoPanel } from './ConjuntoPanel'
import { ConjuntoDrawer } from './ConjuntoDrawer'
import { IslaFilter } from './IslaFilter'
import { useAppContext } from '../../contexts/AppContext'

export function MapSection() {
  const { selectedId, setSelectedId, selectedIsla, setSelectedIsla, drawerOpen, setDrawerOpen } = useAppContext()

  const selected = CONJUNTOS.find(c => c.id === selectedId) ?? null

  const handleSelect = (id: number) => {
    setSelectedId(id)
    if (!window.matchMedia('(min-width: 640px)').matches) {
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

  const handleDrawerNavigate = () => {
    setDrawerOpen(false)
    // selectedId stays in context so it restores on back navigation
  }

  return (
    <section className="w-full bg-stone-50 px-4 sm:px-10 lg:px-16 py-8 sm:py-12 overscroll-contain">

      <div className="mb-3">
        <IslaFilter selectedIsla={selectedIsla} onSelect={handleIslaSelect} />
      </div>

      <div className="flex flex-row w-full h-[68svh] sm:h-[85svh] overflow-hidden rounded-3xl border border-stone-100 shadow-sm">

        <div className="h-full flex-1 min-w-0 touch-none isolate">
          <ConjuntosMap
            conjuntos={CONJUNTOS}
            selectedId={selectedId}
            selectedIsla={selectedIsla}
            onSelect={handleSelect}
          />
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
