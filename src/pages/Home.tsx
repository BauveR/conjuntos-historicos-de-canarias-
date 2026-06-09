import { HeroSection } from '../components/hero/HeroSection'

export function Home() {
  return (
    <main>
      <HeroSection
        imageSrc="https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg"
        imageAlt="Paisaje de los conjuntos históricos de Canarias"
        title="Conjuntos Históricos de Canarias"
        subtitle="Descubre el patrimonio histórico protegido de las siete islas"
        ctaLabel="Explorar"
        onCtaClick={() => {}}
      />

      {/* Placeholder — próximas secciones fase 1 */}
      <section className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-300 text-sm tracking-widest uppercase">
          Próximamente
        </p>
      </section>
    </main>
  )
}
