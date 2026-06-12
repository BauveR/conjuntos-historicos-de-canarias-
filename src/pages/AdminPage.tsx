import { useState, useEffect } from 'react'
import type React from 'react'
import { Link } from 'react-router-dom'
import type { Actividad, Dificultad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import { TEMATICAS, type Tematica } from '../data/tematicas'
import { useAppContext } from '../contexts/AppContext'
import {
  addActividad, deleteActividad,
  addConjunto, updateConjunto,
  getInscritos, seedFirestore,
  type InscritoData,
} from '../lib/db'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }
const titleStyle = { fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }
const ISLAS = ['Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro']
const DIFICULTADES: Dificultad[] = ['Fácil', 'Media', 'Difícil']
const ACCENT = '#af7537'

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
  { key: 'asistentes', label: 'Asistentes',        sublabel: 'Control',        Icon: IconUsers        },
]

// ── Shared UI ─────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] tracking-widest uppercase text-stone-400">{children}</label>
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
        error ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
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
        error ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
      }`}
    >
      {children}
    </select>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-[10px] text-red-500 mt-0.5">{msg}</p>
}

function Textarea({ value, onChange, rows = 3 }: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors resize-none"
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
      className={`w-full py-2.5 rounded-xl text-[11px] tracking-widest uppercase transition-colors disabled:opacity-40 cursor-pointer ${
        success ? 'bg-green-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-700'
      }`}
    >
      {loading ? '...' : success ? '✓ Guardado' : label}
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6" style={labelStyle}>
      <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-5">{title}</p>
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
  duracion: '', dificultad: '', plazas: '', organizador: '',
  contacto: '', puntoEncuentro: '', descripcion: '', imagen: '',
}

const DEFAULT_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg'

type ActividadErrors = Partial<Record<keyof ActividadForm, string>>

function validateActividad(form: ActividadForm): ActividadErrors {
  const e: ActividadErrors = {}
  const today = new Date().toISOString().split('T')[0]

  if (!form.titulo.trim()) e.titulo = 'Obligatorio'
  else if (form.titulo.trim().length < 5) e.titulo = 'Mínimo 5 caracteres'

  if (!form.conjuntoId) e.conjuntoId = 'Selecciona un conjunto'
  if (!form.tematica)   e.tematica   = 'Selecciona una temática'

  if (!form.fecha) e.fecha = 'Obligatoria'
  else if (form.fecha < today) e.fecha = 'Debe ser una fecha futura'

  if (!form.plazas) e.plazas = 'Obligatorio'
  else {
    const n = Number(form.plazas)
    if (!Number.isInteger(n) || n < 1) e.plazas = 'Mínimo 1 plaza'
    else if (n > 500) e.plazas = 'Máximo 500 plazas'
  }

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

  const set = (key: keyof ActividadForm) => (v: string) => {
    setForm(f => ({ ...f, [key]: v }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSave = async () => {
    const errs = validateActividad(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    try {
      const plazas = Number(form.plazas)
      await addActividad({
        titulo: form.titulo,
        conjuntoId: Number(form.conjuntoId),
        tematica: form.tematica as Tematica,
        fecha: form.fecha,
        hora: form.hora,
        duracion: form.duracion,
        dificultad: (form.dificultad || 'Fácil') as Dificultad,
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
            <FieldLabel>Descripción</FieldLabel>
            <Textarea value={form.descripcion} onChange={set('descripcion')} rows={5} />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Imagen URL</FieldLabel>
            <Input value={form.imagen} onChange={set('imagen')} placeholder="https://..." error={!!errors.imagen} />
            <FieldError msg={errors.imagen} />
          </div>

          <SaveButton loading={saving} success={success} onClick={handleSave} label="Crear actividad" />
        </div>
      </SectionCard>

    </div>
  )
}

// ── Control de Asistentes ─────────────────────────────────────────────────────

function ControlRow({ actividad }: { actividad: Actividad }) {
  const [expanded, setExpanded] = useState(false)
  const [inscritos, setInscritos] = useState<InscritoData[]>([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const inscritos_count = actividad.plazas - actividad.plazasDisponibles
  const pct = actividad.plazas > 0 ? Math.round((inscritos_count / actividad.plazas) * 100) : 0

  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const fetchInscritos = async () => {
    setLoadingInscritos(true)
    try {
      const data = await getInscritos(actividad.id)
      setInscritos(data)
      setFetchedAt(inscritos_count)
    } finally {
      setLoadingInscritos(false)
    }
  }

  // Re-fetch mientras está expandida si el conteo cambió — sin flash de "Sin inscritos"
  useEffect(() => {
    if (!expanded || fetchedAt === inscritos_count) return
    fetchInscritos()
  }, [inscritos_count, expanded])

  const handleToggle = async () => {
    if (!expanded && fetchedAt !== inscritos_count && inscritos_count > 0) {
      await fetchInscritos()
    }
    setExpanded(p => !p)
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await deleteActividad(actividad.id)
    } finally {
      setCancelling(false)
      setConfirmCancel(false)
    }
  }

  return (
    <div className="border-b border-stone-100 last:border-0 py-4">
      <div className="flex items-center gap-4">

        {/* Toggle + info */}
        <button onClick={handleToggle} className="flex-1 text-left min-w-0 cursor-pointer group">
          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-sm text-stone-800 leading-snug line-clamp-1 group-hover:text-stone-600 transition-colors">
              {actividad.titulo}
            </p>
            <span className="text-[10px] tracking-widest text-stone-400 whitespace-nowrap shrink-0">
              {fecha}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#78716c' }} />
            </div>
            <span className="text-[11px] text-stone-400 whitespace-nowrap shrink-0 tabular-nums">
              {inscritos_count}/{actividad.plazas} · {pct}%
            </span>
          </div>
        </button>

        {/* Cancel action */}
        <div className="shrink-0">
          {confirmCancel ? (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setConfirmCancel(false)}
                className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-[10px] tracking-widest uppercase hover:bg-red-600 disabled:opacity-40 cursor-pointer"
              >
                {cancelling ? '...' : 'Sí'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-[10px] tracking-widest uppercase text-stone-300 hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-stone-50">
          {loadingInscritos ? (
            <p className="text-[11px] text-stone-400">Cargando...</p>
          ) : inscritos.length === 0 ? (
            <p className="text-[11px] text-stone-300">Sin inscritos aún</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
              {inscritos.map(i => (
                <div key={i.uid} className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm text-stone-700 truncate">{i.displayName || '—'}</span>
                  <span className="text-[11px] text-stone-400 truncate shrink-0">{i.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ControlAsistentes({ actividades }: { actividades: Actividad[] }) {
  const today = new Date().toISOString().slice(0, 10)
  const proximas = actividades.filter(a => a.fecha >= today).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const pasadas  = actividades.filter(a => a.fecha < today).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const [showPasadas, setShowPasadas] = useState(false)
  const visible = showPasadas ? pasadas : proximas

  return (
    <div>
      <SectionCard title="Control de asistentes">
        <div className="flex gap-2 mb-4">
          {[
            { label: `Próximas (${proximas.length})`, active: !showPasadas, onClick: () => setShowPasadas(false) },
            { label: `Pasadas (${pasadas.length})`, active: showPasadas, onClick: () => setShowPasadas(true) },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase transition-colors border cursor-pointer ${
                tab.active ? 'bg-stone-900 text-white border-stone-900' : 'text-stone-400 border-stone-200 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-stone-300 py-4 text-center">Sin actividades</p>
        ) : (
          visible.map(a => <ControlRow key={a.id} actividad={a} />)
        )}
      </SectionCard>
    </div>
  )
}

// ── Gestión de Conjuntos ──────────────────────────────────────────────────────

type ConjuntoForm = {
  nombre: string; municipio: string; isla: string; imagen: string
  descripcion: string; lat: string; lng: string; fundacion: string; declaraciones: string
}

function conjuntoToForm(c: Conjunto): ConjuntoForm {
  return {
    nombre: c.nombre, municipio: c.municipio, isla: c.isla,
    imagen: c.imagen, descripcion: c.descripcion,
    lat: String(c.lat), lng: String(c.lng),
    fundacion: c.fundacion ?? '',
    declaraciones: (c.declaraciones ?? []).join(', '),
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
  }
}

type ConjuntoErrors = Partial<Record<keyof ConjuntoForm, string>>

function validateConjunto(form: ConjuntoForm): ConjuntoErrors {
  const e: ConjuntoErrors = {}

  if (!form.nombre.trim()) e.nombre = 'Obligatorio'
  else if (form.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres'

  if (!form.isla) e.isla = 'Selecciona una isla'

  if (form.lat.trim()) {
    const n = Number(form.lat)
    if (isNaN(n) || n < -90 || n > 90) e.lat = 'Entre -90 y 90'
  }
  if (form.lng.trim()) {
    const n = Number(form.lng)
    if (isNaN(n) || n < -180 || n > 180) e.lng = 'Entre -180 y 180'
  }

  if (form.imagen.trim() && !isValidUrl(form.imagen.trim()))
    e.imagen = 'URL no válida (debe empezar por https://)'

  return e
}

function ConjuntoRow({ conjunto }: { conjunto: Conjunto }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<ConjuntoForm>(conjuntoToForm(conjunto))
  const [errors, setErrors] = useState<ConjuntoErrors>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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
    try {
      await updateConjunto(conjunto.id, formToConjuntoData(form))
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setExpanded(false) }, 1500)
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
              <FieldLabel>Municipio</FieldLabel>
              <Input value={form.municipio} onChange={set('municipio')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Isla *</FieldLabel>
              <Select value={form.isla} onChange={set('isla')} error={!!errors.isla}>
                {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
              </Select>
              <FieldError msg={errors.isla} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Latitud</FieldLabel>
              <Input value={form.lat} onChange={set('lat')} type="number" error={!!errors.lat} />
              <FieldError msg={errors.lat} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Longitud</FieldLabel>
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
            <FieldLabel>Descripción</FieldLabel>
            <Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
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
        </div>
      )}
    </div>
  )
}

function NuevoConjuntoPanel() {
  const [form, setForm] = useState<ConjuntoForm>({
    nombre: '', municipio: '', isla: '', imagen: '', descripcion: '',
    lat: '', lng: '', fundacion: '', declaraciones: '',
  })
  const [errors, setErrors] = useState<ConjuntoErrors>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (key: keyof ConjuntoForm) => (v: string) => {
    setForm(f => ({ ...f, [key]: v }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSave = async () => {
    const errs = validateConjunto(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    try {
      await addConjunto(formToConjuntoData(form))
      setForm({ nombre: '', municipio: '', isla: '', imagen: '', descripcion: '', lat: '', lng: '', fundacion: '', declaraciones: '' })
      setErrors({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
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
            <FieldLabel>Municipio</FieldLabel>
            <Input value={form.municipio} onChange={set('municipio')} />
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
            <FieldLabel>Latitud</FieldLabel>
            <Input value={form.lat} onChange={set('lat')} type="number" error={!!errors.lat} />
            <FieldError msg={errors.lat} />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Longitud</FieldLabel>
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
          <FieldLabel>Descripción</FieldLabel>
          <Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
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
        <SaveButton loading={saving} success={success} onClick={handleSave} label="Crear conjunto" />
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
      className="hidden sm:flex fixed top-16 left-0 bottom-0 z-40 flex-col bg-stone-950 sm:w-14 lg:w-[220px] overflow-hidden"
      style={labelStyle}
    >
      {/* Logo row — lg only */}
      <div className="hidden lg:flex items-center gap-3 px-5 h-14 border-b border-white/[0.06] shrink-0">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 21h18M6 21V7l6-4 6 4v14" />
          </svg>
        </div>
        <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap">
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
              className={`relative flex items-center gap-3.5 py-3 px-4 lg:px-5 w-full transition-colors cursor-pointer
                sm:justify-center lg:justify-start
                ${active ? 'text-white bg-white/[0.08]' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
            >
              {/* Active left accent */}
              {active && (
                <span
                  className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full"
                  style={{ backgroundColor: ACCENT }}
                />
              )}
              <span className="shrink-0"><Icon /></span>
              <span className="hidden lg:flex flex-col items-start min-w-0">
                <span className="text-[11px] tracking-widest uppercase whitespace-nowrap">{label}</span>
                <span className={`text-[9px] tracking-widest whitespace-nowrap ${active ? 'text-white/40' : 'text-white/20'}`}>
                  {sublabel}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Back to site */}
      <div className="shrink-0 py-3 border-t border-white/[0.06]">
        <Link
          to="/"
          className="flex items-center gap-3 py-2.5 px-4 lg:px-5 text-white/30 hover:text-white/60 transition-colors sm:justify-center lg:justify-start"
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
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-950 border-t border-white/[0.06] flex items-stretch"
      style={labelStyle}
    >
      {NAV_ITEMS.map(({ key, label, Icon }) => {
        const active = section === key
        return (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors cursor-pointer relative
              ${active ? 'text-white' : 'text-white/35'}`}
          >
            {active && (
              <span
                className="absolute top-0 inset-x-4 h-0.5 rounded-b-full"
                style={{ backgroundColor: ACCENT }}
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
    <div className="bg-white border-b border-stone-100 px-6 sm:px-10 pt-8 pb-7">
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
  const { actividades, conjuntos, dataLoading } = useAppContext()
  const [section, setSection] = useState<AdminSection>('conjuntos')

  const currentNav = NAV_ITEMS.find(n => n.key === section)!

  return (
    <div className="min-h-screen bg-stone-50" style={labelStyle}>

      {/* Sidebar (sm+) */}
      <Sidebar section={section} setSection={setSection} />

      {/* Mobile bottom tab bar */}
      <MobileTabBar section={section} setSection={setSection} />

      {/* Content */}
      <div className="pt-16 sm:pl-14 lg:pl-[220px] pb-16 sm:pb-0 min-h-screen flex flex-col">

        <ContentHeader item={currentNav} />

        <div className="flex-1 px-6 sm:px-10 py-8">

          {!dataLoading && actividades.length === 0 && <SeedBanner />}

          {section === 'conjuntos'  && <GestionConjuntos conjuntos={conjuntos} />}
          {section === 'actividad'  && <AltaActividad conjuntos={conjuntos} />}
          {section === 'asistentes' && <ControlAsistentes actividades={actividades} />}

        </div>
      </div>
    </div>
  )
}
