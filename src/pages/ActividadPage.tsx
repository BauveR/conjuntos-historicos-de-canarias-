import { useEffect, useState } from 'react'
import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ACTIVIDADES } from '../data/actividades'
import { CONJUNTOS } from '../data/conjuntos'
import { TEMATICA_COLORS } from '../data/tematicas'
import { DifficultyDots } from '../components/actividades/DifficultyDots'
import { useAuth } from '../contexts/AuthContext'
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
  const actividad = ACTIVIDADES.find(a => a.id === Number(id))

  const [inscrito, setInscrito] = useState(false)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [liberando, setLiberando] = useState(false)

  const esPasada = actividad ? actividad.fecha < new Date().toISOString().split('T')[0] : false

  const handleLiberar = async () => {
    if (!user || !actividad) return
    setLiberando(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'inscripciones', String(actividad.id)))
      setInscrito(false)
      setConfirmando(false)
    } catch {
      // silently fail
    } finally {
      setLiberando(false)
    }
  }

  useEffect(() => {
    if (!user || !actividad) return
    getDoc(doc(db, 'users', user.uid, 'inscripciones', String(actividad.id)))
      .then(snap => setInscrito(snap.exists()))
      .catch(() => {})
  }, [user, actividad])

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
                <div className="bg-stone-900 px-5 py-3 flex items-center gap-2">
                  <span className="text-green-400 text-sm leading-none">✓</span>
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Inscripción confirmada</span>
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

                {/* Fecha */}
                <div className="px-5 py-3 border-t border-stone-100 flex flex-col gap-0.5">
                  <span className="text-[10px] tracking-widest uppercase text-stone-400">Próxima fecha</span>
                  <span className="text-sm text-stone-800 capitalize">{fecha}</span>
                  <span className="text-[11px] text-stone-400">{actividad.hora} · {actividad.duracion}</span>
                </div>

                {/* Botones */}
                {confirmando ? (
                  <div className="px-5 py-4 border-t border-stone-100 flex flex-col gap-2">
                    <p className="text-[11px] text-stone-500 text-center">¿Liberar tu plaza?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLiberar}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 text-[11px] tracking-widest uppercase hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
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
                      className="w-full py-3 rounded-xl bg-stone-100 text-stone-400 text-[11px] tracking-widest uppercase cursor-not-allowed"
                    >
                      Ya inscrito ✓
                    </button>
                    <button
                      onClick={() => setConfirmando(true)}
                      className="w-full py-2 text-[10px] tracking-widest uppercase text-stone-300 hover:text-red-400 transition-colors cursor-pointer"
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
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Próxima fecha</span>
                <span className="text-sm text-stone-800 capitalize">{fecha}</span>
                <span className="text-[11px] text-stone-400">{actividad.hora} · {actividad.duracion}</span>
              </div>
              {actividad.plazasDisponibles <= 5 && actividad.plazasDisponibles > 0 && (
                <p className="text-[11px] text-red-500">¡Solo quedan {actividad.plazasDisponibles} plazas!</p>
              )}
              <button
                disabled={actividad.plazasDisponibles === 0 || inscribiendo || esPasada}
                onClick={async () => {
                  if (!user) {
                    navigate('/login', { state: { background: location } })
                    return
                  }
                  setInscribiendo(true)
                  try {
                    await setDoc(doc(db, 'users', user.uid, 'inscripciones', String(actividad.id)), {
                      inscritoEn: serverTimestamp(),
                    })
                    setInscrito(true)
                  } catch {
                    // silently fail
                  } finally {
                    setInscribiendo(false)
                  }
                }}
                className="w-full py-3 rounded-xl bg-stone-900 text-white text-[11px] tracking-widest uppercase hover:bg-stone-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {inscribiendo ? '...' : esPasada ? 'Actividad finalizada' : actividad.plazasDisponibles === 0 ? 'Sin plazas disponibles' : 'Inscribirme'}
              </button>
              <p className="text-[10px] text-stone-400 text-center">Inscripción gratuita · Se requiere confirmación</p>
            </div>
          )}

          {/* Detalles */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Detalles de la actividad</p>
            <div className="grid grid-cols-2 gap-y-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Fecha</span>
                <span className="text-sm text-stone-800 capitalize">{fecha}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Hora</span>
                <span className="text-sm text-stone-800">{actividad.hora}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Duración</span>
                <span className="text-sm text-stone-800">{actividad.duracion}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-widest uppercase text-stone-400">Dificultad</span>
                <DifficultyDots dificultad={actividad.dificultad} />
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }

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
                  <div className="px-6 py-4 border-t border-dashed border-stone-200 flex flex-col gap-0.5">
                    <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Punto de encuentro</span>
                    <span className="text-sm text-stone-800 leading-snug" style={labelStyle}>{actividad.puntoEncuentro}</span>
                  </div>

                  {/* Organizador */}
                  <div className="px-6 py-4 border-t border-dashed border-stone-200 flex flex-col gap-0.5">
                    <span className="text-[10px] tracking-widest uppercase text-stone-400" style={labelStyle}>Organizador</span>
                    <span className="text-sm text-stone-800" style={labelStyle}>{actividad.organizador}</span>
                    <a
                      href={`mailto:${actividad.contacto}`}
                      className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors truncate"
                      style={labelStyle}
                    >
                      {actividad.contacto}
                    </a>
                  </div>
                </div>

                {/* Liberar plaza */}
                {confirmando ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-stone-500 text-center" style={labelStyle}>¿Liberar tu plaza?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLiberar}
                        disabled={liberando}
                        className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 text-[11px] tracking-widest uppercase hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
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
                    className="w-full py-2 text-[10px] tracking-widest uppercase text-stone-300 hover:text-red-400 transition-colors cursor-pointer"
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
                  disabled={actividad.plazasDisponibles === 0 || inscribiendo || esPasada}
                  onClick={async () => {
                    if (!user) {
                      navigate('/login', { state: { background: location } })
                      return
                    }
                    setInscribiendo(true)
                    try {
                      await setDoc(doc(db, 'users', user.uid, 'inscripciones', String(actividad.id)), {
                        inscritoEn: serverTimestamp(),
                      })
                      setInscrito(true)
                    } catch {
                      // silently fail
                    } finally {
                      setInscribiendo(false)
                    }
                  }}
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
          </div>

        </div>
      </div>
    </main>
  )
}
