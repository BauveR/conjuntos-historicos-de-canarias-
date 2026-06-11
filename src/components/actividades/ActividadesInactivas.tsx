import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Actividad } from '../../data/actividades'
import { ActividadCard } from './ActividadCard'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

type Props = { actividades: Actividad[] }

export function ActividadesInactivas({ actividades }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (actividades.length === 0) return null

  const n = actividades.length

  return (
    <div className="mt-12 pt-8 border-t border-stone-100">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] tracking-widest uppercase text-stone-300" style={labelStyle}>
          Sin disponibilidad · {n} {n === 1 ? 'actividad' : 'actividades'}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 tracking-wide transition-colors"
          style={labelStyle}
        >
          {expanded
            ? <><span aria-hidden>↑</span> Ocultar</>
            : <><span aria-hidden>↓</span> Ver {n} {n === 1 ? 'actividad' : 'actividades'}</>
          }
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-2">
              {actividades.map(a => <ActividadCard key={a.id} actividad={a} inactiva />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
