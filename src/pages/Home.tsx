import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { HeroSplit } from '../components/hero/HeroSplit'
import { MapSection } from '../components/map/MapSection'
import { ActividadesSection } from '../components/actividades/ActividadesSection'
import { useAppContext } from '../contexts/AppContext'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function Home() {
  const { hash } = useLocation()
  const navType = useNavigationType()
  const { selectedId, setDrawerOpen } = useAppContext()

  // Scroll to hash when navigating via navbar links
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  // Position scroll before first paint — eliminates the hero flash on back navigation
  useLayoutEffect(() => {
    if (navType !== 'POP' || !selectedId) return
    document.getElementById('conjuntos')?.scrollIntoView({ behavior: 'instant' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reopen drawer on mobile after paint (drawer has its own enter animation)
  useEffect(() => {
    if (navType !== 'POP' || !selectedId) return
    if (!window.matchMedia('(min-width: 640px)').matches) {
      setDrawerOpen(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
