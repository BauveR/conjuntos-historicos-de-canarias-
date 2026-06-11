import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { HeroSplit } from '../components/hero/HeroSplit'
import { MapSection } from '../components/map/MapSection'
import { ActividadesSection } from '../components/actividades/ActividadesSection'
import { useMapRestoration } from '../hooks/useMapRestoration'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function Home() {
  const { hash } = useLocation()
  useMapRestoration()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

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
