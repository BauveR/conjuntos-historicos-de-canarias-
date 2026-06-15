import { useState, useEffect } from 'react'
import type React from 'react'
import { Link } from 'react-router-dom'
import type { Actividad, Dificultad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import { TEMATICAS, TEMATICA_COLORS, type Tematica } from '../data/tematicas'
import { ISLAS, DIFICULTADES } from '../data/islas'
import { useDataContext } from '../contexts/DataContext'
import {
  addActividad, cancelActividad, reactivarActividad,
  addConjunto, updateConjunto,
  getInscritos, seedFirestore,
  type InscritoData,
} from '../lib/db'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }
const titleStyle = { fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }
const ACCENT = '#cd6a26'

type AdminSection = 'conjuntos' | 'actividad' | 'asistentes'

// ── Nav config ────────────────────────────────────────────────────────────────

type NavItem = { key: AdminSection; label: string; sublabel: string; Icon: () => React.JSX.Element }

function IconBuilding() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V7l6-4 6 4v14M9 21V12h6v9" />
    </svg>
  )
}

function IconCalendarPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  { key: 'conjuntos',  label: 'Conjuntos',        sublabel: 'Ver y editar',   Icon: IconBuilding     },
  { key: 'actividad',  label: 'Nueva actividad',   sublabel: 'Crear evento',   Icon: IconCalendarPlus },
  { key: 'asistentes', label: 'Eventos',             sublabel: 'Asistentes',     Icon: IconUsers        },
]

// ── Shared UI ─────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] tracking-widest uppercase text-stone-500">{children}</label>
  )
}

