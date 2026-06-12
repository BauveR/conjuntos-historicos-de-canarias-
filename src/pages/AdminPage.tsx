import { useState } from 'react'
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
const ISLAS = ['Gran Canaria', 'Tenerife', 'Lanzarote', 'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro']
const DIFICULTADES: Dificultad[] = ['Fácil', 'Media', 'Difícil']

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6" style={labelStyle}>
      <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-5">{title}</p>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] tracking-widest uppercase text-stone-400">{children}</label>
  )
}

function Input({ value, onChange, type = 'text', placeholder, className = '' }: {
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300 ${className}`}
    />
  )
}

function Select({ value, onChange, children }: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400 transition-colors"
    >
      {children}
    </select>
  )
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
        success
          ? 'bg-green-600 text-white'
          : 'bg-stone-900 text-white hover:bg-stone-700'
      }`}
    >
      {loading ? '...' : success ? '✓ Guardado' : label}
    </button>
  )
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
    <div className="mx-4 sm:mx-8 mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4" style={labelStyle}>
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

function AltaActividad({ conjuntos }: { conjuntos: Conjunto[] }) {
  const [form, setForm] = useState<ActividadForm>(defaultActividadForm)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof ActividadForm) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }))

  const handleSave = async () => {
    if (!form.titulo || !form.conjuntoId || !form.tematica || !form.fecha || !form.plazas) {
      setError('Completa los campos obligatorios: título, conjunto, temática, fecha y plazas.')
      return
    }
    setError('')
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
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Nueva actividad">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Título *</FieldLabel>
          <Input value={form.titulo} onChange={set('titulo')} placeholder="Nombre de la actividad" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Conjunto *</FieldLabel>
            <Select value={form.conjuntoId} onChange={set('conjuntoId')}>
              <option value="">Seleccionar</option>
              {conjuntos.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre.replace('Conjunto Histórico de ', '')}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Temática *</FieldLabel>
            <Select value={form.tematica} onChange={set('tematica')}>
              <option value="">Seleccionar</option>
              {TEMATICAS.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Fecha *</FieldLabel>
            <Input value={form.fecha} onChange={set('fecha')} type="date" />
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
            <Input value={form.plazas} onChange={set('plazas')} type="number" placeholder="20" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Dificultad</FieldLabel>
            <Select value={form.dificultad} onChange={set('dificultad')}>
              <option value="">Seleccionar</option>
              {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Organizador</FieldLabel>
            <Input value={form.organizador} onChange={set('organizador')} placeholder="Entidad organizadora" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Contacto</FieldLabel>
            <Input value={form.contacto} onChange={set('contacto')} type="email" placeholder="email@ejemplo.es" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Punto de encuentro</FieldLabel>
          <Input value={form.puntoEncuentro} onChange={set('puntoEncuentro')} placeholder="Lugar exacto de inicio" />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Descripción</FieldLabel>
          <Textarea value={form.descripcion} onChange={set('descripcion')} rows={3} />
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Imagen URL</FieldLabel>
          <Input value={form.imagen} onChange={set('imagen')} placeholder="https://..." />
        </div>

        {error && <p className="text-[11px] text-red-500">{error}</p>}

        <SaveButton loading={saving} success={success} onClick={handleSave} label="Crear actividad" />
      </div>
    </SectionCard>
  )
}

// ── Control de Asistentes ─────────────────────────────────────────────────────

function ControlRow({ actividad }: { actividad: Actividad }) {
  const [expanded, setExpanded] = useState(false)
  const [inscritos, setInscritos] = useState<InscritoData[]>([])
  const [loadingInscritos, setLoadingInscritos] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const inscritos_count = actividad.plazas - actividad.plazasDisponibles
  const pct = actividad.plazas > 0 ? Math.round((inscritos_count / actividad.plazas) * 100) : 0

  const fecha = new Date(actividad.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const handleToggle = async () => {
    if (!expanded && inscritos.length === 0 && inscritos_count > 0) {
      setLoadingInscritos(true)
      try {
        const data = await getInscritos(actividad.id)
        setInscritos(data)
      } finally {
        setLoadingInscritos(false)
      }
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
    <div className="border-b border-stone-100 last:border-0 py-3">
      <div className="flex items-start gap-3">
        <button onClick={handleToggle} className="flex-1 text-left min-w-0 cursor-pointer">
          <p className="text-sm text-stone-800 leading-snug line-clamp-1">{actividad.titulo}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">{fecha} · {inscritos_count}/{actividad.plazas} inscritos</p>
          <div className="mt-2 h-1 rounded-full bg-stone-100 overflow-hidden w-full">
            <div className="h-full rounded-full bg-stone-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </button>

        <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
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
        <div className="mt-3 pl-1">
          {loadingInscritos ? (
            <p className="text-[11px] text-stone-400">Cargando...</p>
          ) : inscritos.length === 0 ? (
            <p className="text-[11px] text-stone-300">Sin inscritos aún</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {inscritos.map(i => (
                <div key={i.uid} className="flex items-baseline gap-2">
                  <span className="text-sm text-stone-700">{i.displayName || '—'}</span>
                  <span className="text-[11px] text-stone-400">{i.email}</span>
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

function ConjuntoRow({ conjunto }: { conjunto: Conjunto }) {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<ConjuntoForm>(conjuntoToForm(conjunto))
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (key: keyof ConjuntoForm) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const handleCancel = () => {
    setForm(conjuntoToForm(conjunto))
    setExpanded(false)
  }

  const handleSave = async () => {
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
            <FieldLabel>Nombre</FieldLabel>
            <Input value={form.nombre} onChange={set('nombre')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Municipio</FieldLabel>
              <Input value={form.municipio} onChange={set('municipio')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Isla</FieldLabel>
              <Select value={form.isla} onChange={set('isla')}>
                {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Latitud</FieldLabel>
              <Input value={form.lat} onChange={set('lat')} type="number" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Longitud</FieldLabel>
              <Input value={form.lng} onChange={set('lng')} type="number" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Imagen URL</FieldLabel>
            <Input value={form.imagen} onChange={set('imagen')} />
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

function NuevoConjunto() {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState<ConjuntoForm>({
    nombre: '', municipio: '', isla: '', imagen: '', descripcion: '',
    lat: '', lng: '', fundacion: '', declaraciones: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (key: keyof ConjuntoForm) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  const handleSave = async () => {
    if (!form.nombre || !form.isla) return
    setSaving(true)
    try {
      await addConjunto(formToConjuntoData(form))
      setForm({ nombre: '', municipio: '', isla: '', imagen: '', descripcion: '', lat: '', lng: '', fundacion: '', declaraciones: '' })
      setExpanded(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone-100">
      <button
        onClick={() => setExpanded(p => !p)}
        className={`flex items-center gap-2 text-[11px] tracking-widest uppercase transition-colors cursor-pointer ${success ? 'text-green-600' : 'text-stone-400 hover:text-stone-700'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {success ? 'Conjunto creado' : 'Nuevo conjunto'}
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nombre *</FieldLabel>
            <Input value={form.nombre} onChange={set('nombre')} placeholder="Conjunto Histórico de..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Municipio</FieldLabel>
              <Input value={form.municipio} onChange={set('municipio')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Isla *</FieldLabel>
              <Select value={form.isla} onChange={set('isla')}>
                <option value="">Seleccionar</option>
                {ISLAS.map(i => <option key={i} value={i}>{i}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Latitud</FieldLabel>
              <Input value={form.lat} onChange={set('lat')} type="number" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Longitud</FieldLabel>
              <Input value={form.lng} onChange={set('lng')} type="number" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Imagen URL</FieldLabel>
            <Input value={form.imagen} onChange={set('imagen')} placeholder="https://..." />
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
      )}
    </div>
  )
}

function GestionConjuntos({ conjuntos }: { conjuntos: Conjunto[] }) {
  return (
    <SectionCard title="Conjuntos históricos">
      <div>
        {conjuntos.length === 0 ? (
          <p className="text-sm text-stone-300 py-4 text-center">Sin conjuntos. Inicializa la base de datos.</p>
        ) : (
          conjuntos.map(c => <ConjuntoRow key={c.id} conjunto={c} />)
        )}
      </div>
      <NuevoConjunto />
    </SectionCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { actividades, conjuntos, dataLoading } = useAppContext()

  return (
    <main className="min-h-screen bg-stone-50 pt-16" style={labelStyle}>

      <div className="px-4 sm:px-8 pt-8 pb-2">
        <p className="text-[10px] tracking-widest uppercase text-stone-400">Panel de administración</p>
      </div>

      {!dataLoading && actividades.length === 0 && <SeedBanner />}

      <div className="px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* Left — Gestión de conjuntos */}
        <div className="order-2 lg:order-1">
          <GestionConjuntos conjuntos={conjuntos} />
        </div>

        {/* Right — Alta + Control */}
        <div className="order-1 lg:order-2 flex flex-col gap-6">
          <AltaActividad conjuntos={conjuntos} />
          <ControlAsistentes actividades={actividades} />
        </div>

      </div>
    </main>
  )
}
