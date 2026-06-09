import { CanariasAnimation } from './components/CanariasAnimation'
import './App.css'

export default function App() {
  return (
    <main
      className="min-h-svh w-full flex flex-col items-center justify-center gap-8 px-4 py-12"
      style={{ background: 'linear-gradient(to bottom, #c36414, #d6a103)' }}
    >
      <div className="w-full max-w-3xl">
        <CanariasAnimation className="w-full h-auto" />
      </div>

      <div className="flex flex-col items-center gap-4 text-center max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Conjuntos Históricos<br className="hidden sm:block" /> de Canarias
        </h1>

        <p className="text-white/80 text-base sm:text-lg leading-relaxed">
          Estamos construyendo algo especial.<br />
          Pronto podrás explorar el patrimonio histórico de las islas.
        </p>

        <div className="w-16 h-px bg-white/30 my-1" aria-hidden="true" />

        <p className="text-white/60 text-sm sm:text-base">
          Sitio web en construcción — próximamente disponible
        </p>
      </div>
    </main>
  )
}