function Input({ value, onChange, type = 'text', placeholder, className = '', error = false }: {
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  className?: string
  error?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none transition-colors placeholder:text-stone-300 ${
        error ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-[#595d8d]'
      } ${className}`}
    />
  )
}

function Select({ value, onChange, children, error = false }: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
  error?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none transition-colors ${
        error ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-[#595d8d]'
      }`}
    >
      {children}
    </select>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-[10px] text-red-500 mt-0.5 wrap-break-word">{msg}</p>
}

function Textarea({ value, onChange, rows = 3, placeholder }: {
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-[#595d8d] transition-colors resize-none"
    />
  )
}

function SaveButton({ loading, success, onClick, label = 'Guardar' }: {
  loading: boolean
  success: boolean
  onClick: () => void
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-2.5 rounded-xl text-[11px] tracking-widest uppercase transition-all disabled:opacity-40 cursor-pointer text-white hover:opacity-90"
      style={{ backgroundColor: success ? '#50664d' : '#595d8d' }}
    >
      {loading ? '...' : success ? '✓ Guardado' : label}
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6" style={labelStyle}>
      <p className="text-[10px] tracking-widest uppercase mb-5" style={{ color: ACCENT }}>{title}</p>
      {children}
    </div>
  )
}

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidUrl(v: string): boolean {
  try {
    const url = new URL(v)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch { return false }
}

function isValidContacto(v: string): boolean {
  const clean = v.replace(/[\s.\-()]/g, '')
  if (v.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
  return /^[6-9]\d{8}$/.test(clean)
}

// ── Seed Banner ───────────────────────────────────────────────────────────────

function SeedBanner() {
  const [seeding, setSeeding] = useState(false)
  const [done, setDone] = useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedFirestore()
      setDone(true)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4" style={labelStyle}>
      <div className="flex-1">
        <p className="text-[10px] tracking-widest uppercase text-amber-600 mb-1">Base de datos vacía</p>
        <p className="text-sm text-amber-800">
          {done
            ? 'Base de datos inicializada. Los datos ya están disponibles.'
            : 'Inicializa Firestore con los 26 actividades y 9 conjuntos del catálogo base.'}
        </p>
      </div>
      {!done && (
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-[11px] tracking-widest uppercase hover:bg-amber-700 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {seeding ? '...' : 'Inicializar datos'}
        </button>
      )}
    </div>
  )
}

// ── Alta de Actividad ─────────────────────────────────────────────────────────

type ActividadForm = {
  titulo: string; conjuntoId: string; tematica: string; fecha: string
  hora: string; duracion: string; dificultad: string; plazas: string
  organizador: string; contacto: string; puntoEncuentro: string
  descripcion: string; imagen: string
}

const defaultActividadForm: ActividadForm = {
  titulo: '', conjuntoId: '', tematica: '', fecha: '', hora: '',
  duracion: '', dificultad: 'Fácil', plazas: '', organizador: '',
  contacto: '', puntoEncuentro: '', descripcion: '', imagen: '',
}

const DEFAULT_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg'

type ActividadErrors = Partial<Record<keyof ActividadForm, string>>

export function validateActividad(form: ActividadForm): ActividadErrors {
  const e: ActividadErrors = {}
  const today = new Date().toISOString().split('T')[0]

  if (!form.titulo.trim()) e.titulo = 'Obligatorio'
  else if (form.titulo.trim().length < 5) e.titulo = 'Mínimo 5 caracteres'

  if (!form.conjuntoId) e.conjuntoId = 'Selecciona un conjunto'
  if (!form.tematica)   e.tematica   = 'Selecciona una temática'

  if (!form.fecha) e.fecha = 'Obligatoria'
  else if (form.fecha < today) e.fecha = 'La fecha no puede ser anterior a hoy'

  if (!form.plazas) e.plazas = 'Obligatorio'
  else {
    const n = Number(form.plazas)
    if (!Number.isInteger(n) || n < 1) e.plazas = 'Número entero, mínimo 1'
    else if (n > 500) e.plazas = 'Máximo 500 plazas'
  }

  if (!form.descripcion.trim()) e.descripcion = 'Obligatoria'
  else if (form.descripcion.trim().length < 20) e.descripcion = 'Mínimo 20 caracteres'

  if (form.contacto.trim() && !isValidContacto(form.contacto.trim()))
    e.contacto = 'Email o teléfono español (6/7/8/9 + 8 dígitos)'

  if (form.imagen.trim() && !isValidUrl(form.imagen.trim()))
    e.imagen = 'URL no válida (debe empezar por http:// o https://)'

  return e
}

function AltaActividad({ conjuntos }: { conjuntos: Conjunto[] }) {
  const [form, setForm] = useState<ActividadForm>(defaultActividadForm)
  const [errors, setErrors] = useState<ActividadErrors>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const set = (key: keyof ActividadForm) => (v: string) => {
    setForm(f => ({ ...f, [key]: v }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSave = async () => {
    const errs = validateActividad(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setSaveError('')
    try {
      const plazas = Number(form.plazas)
      await addActividad({
        titulo: form.titulo,
        conjuntoId: Number(form.conjuntoId),
        tematica: form.tematica as Tematica,
        fecha: form.fecha,
        hora: form.hora,
        duracion: form.duracion,
        dificultad: form.dificultad as Dificultad,
        plazas,
        plazasDisponibles: plazas,
        organizador: form.organizador,
        contacto: form.contacto,
        puntoEncuentro: form.puntoEncuentro,
        descripcion: form.descripcion,
        imagen: form.imagen || DEFAULT_IMAGE,
      })
      setForm(defaultActividadForm)
      setErrors({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setSaveError('Error al crear la actividad. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* Left — obligatory fields */}
      <SectionCard title="Datos principales">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Título *</FieldLabel>
            <Input value={form.titulo} onChange={set('titulo')} placeholder="Nombre de la actividad" error={!!errors.titulo} />
            <FieldError msg={errors.titulo} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Conjunto *</FieldLabel>
              <Select value={form.conjuntoId} onChange={set('conjuntoId')} error={!!errors.conjuntoId}>
                <option value="">Seleccionar</option>
                {conjuntos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre.replace('Conjunto Histórico de ', '')}
                  </option>
                ))}
              </Select>
              <FieldError msg={errors.conjuntoId} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Temática *</FieldLabel>
              <Select value={form.tematica} onChange={set('tematica')} error={!!errors.tematica}>
                <option value="">Seleccionar</option>
                {TEMATICAS.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <FieldError msg={errors.tematica} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Fecha *</FieldLabel>
              <Input value={form.fecha} onChange={set('fecha')} type="date" error={!!errors.fecha} />
              <FieldError msg={errors.fecha} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Hora</FieldLabel>
              <Input value={form.hora} onChange={set('hora')} type="time" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Duración</FieldLabel>
              <Input value={form.duracion} onChange={set('duracion')} placeholder="2h 30min" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Plazas *</FieldLabel>
              <Input value={form.plazas} onChange={set('plazas')} type="number" placeholder="20" error={!!errors.plazas} />
              <FieldError msg={errors.plazas} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Dificultad</FieldLabel>
              <Select value={form.dificultad} onChange={set('dificultad')}>
                <option value="">Seleccionar</option>
                {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Right — optional + submit */}
      <SectionCard title="Información adicional">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Organizador</FieldLabel>
              <Input value={form.organizador} onChange={set('organizador')} placeholder="Entidad organizadora" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Contacto</FieldLabel>
              <Input value={form.contacto} onChange={set('contacto')} placeholder="email o 6XXXXXXXX" error={!!errors.contacto} />
              <FieldError msg={errors.contacto} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Punto de encuentro</FieldLabel>
            <Input value={form.puntoEncuentro} onChange={set('puntoEncuentro')} placeholder="Lugar exacto de inicio" />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Descripción *</FieldLabel>
            <Textarea value={form.descripcion} onChange={set('descripcion')} rows={5} />
            <FieldError msg={errors.descripcion} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Imagen URL</FieldLabel>
            <Input value={form.imagen} onChange={set('imagen')} placeholder="https://..." error={!!errors.imagen} />
            <FieldError msg={errors.imagen} />
          </div>

          <SaveButton loading={saving} success={success} onClick={handleSave} label="Crear actividad" />
          {saveError && <p className="text-[10px] text-red-500 text-center">{saveError}</p>}
        </div>
      </SectionCard>

    </div>
  )
}

// ── Eventos y Asistentes ──────────────────────────────────────────────────────

type ActivityCardProps = {
  actividad: Actividad
  selected: boolean
  onClick: () => void
}

function ActivityCard({ actividad, selected, onClick }: ActivityCardProps) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [acting, setActing] = useState(false)
  const [actingError, setActingError] = useState('')

  const count = actividad.plazas - actividad.plazasDisponibles
  const pct   = actividad.plazas > 0 ? Math.round((count / actividad.plazas) * 100) : 0
  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short',
  })
  const isCancelada = !!actividad.cancelada

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActing(true)
    setActingError('')
    try { await cancelActividad(actividad.id) }
    catch { setActingError('Error al cancelar. Inténtalo de nuevo.') }
    finally { setActing(false); setConfirmCancel(false) }
  }

  const handleReactivar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActing(true)
    setActingError('')
    try { await reactivarActividad(actividad.id) }
    catch { setActingError('Error al reactivar. Inténtalo de nuevo.') }
    finally { setActing(false) }
  }

  const plazasLibres = actividad.plazasDisponibles

  return (
    <div
      className={`rounded-xl border transition-colors ${
        selected
          ? 'bg-stone-50'
          : isCancelada
            ? 'border-red-100 bg-red-50/40'
            : 'border-stone-100 hover:border-stone-200 bg-white'
      }`}
      style={{ ...labelStyle, ...(selected ? { borderColor: '#595d8d' } : {}) }}
    >
      {/* Info + barra — clickable */}
      <button onClick={onClick} className="w-full text-left px-4 pt-4 pb-3 cursor-pointer">
        {/* Tematica badge */}
        <span
          className="inline-block mb-2 px-2 py-0.5 rounded-full text-[9px] tracking-widest uppercase text-white font-medium"
          style={{ backgroundColor: isCancelada ? '#d6d3d1' : TEMATICA_COLORS[actividad.tematica] }}
        >
          {actividad.tematica}
        </span>

        <div className="flex items-start gap-2 mb-0.5">
          <p className={`text-sm truncate flex-1 leading-snug ${isCancelada ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
            {actividad.titulo}
          </p>
          {isCancelada && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 text-[9px] tracking-widest uppercase">
              Cancelado
            </span>
          )}
        </div>
        <p className="text-[11px] text-stone-400 mb-3">{fecha}</p>

        <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: isCancelada ? '#d6d3d1' : pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#595d8d',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] tabular-nums">
          <span className="text-stone-500">{count} / {actividad.plazas} inscritos</span>
          {!isCancelada && plazasLibres <= 5 && plazasLibres > 0 && (
            <span className="text-red-400">¡{plazasLibres} libre{plazasLibres !== 1 ? 's' : ''}!</span>
          )}
          {!isCancelada && plazasLibres === 0 && (
            <span className="text-stone-400">Completo</span>
          )}
          {!isCancelada && plazasLibres > 5 && (
            <span className="text-stone-400">{pct}%</span>
          )}
        </div>
      </button>

      {actingError && (
        <p className="px-4 pb-2 text-[10px] text-red-400">{actingError}</p>
      )}

      {/* Acción inferior */}
      <div className="px-4 pt-2 pb-3 border-t border-stone-100">
        {isCancelada ? (
          <button
            onClick={handleReactivar}
            disabled={acting}
            className="text-[10px] tracking-widest uppercase text-stone-300 transition-colors cursor-pointer disabled:opacity-40 hover:text-[#50664d]"
          >
            {acting ? '...' : 'Reactivar evento'}
          </button>
        ) : confirmCancel ? (
          <div className="flex gap-2 items-center">
            <button
              onClick={e => { e.stopPropagation(); setConfirmCancel(false) }}
              className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              No
            </button>
            <button
              onClick={handleCancel}
              disabled={acting}
              className="px-3 py-1 rounded-lg bg-red-500 text-white text-[10px] tracking-widest uppercase hover:bg-red-600 disabled:opacity-40 cursor-pointer"
            >
              {acting ? '...' : 'Sí, cancelar'}
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setConfirmCancel(true) }}
            className="text-[10px] tracking-widest uppercase text-stone-300 hover:text-red-400 transition-colors cursor-pointer"
          >
            Cancelar evento
          </button>
        )}
      </div>
    </div>
  )
}

function ControlAsistentes({ actividades }: { actividades: Actividad[] }) {
  const today    = new Date().toISOString().slice(0, 10)
  const proximas = actividades.filter(a => a.fecha >= today && !a.cancelada).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const pasadas  = actividades.filter(a => a.fecha <  today || !!a.cancelada).sort((a, b) => b.fecha.localeCompare(a.fecha))

  const [showPasadas,      setShowPasadas]      = useState(false)
  const [selectedId,       setSelectedId]       = useState<number | null>(null)
  const [inscritos,        setInscritos]        = useState<InscritoData[]>([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [fetchError,       setFetchError]       = useState<string | null>(null)
  const [fetchedAt,        setFetchedAt]        = useState<{ id: number; count: number } | null>(null)

  const visible            = showPasadas ? pasadas : proximas
  const selectedActividad  = actividades.find(a => a.id === selectedId)
  const selectedCount      = selectedActividad
    ? selectedActividad.plazas - selectedActividad.plazasDisponibles
    : 0
  const selectedFecha      = selectedActividad
    ? new Date(selectedActividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const fetchInscritos = async (id: number, count: number) => {
    setLoadingInscritos(true)
    setFetchError(null)
    try {
      const data = await getInscritos(id)
      setInscritos(data)
      setFetchedAt({ id, count })
    } catch {
      setFetchError('Error al cargar inscritos. Inténtalo de nuevo.')
    } finally {
      setLoadingInscritos(false)
    }
  }

  useEffect(() => {
    if (!selectedId) return
    if (fetchedAt?.id === selectedId && fetchedAt?.count === selectedCount) return
    fetchInscritos(selectedId, selectedCount)
  }, [selectedId, selectedCount])

  const handleSelect = (id: number) =>
    setSelectedId(prev => prev === id ? null : id)

  const tabs = [
    { label: `Próximas (${proximas.length})`, active: !showPasadas, onClick: () => setShowPasadas(false) },
    { label: `Pasadas (${pasadas.length})`,   active: showPasadas,  onClick: () => setShowPasadas(true)  },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Panel de inscritos — arriba, visible al seleccionar un evento */}
      {selectedActividad && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6" style={labelStyle}>
          <div className="flex items-start justify-between mb-5">
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-1">Inscritos</p>
              <p className="text-sm text-stone-800 truncate">{selectedActividad.titulo}</p>
              <p className="text-[11px] text-stone-400 mt-0.5 capitalize">
                {selectedFecha} · {selectedCount} {selectedCount === 1 ? 'inscrito' : 'inscritos'}
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="shrink-0 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-400 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loadingInscritos ? (
            <p className="text-[11px] text-stone-400 py-2">Cargando...</p>
          ) : fetchError ? (
            <p className="text-[11px] text-red-400 py-2">{fetchError}</p>
          ) : inscritos.length === 0 ? (
            <p className="text-[11px] text-stone-300 py-2">Sin inscritos aún</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {inscritos.map(i => (
                <div key={i.uid} className="flex items-center gap-4 py-2.5 min-w-0">
                  <span className="text-sm text-stone-700 truncate flex-1">{i.displayName || '—'}</span>
                  <span className="text-[11px] text-stone-400 truncate shrink-0 max-w-[45%]">{i.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid de eventos */}
      <SectionCard title="Eventos">
        <div className="flex gap-2 mb-5">
          {tabs.map(t => (
            <button
              key={t.label}
              onClick={t.onClick}
              className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-colors border cursor-pointer ${
                t.active ? 'text-white border-transparent' : 'text-stone-400 border-stone-200 hover:border-stone-400'
              }`}
          style={t.active ? { backgroundColor: '#595d8d' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-stone-300 py-4 text-center">Sin actividades</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(a => (
              <ActivityCard
                key={a.id}
                actividad={a}
                selected={a.id === selectedId}
                onClick={() => handleSelect(a.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

    </div>
  )
}

// ── Gestión de Conjuntos ──────────────────────────────────────────────────────

type ConjuntoForm = {
  nombre: string; municipio: string; isla: string; imagen: string
  descripcion: string; lat: string; lng: string; fundacion: string; declaraciones: string
  bibliografia: string
}

function conjuntoToForm(c: Conjunto): ConjuntoForm {
  return {
    nombre: c.nombre, municipio: c.municipio, isla: c.isla,
    imagen: c.imagen, descripcion: c.descripcion,
    lat: String(c.lat), lng: String(c.lng),
    fundacion: c.fundacion ?? '',
    declaraciones: (c.declaraciones ?? []).join(', '),
    bibliografia: (c.bibliografia ?? []).join('\n'),
  }
}

function formToConjuntoData(f: ConjuntoForm): Omit<Conjunto, 'id' | 'actividadIds'> {
  return {
    nombre: f.nombre, municipio: f.municipio, isla: f.isla,
    imagen: f.imagen || DEFAULT_IMAGE, descripcion: f.descripcion,
    lat: Number(f.lat) || 0, lng: Number(f.lng) || 0,
    ...(f.fundacion ? { fundacion: f.fundacion } : {}),
    ...(f.declaraciones.trim()
      ? { declaraciones: f.declaraciones.split(',').map(s => s.trim()).filter(Boolean) }
      : {}),
    ...(f.bibliografia.trim()
      ? { bibliografia: f.bibliografia.split('\n').map(s => s.trim()).filter(Boolean) }
      : {}),
  }
}

type ConjuntoErrors = Partial<Record<keyof ConjuntoForm, string>>

function validateConjunto(form: ConjuntoForm): ConjuntoErrors {
  const e: ConjuntoErrors = {}

  if (!form.nombre.trim()) e.nombre = 'Obligatorio'
  else if (form.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'

  if (!form.municipio.trim()) e.municipio = 'Obligatorio'

  if (!form.isla) e.isla = 'Selecciona una isla'

  if (!form.descripcion.trim()) e.descripcion = 'Obligatoria'
  else if (form.descripcion.trim().length < 10) e.descripcion = 'Mínimo 10 caracteres'

  if (!form.lat.trim()) e.lat = 'Obligatoria'
  else {
    const n = Number(form.lat)
    if (isNaN(n) || n < -90 || n > 90) e.lat = 'Entre -90 y 90'
  }
  if (!form.lng.trim()) e.lng = 'Obligatoria'
  else {
    const n = Number(form.lng)
    if (isNaN(n) || n < -180 || n > 180) e.lng = 'Entre -180 y 180'
  }

  if (form.imagen.trim() && !isValidUrl(form.imagen.trim()))
    e.imagen = 'URL no válida (debe empezar por http:// o https://)'

  return e
}

function ConjuntoRow({ conjunto }: { conjunto: Conjunto }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<ConjuntoForm>(conjuntoToForm(conjunto))
  const [errors, setErrors] = useState<ConjuntoErrors>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const set = (key: keyof ConjuntoForm) => (v: string) => {
    setForm(f => ({ ...f, [key]: v }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleCancel = () => {
    setForm(conjuntoToForm(conjunto))
    setErrors({})
    setExpanded(false)
  }

  const handleSave = async () => {
    const errs = validateConjunto(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setSaveError('')
    try {
      await updateConjunto(conjunto.id, formToConjuntoData(form))
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setExpanded(false) }, 1500)
    } catch {
      setSaveError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-stone-800">
            {conjunto.nombre.replace('Conjunto Histórico de ', '')}
          </span>
          <span className="text-[11px] text-stone-400">{conjunto.isla} · {conjunto.municipio}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          className={`text-stone-300 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="pb-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nombre *</FieldLabel>
            <Input value={form.nombre} onChange={set('nombre')} error={!!errors.nombre} />
            <FieldError msg={errors.nombre} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Municipio *</FieldLabel>
              <Input value={form.municipio} onChange={set('municipio')} error={!!errors.municipio} />
              <FieldError msg={errors.municipio} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Isla *</FieldLabel>
              <Select value={form.isla} onChange={set('isla')} error={!!errors.isla}>
                <option value="">Seleccionar</option>
                {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
              </Select>
              <FieldError msg={errors.isla} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Latitud *</FieldLabel>
              <Input value={form.lat} onChange={set('lat')} type="number" error={!!errors.lat} />
              <FieldError msg={errors.lat} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Longitud *</FieldLabel>
              <Input value={form.lng} onChange={set('lng')} type="number" error={!!errors.lng} />
              <FieldError msg={errors.lng} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Imagen URL</FieldLabel>
            <Input value={form.imagen} onChange={set('imagen')} error={!!errors.imagen} />
            <FieldError msg={errors.imagen} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Descripción *</FieldLabel>
            <Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
            <FieldError msg={errors.descripcion} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Fundación</FieldLabel>
              <Input value={form.fundacion} onChange={set('fundacion')} placeholder="s. XVI" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Declaraciones (coma)</FieldLabel>
              <Input value={form.declaraciones} onChange={set('declaraciones')} placeholder="Patrimonio UNESCO" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Bibliografía (una referencia por línea)</FieldLabel>
            <Textarea value={form.bibliografia} onChange={set('bibliografia')} rows={3} placeholder={'Autor, A. (2005). Título. Editorial.\nhttps://...'} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-[11px] tracking-widest uppercase text-stone-400 hover:bg-stone-50 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Cancelar
            </button>
            <div className="flex-1">
              <SaveButton loading={saving} success={success} onClick={handleSave} />
            </div>
          </div>
          {saveError && <p className="text-[10px] text-red-500 text-center">{saveError}</p>}
        </div>
      )}
    </div>
  )
}

function NuevoConjuntoPanel() {
  const [form, setForm] = useState<ConjuntoForm>({
    nombre: '', municipio: '', isla: '', imagen: '', descripcion: '',
    lat: '', lng: '', fundacion: '', declaraciones: '', bibliografia: '',
  })
  const [errors, setErrors] = useState<ConjuntoErrors>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const set = (key: keyof ConjuntoForm) => (v: string) => {
    setForm(f => ({ ...f, [key]: v }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSave = async () => {
    const errs = validateConjunto(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    setSaveError('')
    try {
      await addConjunto(formToConjuntoData(form))
      setForm({ nombre: '', municipio: '', isla: '', imagen: '', descripcion: '', lat: '', lng: '', fundacion: '', declaraciones: '', bibliografia: '' })
      setErrors({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      setSaveError('Error al crear el conjunto. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="+ Nuevo conjunto">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Nombre *</FieldLabel>
          <Input value={form.nombre} onChange={set('nombre')} placeholder="Conjunto Histórico de..." error={!!errors.nombre} />
          <FieldError msg={errors.nombre} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Municipio *</FieldLabel>
            <Input value={form.municipio} onChange={set('municipio')} error={!!errors.municipio} />
            <FieldError msg={errors.municipio} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Isla *</FieldLabel>
            <Select value={form.isla} onChange={set('isla')} error={!!errors.isla}>
              <option value="">Seleccionar</option>
              {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
            </Select>
            <FieldError msg={errors.isla} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Latitud *</FieldLabel>
            <Input value={form.lat} onChange={set('lat')} type="number" error={!!errors.lat} />
            <FieldError msg={errors.lat} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Longitud *</FieldLabel>
            <Input value={form.lng} onChange={set('lng')} type="number" error={!!errors.lng} />
            <FieldError msg={errors.lng} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Imagen URL</FieldLabel>
          <Input value={form.imagen} onChange={set('imagen')} placeholder="https://..." error={!!errors.imagen} />
          <FieldError msg={errors.imagen} />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Descripción *</FieldLabel>
          <Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
          <FieldError msg={errors.descripcion} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Fundación</FieldLabel>
            <Input value={form.fundacion} onChange={set('fundacion')} placeholder="s. XVI" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Declaraciones (coma)</FieldLabel>
            <Input value={form.declaraciones} onChange={set('declaraciones')} placeholder="Patrimonio UNESCO" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Bibliografía (una referencia por línea)</FieldLabel>
          <Textarea value={form.bibliografia} onChange={set('bibliografia')} rows={3} placeholder={'Autor, A. (2005). Título. Editorial.\nhttps://...'} />
        </div>
        <SaveButton loading={saving} success={success} onClick={handleSave} label="Crear conjunto" />
        {saveError && <p className="text-[10px] text-red-500 text-center">{saveError}</p>}
      </div>
    </SectionCard>
  )
}

function GestionConjuntos({ conjuntos }: { conjuntos: Conjunto[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? conjuntos.filter(c => {
        const q = query.toLowerCase()
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.municipio.toLowerCase().includes(q) ||
          c.isla.toLowerCase().includes(q)
        )
      })
    : conjuntos

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

      {/* Left — list */}
      <SectionCard title="Conjuntos históricos">

        {/* Filter */}
        {conjuntos.length > 0 && (
          <div className="relative mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, municipio o isla…"
              className="w-full border border-stone-200 rounded-xl pl-8 pr-8 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div>
          {conjuntos.length === 0 ? (
            <p className="text-sm text-stone-300 py-4 text-center">Sin conjuntos. Inicializa la base de datos.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-stone-300 py-4 text-center">Sin resultados para «{query}»</p>
          ) : (
            filtered.map(c => <ConjuntoRow key={c.id} conjunto={c} />)
          )}
        </div>
      </SectionCard>

      {/* Right — new conjunto (always visible) */}
      <NuevoConjuntoPanel />

    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ section, setSection }: { section: AdminSection; setSection: (s: AdminSection) => void }) {
  return (
    <aside
      className="hidden sm:flex fixed top-16 left-0 bottom-0 z-40 flex-col sm:w-14 lg:w-55 overflow-hidden"
      style={{ ...labelStyle, backgroundColor: '#595d8d' }}
    >
      {/* Logo row — lg only */}
      <div className="hidden lg:flex items-center gap-3 px-5 h-14 border-b border-white/15 shrink-0">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: '#b19e7b' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 21h18M6 21V7l6-4 6 4v14" />
          </svg>
        </div>
        <span className="text-white/70 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap">
          Administración
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, sublabel, Icon }) => {
          const active = section === key
          return (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex items-center gap-3.5 py-3 px-4 lg:px-5 w-full transition-colors cursor-pointer
                sm:justify-center lg:justify-start
                ${active ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/10'}`}
              style={active ? { backgroundColor: '#b19e7b' } : {}}
            >
              <span className="shrink-0"><Icon /></span>
              <span className="hidden lg:flex flex-col items-start min-w-0">
                <span className="text-[11px] tracking-widest uppercase whitespace-nowrap">{label}</span>
                <span className={`text-[9px] tracking-widest whitespace-nowrap ${active ? 'text-white/70' : 'text-white/30'}`}>
                  {sublabel}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Back to site */}
      <div className="shrink-0 py-3 border-t border-white/15">
        <Link
          to="/"
          className="flex items-center gap-3 py-2.5 px-4 lg:px-5 text-white/40 hover:text-white/80 transition-colors sm:justify-center lg:justify-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="hidden lg:block text-[10px] tracking-widest uppercase whitespace-nowrap">
            Volver al sitio
          </span>
        </Link>
      </div>
    </aside>
  )
}

function MobileTabBar({ section, setSection }: { section: AdminSection; setSection: (s: AdminSection) => void }) {
  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/15 flex items-stretch"
      style={{ ...labelStyle, backgroundColor: '#595d8d' }}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const active = section === key
        return (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors cursor-pointer relative
              ${active ? 'text-white' : 'text-white/50'}`}
          >
            {active && (
              <span
                className="absolute top-0 inset-x-0 h-0.5"
                style={{ backgroundColor: '#b19e7b' }}
              />
            )}
            <Icon />
            <span className="text-[8px] tracking-widest uppercase">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function ContentHeader({ item }: { item: NavItem }) {
  return (
    <div className="bg-white border-b border-stone-100 px-6 sm:px-8 pt-8 pb-7">
      <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: ACCENT }}>
        {item.sublabel}
      </p>
      <h1 className="text-2xl text-stone-900 uppercase tracking-tight" style={titleStyle}>
        {item.label}
      </h1>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { actividades, conjuntos, dataLoading } = useDataContext()
  const [section, setSection] = useState<AdminSection>('conjuntos')

  const currentNav = NAV_ITEMS.find(n => n.key === section)!

  return (
    <div className="min-h-screen bg-stone-50" style={labelStyle}>

      {/* Sidebar (sm+) */}
      <Sidebar section={section} setSection={setSection} />

      {/* Mobile bottom tab bar */}
      <MobileTabBar section={section} setSection={setSection} />

      {/* Content */}
      <div className="pt-16 sm:pl-14 lg:pl-55 pb-16 sm:pb-0 min-h-screen flex flex-col">

        <ContentHeader item={currentNav} />

        <div className="flex-1 px-6 sm:px-8 py-8">

          {!dataLoading && actividades.length === 0 && <SeedBanner />}

          {section === 'conjuntos'  && <GestionConjuntos conjuntos={conjuntos} />}
          {section === 'actividad'  && <AltaActividad conjuntos={conjuntos} />}
          {section === 'asistentes' && <ControlAsistentes actividades={actividades} />}

        </div>
      </div>
    </div>
  )
}
