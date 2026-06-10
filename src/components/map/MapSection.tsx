import { useState } from 'react'
import { CONJUNTOS } from '../../data/conjuntos'
import { ConjuntosMap } from './ConjuntosMap'
import { ConjuntoPanel } from './ConjuntoPanel'

export function MapSection() {
  const [selectedId, setSelectedId] = useState<number | null>(CONJUNTOS[0].id)

  const selected = CONJUNTOS.find(c => c.id === selectedId) ?? null

  return (
    <section className="w-full bg-stone-50 px-4 sm:px-10 lg:px-16 py-8 sm:py-12">
      {/* Bloque mapa+panel con bordes redondeados */}
      <div className="flex flex-col sm:flex-row w-full h-[85svh] overflow-hidden rounded-3xl border border-stone-100 shadow-sm">
        {/* Mapa — 60% desktop, altura fija mobile */}
        <div className="h-[50%] sm:h-full sm:w-[60%] shrink-0">
          <ConjuntosMap
            conjuntos={CONJUNTOS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Panel info — 40% desktop, scroll independiente */}
        <div className="flex-1 h-[50%] sm:h-full overflow-y-auto border-l border-stone-100 bg-white">
          <ConjuntoPanel conjunto={selected} />
        </div>
      </div>
    </section>
  )
}
