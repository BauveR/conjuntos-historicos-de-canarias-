import {
  collection, doc, setDoc, updateDoc, deleteDoc, getDocs,
  onSnapshot, writeBatch, increment, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Actividad } from '../data/actividades'
import type { Conjunto } from '../data/conjuntos'
import { ACTIVIDADES } from '../data/actividades'
import { CONJUNTOS } from '../data/conjuntos'

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

// ── Inscription ───────────────────────────────────────────────────────────────

export async function inscribirse(
  actividadId: number,
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const batch = writeBatch(db)
  batch.set(
    doc(db, 'users', uid, 'inscripciones', String(actividadId)),
    { inscritoEn: serverTimestamp() },
  )
  batch.set(
    doc(db, 'actividades', String(actividadId), 'inscritos', uid),
    { inscritoEn: serverTimestamp(), email, displayName },
  )
  batch.update(
    doc(db, 'actividades', String(actividadId)),
    { plazasDisponibles: increment(-1) },
  )
  await batch.commit()
}

export async function liberarPlaza(actividadId: number, uid: string): Promise<void> {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'users', uid, 'inscripciones', String(actividadId)))
  batch.delete(doc(db, 'actividades', String(actividadId), 'inscritos', uid))
  batch.update(
    doc(db, 'actividades', String(actividadId)),
    { plazasDisponibles: increment(1) },
  )
  await batch.commit()
}

// ── Actividades CRUD ──────────────────────────────────────────────────────────

export async function addActividad(data: Omit<Actividad, 'id'>): Promise<void> {
  const id = Date.now()
  await setDoc(doc(db, 'actividades', String(id)), { ...data, id })
}

export async function updateActividad(
  id: number,
  data: Partial<Omit<Actividad, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'actividades', String(id)), data as Record<string, unknown>)
}

export async function deleteActividad(id: number): Promise<void> {
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
  const id = Date.now()
  await setDoc(doc(db, 'conjuntos', String(id)), { ...data, id, actividadIds: [] })
}

export async function updateConjunto(
  id: number,
  data: Partial<Omit<Conjunto, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'conjuntos', String(id)), data as Record<string, unknown>)
}

// ── Seed ─────────────────────────────────────────────────────────────────────

export async function seedFirestore(): Promise<void> {
  const snap = await getDocs(collection(db, 'actividades'))
  if (!snap.empty) return

  const batch = writeBatch(db)
  for (const c of CONJUNTOS) {
    batch.set(doc(db, 'conjuntos', String(c.id)), { ...c })
  }
  for (const a of ACTIVIDADES) {
    batch.set(doc(db, 'actividades', String(a.id)), { ...a })
  }
  await batch.commit()
}
