import { HeroSplit } from '../components/hero/HeroSplit'

export function Home() {
  return (
    <main>
      <HeroSplit
        imageSrc="https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg"
        imageAlt="Convento de San Buenaventura, Betancuria, Fuerteventura"
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
