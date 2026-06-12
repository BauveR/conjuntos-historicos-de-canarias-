import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ACTIVIDADES } from '../data/actividades'
import { CONJUNTOS } from '../data/conjuntos'
import { TEMATICA_COLORS } from '../data/tematicas'
import { DifficultyDots } from '../components/actividades/DifficultyDots'
import { useAuth } from '../contexts/AuthContext'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }
const serifStyle = { fontFamily: "'Playfair Display', serif" }

export function ActividadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const fromApp = location.key !== 'default'
  const isModal = !!location.state?.background
  const { user } = useAuth()
  const actividad = ACTIVIDADES.find(a => a.id === Number(id))

  if (!actividad) return <Navigate to="/" replace />

  const conjunto = CONJUNTOS.find(c => c.id === actividad.conjuntoId)
  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const plazasOcupadas = actividad.plazas - actividad.plazasDisponibles
  const pct = Math.round((plazasOcupadas / actividad.plazas) * 100)

  return (
    <main className={`${isModal ? 'pt-6' : 'pt-16'} min-h-screen bg-white`}>

      {/* ── Contenedor centrado ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-8">

        {/* Back link — hidden inside modal (close button handles it) */}
        {!isModal && (
          <div className="py-5">
            <button
              onClick={() => fromApp ? navigate(-1) : navigate('/')}
              className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-stone-400 hover:text-stone-700 transition-colors"
              style={labelStyle}
            >
              ← Volver
            </button>
          </div>
        )}

        {/* Title block */}
        <div className="mb-5">
          <span
            className="inline-block px-3 py-1 mb-3 text-white font-bold text-[10px] tracking-widest uppercase rounded-full"
            style={{ ...labelStyle, backgroundColor: TEMATICA_COLORS[actividad.tematica] }}
          >
            {actividad.tematica}
          </span>
          <h1
            className="text-3xl sm:text-4xl font-light text-stone-900 leading-snug"
            style={serifStyle}
          >
            {actividad.titulo}
          </h1>
          {conjunto && (
            <p className="mt-2 text-sm text-stone-400" style={labelStyle}>
              {conjunto.nombre} · {conjunto.isla}
            </p>
          )}
        </div>

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-2xl aspect-[16/7] mb-10">
          <img
            src={actividad.imagen}
            alt={actividad.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body: 2-col on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 pb-16">

          {/* Left */}
          <div className="flex flex-col gap-8">

            {/* Descripción */}
            <p className="text-base text-stone-600 leading-relaxed" style={labelStyle}>
              {actividad.descripcion}
            </p>

            <hr className="border-stone-100" />

            {/* Meta grid */}
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-4" style={labelStyle}>
                Detalles de la actividad
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
                {[
                  { label: 'Fecha', value: fecha },
                  { label: 'Hora', value: actividad.hora },
                  { label: 'Duración', value: actividad.duracion },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>
                      {label}
                    </span>
                    <span className="text-sm text-stone-800" style={labelStyle}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>
                    Dificultad
                  </span>
                  <DifficultyDots dificultad={actividad.dificultad} />
                </div>
              </div>
            </div>

            <hr className="border-stone-100" />

            {/* Ubicación */}
            {conjunto && (
              <div>
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-3" style={labelStyle}>
                  Ubicación
                </p>
                <p className="text-sm text-stone-800" style={labelStyle}>
                  {conjunto.nombre}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5" style={labelStyle}>
                  {conjunto.municipio}, {conjunto.isla}
                </p>
              </div>
            )}
          </div>

          {/* Right: inscription card (sticky) */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-stone-200 p-7 flex flex-col gap-5 shadow-sm">

              {/* Plazas progress */}
              <div>
                <div className="flex justify-between text-[11px] text-stone-500 mb-2" style={labelStyle}>
                  <span>{actividad.plazasDisponibles} plazas disponibles</span>
                  <span>{pct}% ocupado</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-stone-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Fecha resumen */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>
                  Próxima fecha
                </span>
                <span className="text-sm text-stone-800 capitalize" style={labelStyle}>
                  {fecha}
                </span>
                <span className="text-[11px] text-stone-400" style={labelStyle}>
                  {actividad.hora} · {actividad.duracion}
                </span>
              </div>

              {actividad.plazasDisponibles <= 5 && actividad.plazasDisponibles > 0 && (
                <p className="text-[11px] text-red-500" style={labelStyle}>
                  ¡Solo quedan {actividad.plazasDisponibles} plazas!
                </p>
              )}

              <button
                disabled={actividad.plazasDisponibles === 0}
                onClick={() => {
                  if (!user) navigate('/login', { state: { background: location } })
                }}
                className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={labelStyle}
              >
                {actividad.plazasDisponibles === 0 ? 'Sin plazas disponibles' : 'Inscribirme'}
              </button>

              <p className="text-[10px] text-stone-400 text-center" style={labelStyle}>
                Inscripción gratuita · Se requiere confirmación
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
