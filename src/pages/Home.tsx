import { HeroSplit } from '../components/hero/HeroSplit'
import { MapSection } from '../components/map/MapSection'

export function Home() {
  return (
    <main className="pt-16">
      <HeroSplit
        imageSrc="https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg"
        imageAlt="Convento de San Buenaventura, Betancuria, Fuerteventura"
        title="Conjuntos Históricos de Canarias"
        subtitle="Descubre el patrimonio histórico protegido de las siete islas"
        ctaLabel="Explorar"
        onCtaClick={() => {}}
      />

      <MapSection />
    </main>
  )
}
