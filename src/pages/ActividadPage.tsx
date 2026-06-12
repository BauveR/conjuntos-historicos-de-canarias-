import { useEffect, useState } from 'react'
import { useParams, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { TEMATICA_COLORS } from '../data/tematicas'
import { DifficultyDots } from '../components/actividades/DifficultyDots'
import { useAuth } from '../contexts/AuthContext'
import { useAppContext } from '../contexts/AppContext'
import { inscribirse, liberarPlaza, SinPlazasError, YaLiberadaError } from '../lib/db'
import { db } from '../firebase'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }
const serifStyle = { fontFamily: "'Playfair Display', serif" }

export function ActividadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const fromApp = location.key !== 'default'
  const isModal = !!location.state?.background
  const fromPerfil = location.state?.from === 'perfil'
  const { user } = useAuth()
  const { actividades, conjuntos, dataLoading } = useAppContext()
  const actividad = actividades.find(a => a.id === Number(id))

  const [inscrito, setInscrito] = useState(false)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [inscripcionError, setInscripcionError] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [liberando, setLiberando] = useState(false)

  const esPasada = actividad ? actividad.fecha < new Date().toISOString().split('T')[0] : false

  const handleLiberar = async () => {
    if (!user || !actividad) return
    setLiberando(true)
    try {
      await liberarPlaza(actividad.id, user.uid)
      setInscrito(false)
      setConfirmando(false)
    } catch (err) {
      if (err instanceof YaLiberadaError) {
        setInscrito(false)
      }
    } finally {
      setLiberando(false)
    }
  }

  const handleInscribirse = async () => {
    if (!user) {
      navigate('/login', { state: { background: location } })
      return
    }
    if (!actividad) return
    setInscribiendo(true)
    setInscripcionError('')
    try {
      await inscribirse(actividad.id, user.uid, user.email ?? '', user.displayName ?? '')
      setInscrito(true)
    } catch (err) {
      if (err instanceof SinPlazasError) {
        setInscripcionError('Ya no quedan plazas disponibles.')
      } else {
        setInscripcionError('Error al procesar la inscripción. Inténtalo de nuevo.')
      }
    } finally {
      setInscribiendo(false)
    }
  }

  useEffect(() => {
    if (!user || !actividad) return
    getDoc(doc(db, 'users', user.uid, 'inscripciones', String(actividad.id)))
      .then(snap => setInscrito(snap.exists()))
      .catch(() => {})
  }, [user, actividad])

  if (dataLoading) return null
  if (!actividad) return <Navigate to="/" replace />

  const conjunto = conjuntos.find(c => c.id === actividad.conjuntoId)
  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const plazasOcupadas = actividad.plazas - actividad.plazasDisponibles
  const pct = Math.round((plazasOcupadas / actividad.plazas) * 100)

  if (fromPerfil && isModal) {
    return (
      <div className="flex flex-col" style={labelStyle}>

        {/* Cabecera: título + conjunto */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-2">
          <span
            className="w-fit px-2.5 py-0.5 rounded-full text-[9px] tracking-widest uppercase text-white font-bold"
            style={{ backgroundColor: TEMATICA_COLORS[actividad.tematica] }}
          >
            {actividad.tematica}
          </span>
          <h1 className="text-xl font-light text-stone-900 leading-snug" style={serifStyle}>
            {actividad.titulo}
          </h1>
          {conjunto && (
            <p className="text-[11px] text-stone-400">
              {conjunto.nombre} · {conjunto.isla}
            </p>
          )}
        </div>

        {/* Foto */}
        <div className="relative overflow-hidden aspect-[3/2]">
          <img src={actividad.imagen} alt={actividad.titulo} className="w-full h-full object-cover" />
        </div>

        {/* Widget + Detalles */}
        <div className="px-6 py-5 flex flex-col gap-6">

          {/* Widget de inscripción */}
          {inscrito && !esPasada ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden border border-stone-200">

                {/* Header confirmado */}
                <div className="px-5 py-3 flex items-center justify-center gap-2" style={{ backgroundColor: '#50664d' }}>
                  <span className="text-white text-sm leading-none">✓</span>
                  <span className="text-[10px] tracking-widest uppercase text-white/80">Inscripción confirmada</span>
                </div>

                {/* Plazas */}
                <div className="px-5 pt-4 pb-3">
                  <div className="flex justify-between text-[11px] text-stone-500 mb-2">
                    <span>{actividad.plazasDisponibles} plazas disponibles</span>
                    <span>{pct}% ocupado</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full rounded-full bg-stone-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Botones */}
                {confirmando ? (
                  <div className="px-5 py-4 border-t border-stone-100 flex flex-col gap-2">
                    <p className="text-[11px] text-stone-500 text-center">¿Liberar tu plaza?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLiberar}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[11px] tracking-widest uppercase hover:bg-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        {liberando ? '...' : 'Sí, liberar'}
                      </button>
                      <button
                        onClick={() => setConfirmando(false)}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        Mantener
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 border-t border-stone-100 flex flex-col gap-2">
                    <button
                      disabled
                      className="w-full py-3 rounded-xl text-white text-[11px] tracking-widest uppercase cursor-not-allowed opacity-90"
                      style={{ backgroundColor: '#50664d' }}
                    >
                      Ya inscrito ✓
                    </button>
                    <button
                      onClick={() => setConfirmando(true)}
                      className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 text-[10px] tracking-widest uppercase border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Liberar plaza
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-stone-400 text-center">Inscripción gratuita · Se requiere confirmación</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-[11px] text-stone-500 mb-2">
                  <span>{actividad.plazasDisponibles} plazas disponibles</span>
                  <span>{pct}% ocupado</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full bg-stone-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {actividad.plazasDisponibles <= 5 && actividad.plazasDisponibles > 0 && (
                <p className="text-[11px] text-red-500">¡Solo quedan {actividad.plazasDisponibles} plazas!</p>
              )}
              {inscripcionError && (
                <p className="text-[11px] text-red-500">{inscripcionError}</p>
              )}
              <button
                disabled={actividad.plazasDisponibles === 0 || inscribiendo || esPasada}
                onClick={handleInscribirse}
                className="w-full py-3 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {inscribiendo ? '...' : esPasada ? 'Actividad finalizada' : actividad.plazasDisponibles === 0 ? 'Sin plazas disponibles' : 'Inscribirme'}
              </button>
              <p className="text-[10px] text-stone-400 text-center">Inscripción gratuita · Se requiere confirmación</p>
            </div>
          )}

          {/* Detalles — fuente única para fecha, hora, duración, dificultad y punto de encuentro */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Detalles de la actividad</p>
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Fecha</span>
                <span className="text-sm text-stone-800 capitalize wrap-break-word">{fecha}</span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Hora</span>
                <span className="text-sm text-stone-800">{actividad.hora}</span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Duración</span>
                <span className="text-sm text-stone-800">{actividad.duracion}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Dificultad</span>
                <DifficultyDots dificultad={actividad.dificultad} />
              </div>
            </div>
            {actividad.puntoEncuentro && (
              <div className="flex flex-col gap-0.5 mt-5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Punto de encuentro</span>
                <span className="text-sm text-stone-800 leading-snug">{actividad.puntoEncuentro}</span>
              </div>
            )}
            {actividad.organizador && (
              <div className="flex flex-col gap-0.5 mt-5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Organizador</span>
                <span className="text-sm text-stone-800">{actividad.organizador}</span>
                {actividad.contacto && (
                  <a
                    href={`mailto:${actividad.contacto}`}
                    className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {actividad.contacto}
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    )
  }

  return (
    <main className={`${isModal ? 'pt-6' : 'pt-16 min-h-screen'} bg-white`}>

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
          <div className="flex flex-col gap-8 min-w-0">

            {/* Título como cabecera de sección */}
            <div className="flex flex-col gap-3">
              <span
                className="w-fit px-3 py-1 text-white font-bold text-[10px] tracking-widest uppercase rounded-full"
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
            </div>

            {/* Descripción */}
            <p className="text-base text-stone-600 leading-relaxed wrap-break-word" style={labelStyle}>
              {actividad.descripcion}
            </p>

          </div>

          {/* Right: inscription card + ubicación (sticky solo en página completa) */}
          <div className={`${!isModal ? 'lg:sticky lg:top-24' : ''} self-start flex flex-col gap-4`}>

            {inscrito && !esPasada ? (

              /* ── Ticket ── */
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">

                  {/* Header oscuro */}
                  <div className="bg-stone-900 px-6 py-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-base leading-none">✓</span>
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>
                        Inscripción confirmada
                      </span>
                    </div>
                    <span
                      className="w-fit px-2.5 py-0.5 rounded-full text-[9px] tracking-widest uppercase text-white font-bold"
                      style={{ backgroundColor: TEMATICA_COLORS[actividad.tematica] }}
                    >
                      {actividad.tematica}
                    </span>
                    <p className="text-white text-sm leading-snug" style={labelStyle}>
                      {actividad.titulo}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className="px-6 py-4 border-t border-dashed border-stone-200 flex flex-col gap-0.5">
                    <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Fecha</span>
                    <span className="text-sm text-stone-800 capitalize" style={labelStyle}>{fecha}</span>
                    <span className="text-[11px] text-stone-400" style={labelStyle}>{actividad.hora} · {actividad.duracion}</span>
                  </div>

                  {/* Punto de encuentro */}
                  {actividad.puntoEncuentro && (
                    <div className="px-6 py-4 border-t border-dashed border-stone-200 flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Punto de encuentro</span>
                      <span className="text-sm text-stone-800 leading-snug" style={labelStyle}>{actividad.puntoEncuentro}</span>
                    </div>
                  )}

                  {/* Organizador */}
                  {actividad.organizador && (
                    <div className="px-6 py-4 border-t border-dashed border-stone-200 flex flex-col gap-0.5">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Organizador</span>
                      <span className="text-sm text-stone-800" style={labelStyle}>{actividad.organizador}</span>
                      {actividad.contacto && (
                        <a
                          href={`mailto:${actividad.contacto}`}
                          className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors truncate"
                          style={labelStyle}
                        >
                          {actividad.contacto}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Ver mis actividades */}
                <Link
                  to="/perfil"
                  className="w-full py-3.5 rounded-xl text-[11px] tracking-widest uppercase text-white text-center block transition-opacity hover:opacity-90"
                  style={{ ...labelStyle, backgroundColor: '#3f6395' }}
                >
                  Ver mis actividades
                </Link>

                {/* Liberar plaza */}
                {confirmando ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-stone-500 text-center" style={labelStyle}>¿Liberar tu plaza?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLiberar}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[11px] tracking-widest uppercase hover:bg-red-600 transition-colors disabled:opacity-40 cursor-pointer"
                        style={labelStyle}
                      >
                        {liberando ? '...' : 'Sí, liberar'}
                      </button>
                      <button
                        onClick={() => setConfirmando(false)}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-40 cursor-pointer"
                        style={labelStyle}
                      >
                        Mantener
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmando(true)}
                    className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 text-[10px] tracking-widest uppercase border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    style={labelStyle}
                  >
                    Liberar plaza
                  </button>
                )}
              </div>

            ) : (

              /* ── Booking widget ── */
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

                {/* Detalles */}
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-3" style={labelStyle}>
                    Detalles de la actividad
                  </p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Fecha</span>
                      <span className="text-sm text-stone-800 capitalize wrap-break-word" style={labelStyle}>{fecha}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Hora</span>
                      <span className="text-sm text-stone-800" style={labelStyle}>{actividad.hora}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Duración</span>
                      <span className="text-sm text-stone-800" style={labelStyle}>{actividad.duracion}</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Dificultad</span>
                      <DifficultyDots dificultad={actividad.dificultad} />
                    </div>
                  </div>
                </div>

                {actividad.plazasDisponibles <= 5 && actividad.plazasDisponibles > 0 && (
                  <p className="text-[11px] text-red-500" style={labelStyle}>
                    ¡Solo quedan {actividad.plazasDisponibles} plazas!
                  </p>
                )}

                {inscripcionError && (
                  <p className="text-[11px] text-red-500" style={labelStyle}>{inscripcionError}</p>
                )}

                <button
                  disabled={actividad.plazasDisponibles === 0 || inscribiendo || esPasada}
                  onClick={handleInscribirse}
                  className="w-full py-3.5 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={labelStyle}
                >
                  {inscribiendo ? '...' : esPasada ? 'Actividad finalizada' : actividad.plazasDisponibles === 0 ? 'Sin plazas disponibles' : 'Inscribirme'}
                </button>

                <p className="text-[10px] text-stone-400 text-center" style={labelStyle}>
                  Inscripción gratuita · Se requiere confirmación
                </p>
              </div>
            )}

            {/* Ubicación */}
            {conjunto && (
              <div className="rounded-2xl border border-stone-200 p-5 flex flex-col gap-2 shadow-sm" style={labelStyle}>
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 shrink-0">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Ubicación</span>
                </div>
                <p className="text-sm text-stone-800">{conjunto.nombre}</p>
                <p className="text-[11px] text-stone-400">{conjunto.municipio}, {conjunto.isla}</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  )
}
