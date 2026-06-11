import type { Conjunto } from '../../data/conjuntos'
import { ACTIVIDADES } from '../../data/actividades'
import { HandTap } from '../HandTap'

type Props = {
  conjunto: Conjunto | null
  onVerMas: () => void
}

export function ConjuntoPanel({ conjunto, onVerMas }: Props) {
  const actividades = conjunto
    ? conjunto.actividadIds.map(id => ACTIVIDADES.find(a => a.id === id)).filter(Boolean)
    : []

  if (!conjunto) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-10 gap-4">
        <HandTap className="w-40 h-40" />
        <p
          className="text-xs tracking-widest uppercase text-stone-400"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          Selecciona un conjunto en el mapa
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Imagen */}
      <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden">
        <img
          src={conjunto.imagen}
          alt={conjunto.nombre}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-5 px-8 py-8">
        {/* Isla · Municipio */}
        <p
          className="text-[10px] tracking-widest uppercase text-stone-400"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          {conjunto.isla} — {conjunto.municipio}
        </p>

        {/* Nombre */}
        <h2
          className="text-xl sm:text-2xl font-thin text-stone-900 leading-snug uppercase tracking-tight"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          {conjunto.nombre}
        </h2>

        {/* Descripción */}
        <p
          className="text-sm text-stone-500 leading-relaxed"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          {conjunto.descripcion}
        </p>

        {/* Actividades */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[10px] tracking-widest uppercase text-stone-400"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Actividades disponibles
          </p>
          <div className="flex flex-wrap gap-2">
            {actividades.map(act => (
              <span
                key={act!.id}
                className="px-3 py-1 border border-stone-200 text-stone-600 text-[10px] tracking-widest uppercase"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                {act!.tematica}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onVerMas}
          className="mt-2 w-fit px-8 py-3 border border-stone-900 text-stone-900 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors duration-300 cursor-pointer"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          Ver más
        </button>
      </div>
    </div>
  )
}
