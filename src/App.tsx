import { CanariasAnimation } from './components/CanariasAnimation'
import './App.css'

export default function App() {
  return (
    <main
      className="min-h-svh w-full flex flex-col items-center justify-center gap-8 px-4 py-12"
      style={{ background: 'linear-gradient(to bottom, #c36414, #d6a103)' }}
    >
      <div className="w-full max-w-[360px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl mb-4 sm:-mb-8 md:-mb-6">
        <CanariasAnimation className="w-full h-auto" />
      </div>

      <div className="flex flex-col items-center gap-12 text-center w-full max-w-3xl px-2">
        <h1
          className="text-[4.8vw] sm:text-[4.2vw] md:text-[4.2vw] lg:text-6xl font-thin text-white tracking-tight uppercase whitespace-nowrap"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          Conjuntos Históricos de Canarias
        </h1>

        <div className="flex flex-col gap-0 md:gap-1 mt-16" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed">
            Estamos construyendo algo especial.
          </p>
          <p className="text-white/80 text-[3vw] sm:text-base md:text-lg leading-relaxed whitespace-nowrap">
            Pronto podrás explorar el patrimonio histórico de las islas.
          </p>
        </div>

        <div className="w-16 h-px bg-white/30 -my-8" aria-hidden="true" />

        <p className="text-white/60 text-[3vw] sm:text-sm md:text-base font-bold" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          Sitio web en construcción — próximamente disponible
        </p>
      </div>
    </main>
  )
}
