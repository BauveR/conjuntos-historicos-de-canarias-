import {

  collection, doc, setDoc, updateDoc, getDocs, deleteDoc,
  onSnapshot, writeBatch, runTransaction, increment, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Actividad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import type { TematicaData } from '../data/tematicas'
import { ACTIVIDADES } from '../data/actividades'
import { CONJUNTOS } from '../data/conjuntos'
import { TEMATICAS_SEED, TEMATICA_COLORS_SEED } from '../data/tematicas'

export type InscritoData = {
  uid: string
  email: string
  displayName: string
  inscritoEn: Date | null
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export function subscribeActividades(cb: (data: Actividad[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'actividades'), snap => {
    const items = snap.docs.map(d => ({ ...d.data(), id: Number(d.id) } as Actividad))
    items.sort((a, b) => a.fecha.localeCompare(b.fecha))
    cb(items)
  })
}

export function subscribeConjuntos(cb: (data: Conjunto[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'conjuntos'), snap => {
    const items = snap.docs.map(d => ({ ...d.data(), id: Number(d.id) } as Conjunto))
    items.sort((a, b) => a.id - b.id)
    cb(items)
  })
}

export function subscribeTematicas(cb: (data: TematicaData[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'tematicas'),
    snap => {
      const items = snap.docs.map(d => ({ ...d.data(), nombre: d.id } as TematicaData))
      items.sort((a, b) => a.nombre.localeCompare(b.nombre))
      cb(items)
    },
    // Degradación con gracia: si la colección aún no existe o las rules no están
    // desplegadas, no debe bloquear dataLoading (y con él, ActividadPage) para siempre.
    () => cb([]),
  )
}

// ── Inscription ───────────────────────────────────────────────────────────────

export class SinPlazasError extends Error {
  constructor() { super('SIN_PLAZAS') }
}

export class EventoCanceladoError extends Error {
  constructor() { super('EVENTO_CANCELADO') }
}

export async function inscribirse(
  actividadId: number,
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const actividadRef   = doc(db, 'actividades', String(actividadId))
  const inscripcionRef = doc(db, 'users', uid, 'inscripciones', String(actividadId))
  const inscritoRef    = doc(db, 'actividades', String(actividadId), 'inscritos', uid)

  await runTransaction(db, async tx => {
    const [actSnap, inscripcionSnap] = await Promise.all([
      tx.get(actividadRef),
      tx.get(inscripcionRef),
    ])

    if (inscripcionSnap.exists()) return

    const data = actSnap.data()
    if (data?.cancelada) throw new EventoCanceladoError()
    if ((data?.plazasDisponibles ?? 0) <= 0) throw new SinPlazasError()

    tx.set(inscripcionRef, { inscritoEn: serverTimestamp() })
    tx.set(inscritoRef, { inscritoEn: serverTimestamp(), email, displayName })
    tx.update(actividadRef, { plazasDisponibles: increment(-1) })
  })
}

export class YaLiberadaError extends Error {
  constructor() { super('YA_LIBERADA') }
}

export async function liberarPlaza(actividadId: number, uid: string): Promise<void> {
  const actividadRef   = doc(db, 'actividades', String(actividadId))
  const inscripcionRef = doc(db, 'users', uid, 'inscripciones', String(actividadId))
  const inscritoRef    = doc(db, 'actividades', String(actividadId), 'inscritos', uid)

  await runTransaction(db, async tx => {
    const [inscritoSnap, inscripcionSnap, actSnap] = await Promise.all([
      tx.get(inscritoRef),
      tx.get(inscripcionRef),
      tx.get(actividadRef),
    ])

    // Nada que limpiar en ningún lado
    if (!inscritoSnap.exists() && !inscripcionSnap.exists()) throw new YaLiberadaError()

    // Huérfano: solo existe el doc del usuario — limpiar sin tocar el contador
    if (!inscritoSnap.exists()) {
      tx.delete(inscripcionRef)
      return
    }

    // Caso normal: ambos existen — limpiar y devolver la plaza
    const data = actSnap.data()
    const plazas            = (data?.plazas ?? 0) as number
    const plazasDisponibles = (data?.plazasDisponibles ?? 0) as number

    tx.delete(inscripcionRef)
    tx.delete(inscritoRef)
    tx.update(actividadRef, { plazasDisponibles: Math.min(plazasDisponibles + 1, plazas) })
  })
}

// ── Actividades CRUD ──────────────────────────────────────────────────────────

function randomId(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]
}

export async function addActividad(data: Omit<Actividad, 'id'>): Promise<void> {
  const id = randomId()
  await setDoc(doc(db, 'actividades', String(id)), { ...data, id })
}

export async function updateActividad(
  id: number,
  data: Partial<Omit<Actividad, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'actividades', String(id)), data as Record<string, unknown>)
}

