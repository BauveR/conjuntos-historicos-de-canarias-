import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { HeroSplit } from '../components/hero/HeroSplit'
import { MapSection } from '../components/map/MapSection'
import { ActividadesSection } from '../components/actividades/ActividadesSection'
import { useMapRestoration } from '../hooks/useMapRestoration'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Cleared on reload (module re-executes), survives SPA navigation
const scrollPositions: Record<string, number> = {}

export function Home() {
  const location = useLocation()
  const navType = useNavigationType()

  // Restore scroll on back navigation — must run before useMapRestoration's
  // useLayoutEffect so that useMapRestoration can override when selectedId is set
  useLayoutEffect(() => {
    if (navType !== 'POP') return
    const saved = scrollPositions[location.key]
    if (saved !== undefined) window.scrollTo({ top: saved, behavior: 'instant' })
  }, [])

  useMapRestoration()

  // Hash scroll only on explicit PUSH navigation (navbar links)
  useEffect(() => {
    if (!location.hash || navType !== 'PUSH') return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, navType])

  // Continuously save scroll position keyed by history entry
  useEffect(() => {
    const key = location.key
    const save = () => { scrollPositions[key] = window.scrollY }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.key])

  return (
    <main className="pt-16">
      <HeroSplit
        imageSrc="https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg"
        imageAlt="Convento de San Buenaventura, Betancuria, Fuerteventura"
        title="Conjuntos Históricos de Canarias"
        subtitle="Descubre el patrimonio histórico protegido de las siete islas"
        ctaLabel="Explorar"
        onCtaClick={() => scrollTo('conjuntos')}
      />

      <section id="conjuntos" className="scroll-mt-16">
        <MapSection />
      </section>

      <section id="actividades" className="scroll-mt-16">
        <ActividadesSection />
      </section>
    </main>
  )
}
