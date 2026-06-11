import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conjunto } from '../../data/conjuntos'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 640px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

type Props = {
  conjunto: Conjunto | null
  open: boolean
  onClose: () => void
}

export function ConjuntoDrawer({ conjunto, open, onClose }: Props) {
  const isDesktop = useIsDesktop()

  if (!conjunto) return null

  const cardVariants = isDesktop
    ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }

  const cardTransition = isDesktop
    ? { duration: 0.18, ease: 'easeOut' }
    : { type: 'spring' as const, damping: 30, stiffness: 300 }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998] bg-black/40 sm:flex sm:items-center sm:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="
              bg-white flex flex-col overflow-hidden
              fixed bottom-0 left-0 right-0 rounded-t-3xl max-h-[90svh]
              sm:relative sm:bottom-auto sm:left-auto sm:right-auto
              sm:w-[92vw] sm:max-w-none sm:rounded-2xl sm:h-[90vh] sm:flex-row
            "
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={cardTransition}
            drag={isDesktop ? false : 'y'}
            dragConstraints={isDesktop ? undefined : { top: 0 }}
            dragElastic={isDesktop ? undefined : { top: 0 }}
            onDragEnd={isDesktop ? undefined : (_, info) => { if (info.offset.y > 80) onClose() }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle — solo mobile */}
            {!isDesktop && (
              <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-stone-200" />
              </div>
            )}

            {/* ── DESKTOP: izquierda textos ── */}
            <div className="hidden sm:flex flex-col justify-between h-full w-[42%] shrink-0 px-16 py-14 overflow-y-auto">

              {/* Cabecera */}
              <div className="flex flex-col gap-6">
                <p
                  className="text-[10px] tracking-[0.25em] uppercase text-stone-400"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {conjunto.isla} — {conjunto.municipio}
                </p>

                <h2
                  className="text-4xl font-thin text-stone-900 uppercase tracking-tight leading-tight"
                  style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
                >
                  {conjunto.nombre}
                </h2>

                <div className="w-8 h-px bg-stone-300" />

                <p
                  className="text-sm text-stone-500 leading-loose max-w-sm"
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {conjunto.descripcion}
                </p>
              </div>

              {/* Actividades + CTA */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <p
                    className="text-[10px] tracking-[0.25em] uppercase text-stone-400"
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    Actividades disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conjunto.actividades.map(act => (
                      <span
                        key={act}
                        className="px-4 py-1.5 border border-stone-200 text-stone-500 text-[10px] tracking-widest uppercase"
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── DESKTOP: derecha imagen slide ── */}
            <div className="hidden sm:block flex-1 h-full relative overflow-hidden">
              <img
                src={conjunto.imagen}
                alt={conjunto.nombre}
                className="w-full h-full object-cover"
              />
              {/* Botón cerrar sobre la imagen */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors cursor-pointer shadow-sm"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── MOBILE: layout vertical ── */}
            <div className="sm:hidden w-full aspect-video shrink-0">
              <img src={conjunto.imagen} alt={conjunto.nombre} className="w-full h-full object-cover" />
            </div>

            <div className="sm:hidden overflow-y-auto flex-1">
              <div className="flex flex-col gap-5 px-6 py-6">
                <p className="text-[10px] tracking-widest uppercase text-stone-400" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  {conjunto.isla} — {conjunto.municipio}
                </p>
                <h2 className="text-2xl font-thin text-stone-900 uppercase tracking-tight leading-snug"
                    style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}>
                  {conjunto.nombre}
                </h2>
                <p className="text-sm text-stone-500 leading-relaxed" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                  {conjunto.descripcion}
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] tracking-widest uppercase text-stone-400" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    Actividades disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conjunto.actividades.map(act => (
                      <span key={act} className="px-3 py-1 border border-stone-200 text-stone-600 text-[10px] tracking-widest uppercase"
                            style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