export async function cancelActividad(id: number): Promise<void> {
  await updateDoc(doc(db, 'actividades', String(id)), { cancelada: true })
}

export async function reactivarActividad(id: number): Promise<void> {
  await updateDoc(doc(db, 'actividades', String(id)), { cancelada: false })
}

export async function eliminarActividad(id: number): Promise<void> {
  const inscritosSnap = await getDocs(collection(db, 'actividades', String(id), 'inscritos'))
  for (const inscrito of inscritosSnap.docs) {
    await deleteDoc(doc(db, 'users', inscrito.id, 'inscripciones', String(id)))
    await deleteDoc(inscrito.ref)
  }
  await deleteDoc(doc(db, 'actividades', String(id)))
}

export async function getInscritos(actividadId: number): Promise<InscritoData[]> {
  const snap = await getDocs(
    collection(db, 'actividades', String(actividadId), 'inscritos'),
  )
  return snap.docs.map(d => {
    const data = d.data()
    return {
      uid: d.id,
      email: data.email ?? '',
      displayName: data.displayName ?? '',
      inscritoEn: data.inscritoEn?.toDate?.() ?? null,
    }
  })
}

// ── Conjuntos CRUD ────────────────────────────────────────────────────────────

export async function addConjunto(data: Omit<Conjunto, 'id' | 'actividadIds'>): Promise<void> {
  const id = randomId()
  await setDoc(doc(db, 'conjuntos', String(id)), { ...data, id, actividadIds: [] })
}

export async function updateConjunto(
  id: number,
  data: Partial<Omit<Conjunto, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'conjuntos', String(id)), data as Record<string, unknown>)
}

// ── Temáticas CRUD ────────────────────────────────────────────────────────────

export async function addTematica(nombre: string, color: string): Promise<void> {
  await setDoc(doc(db, 'tematicas', nombre), { nombre, color })
}

export async function deleteTematica(nombre: string): Promise<void> {
  await deleteDoc(doc(db, 'tematicas', nombre))
}

// ── Seed ─────────────────────────────────────────────────────────────────────

export async function seedFirestore(): Promise<void> {
  const [actSnap, temSnap] = await Promise.all([
    getDocs(collection(db, 'actividades')),
    getDocs(collection(db, 'tematicas')),
  ])

  const batch = writeBatch(db)
  let hasWrites = false

  if (actSnap.empty) {
    hasWrites = true
    for (const c of CONJUNTOS) {
      batch.set(doc(db, 'conjuntos', String(c.id)), { ...c })
    }
    for (const a of ACTIVIDADES) {
      batch.set(doc(db, 'actividades', String(a.id)), { ...a, plazasDisponibles: a.plazas })
    }
  }

  if (temSnap.empty) {
    hasWrites = true
    for (const nombre of TEMATICAS_SEED) {
      batch.set(doc(db, 'tematicas', nombre), { nombre, color: TEMATICA_COLORS_SEED[nombre] })
    }
  }

  if (hasWrites) await batch.commit()
}
