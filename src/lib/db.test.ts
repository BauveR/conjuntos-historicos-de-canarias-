import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Transaction } from 'firebase/firestore'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../firebase', () => ({ db: {} }))

const mockRunTransaction  = vi.fn()
const mockServerTimestamp = vi.fn(() => ({ _type: 'serverTimestamp' }))
const mockIncrement       = vi.fn((n: number) => n)
const mockDoc             = vi.fn((_db: unknown, ...segments: string[]) => segments.join('/'))
const mockDeleteDoc       = vi.fn()
const mockGetDocs         = vi.fn()
const mockCollection      = vi.fn((_db: unknown, ...segments: string[]) => segments.join('/'))

vi.mock('firebase/firestore', () => ({
  runTransaction:  (...args: unknown[]) => mockRunTransaction(...args),
  serverTimestamp: () => mockServerTimestamp(),
  increment:       (n: number) => mockIncrement(n),
  doc:             (_db: unknown, ...segments: string[]) => mockDoc(_db, ...segments),
  collection:      (_db: unknown, ...segments: string[]) => mockCollection(_db, ...segments),
  getDocs:         (...args: unknown[]) => mockGetDocs(...args),
  onSnapshot:      vi.fn(),
  setDoc:          vi.fn(),
  updateDoc:       vi.fn(),
  deleteDoc:       (...args: unknown[]) => mockDeleteDoc(...args),
  writeBatch:      vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

type DocData = Record<string, unknown>

function makeTx(docs: Record<string, DocData | null>) {
  const tx = {
    get: vi.fn(async (ref: string) => {
      const data = docs[ref] ?? null
      return { exists: () => data !== null, data: () => data }
    }),
    set:    vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  return tx as unknown as Transaction & typeof tx
}

function runTxWith(tx: Transaction) {
  mockRunTransaction.mockImplementation(async (_db: unknown, fn: (tx: Transaction) => Promise<void>) => fn(tx))
}

// ── Import after mocks ────────────────────────────────────────────────────────

const { inscribirse, liberarPlaza, eliminarActividad, SinPlazasError, YaLiberadaError, EventoCanceladoError } =
  await import('./db')

// ── inscribirse ───────────────────────────────────────────────────────────────

describe('inscribirse', () => {
  beforeEach(() => {
    mockRunTransaction.mockReset()
    mockDoc.mockImplementation((_db, ...s) => s.join('/'))
  })

  it('lanza SinPlazasError cuando no quedan plazas', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 20, plazasDisponibles: 0 },
      'users/uid-a/inscripciones/1': null,
    })
    runTxWith(tx)

    await expect(inscribirse(1, 'uid-a', 'a@test.es', 'Usuario A', '611222333'))
      .rejects.toBeInstanceOf(SinPlazasError)

    expect(tx.set).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('lanza SinPlazasError si plazasDisponibles es negativo', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 20, plazasDisponibles: -1 },
      'users/uid-a/inscripciones/1': null,
    })
    runTxWith(tx)

    await expect(inscribirse(1, 'uid-a', 'a@test.es', 'Usuario A', '611222333'))
      .rejects.toBeInstanceOf(SinPlazasError)
  })

  it('lanza EventoCanceladoError si el evento está cancelado', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 20, plazasDisponibles: 10, cancelada: true },
      'users/uid-a/inscripciones/1': null,
    })
    runTxWith(tx)

    await expect(inscribirse(1, 'uid-a', 'a@test.es', 'Usuario A', '611222333'))
      .rejects.toBeInstanceOf(EventoCanceladoError)

    expect(tx.set).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('no escribe nada si el usuario ya está inscrito', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 20, plazasDisponibles: 5 },
      'users/uid-a/inscripciones/1': { inscritoEn: null },
    })
    runTxWith(tx)

    await inscribirse(1, 'uid-a', 'a@test.es', 'Usuario A', '611222333')

    expect(tx.set).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('escribe inscripcion, inscrito y decrementa el contador con plazas disponibles', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 20, plazasDisponibles: 5 },
      'users/uid-a/inscripciones/1': null,
    })
    runTxWith(tx)

    await inscribirse(1, 'uid-a', 'a@test.es', 'Usuario A', '611222333')

    expect(tx.set).toHaveBeenCalledTimes(3)
    expect(tx.update).toHaveBeenCalledTimes(1)

    const updateCall = tx.update.mock.calls[0]
    expect(updateCall[1]).toMatchObject({ plazasDisponibles: -1 })
  })

  it('escribe en las rutas correctas de Firestore', async () => {
    const tx = makeTx({
      'actividades/1':              { plazas: 10, plazasDisponibles: 3 },
      'users/uid-b/inscripciones/1': null,
    })
    runTxWith(tx)

    await inscribirse(1, 'uid-b', 'b@test.es', 'Usuario B', '622333444')

    const setPaths = tx.set.mock.calls.map((c: unknown[]) => c[0])
    expect(setPaths).toContain('users/uid-b/inscripciones/1')
    expect(setPaths).toContain('actividades/1/inscritos/uid-b')
  })
})

// ── liberarPlaza ──────────────────────────────────────────────────────────────

describe('liberarPlaza', () => {
  beforeEach(() => {
    mockRunTransaction.mockReset()
    mockDoc.mockImplementation((_db, ...s) => s.join('/'))
  })

  it('caso normal: borra ambos docs e incrementa el contador', async () => {
    const tx = makeTx({
      'actividades/1/inscritos/uid-a':    { email: 'a@test.es' },
      'users/uid-a/inscripciones/1':      { inscritoEn: null },
      'actividades/1':                    { plazas: 20, plazasDisponibles: 14 },
    })
    runTxWith(tx)

    await liberarPlaza(1, 'uid-a')

    expect(tx.delete).toHaveBeenCalledTimes(2)
    expect(tx.update).toHaveBeenCalledTimes(1)

    const updateCall = tx.update.mock.calls[0]
    expect(updateCall[1]).toMatchObject({ plazasDisponibles: 15 })
  })

  it('caso huérfano: solo existe el doc del usuario — lo borra sin tocar el contador', async () => {
    const tx = makeTx({
      'actividades/1/inscritos/uid-a':    null,
      'users/uid-a/inscripciones/1':      { inscritoEn: null },
      'actividades/1':                    { plazas: 20, plazasDisponibles: 20 },
    })
    runTxWith(tx)

    await liberarPlaza(1, 'uid-a')

    const deletedPaths = tx.delete.mock.calls.map((c: unknown[]) => c[0])
    expect(deletedPaths).toContain('users/uid-a/inscripciones/1')
    expect(deletedPaths).not.toContain('actividades/1/inscritos/uid-a')
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('lanza YaLiberadaError cuando ningún doc existe', async () => {
    const tx = makeTx({
      'actividades/1/inscritos/uid-a': null,
      'users/uid-a/inscripciones/1':   null,
      'actividades/1':                 { plazas: 20, plazasDisponibles: 20 },
    })
    runTxWith(tx)

    await expect(liberarPlaza(1, 'uid-a'))
      .rejects.toBeInstanceOf(YaLiberadaError)

    expect(tx.delete).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('el contador nunca supera el total de plazas', async () => {
    const tx = makeTx({
      'actividades/1/inscritos/uid-a': { email: 'a@test.es' },
      'users/uid-a/inscripciones/1':   { inscritoEn: null },
      'actividades/1':                 { plazas: 20, plazasDisponibles: 20 },
    })
    runTxWith(tx)

    await liberarPlaza(1, 'uid-a')

    const updateCall = tx.update.mock.calls[0]
    expect(updateCall[1]).toMatchObject({ plazasDisponibles: 20 })
  })
})

// ── eliminarActividad ─────────────────────────────────────────────────────────

describe('eliminarActividad', () => {
  beforeEach(() => {
    mockDeleteDoc.mockReset()
    mockGetDocs.mockReset()
    mockDoc.mockImplementation((_db, ...s) => s.join('/'))
    mockCollection.mockImplementation((_db, ...s) => s.join('/'))
  })

  it('sin inscritos: solo borra el documento de la actividad', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] })

    await eliminarActividad(1)

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1)
    expect(mockDeleteDoc).toHaveBeenCalledWith('actividades/1')
  })

  it('con un inscrito: borra inscripcion de usuario, doc inscrito y actividad', async () => {
    const inscritoRef = 'actividades/1/inscritos/uid-a'
    mockGetDocs.mockResolvedValue({ docs: [{ id: 'uid-a', ref: inscritoRef }] })

    await eliminarActividad(1)

    expect(mockDeleteDoc).toHaveBeenCalledTimes(3)
    expect(mockDeleteDoc).toHaveBeenCalledWith('users/uid-a/inscripciones/1')
    expect(mockDeleteDoc).toHaveBeenCalledWith(inscritoRef)
    expect(mockDeleteDoc).toHaveBeenCalledWith('actividades/1')
  })

  it('con varios inscritos: borra todos los docs en el orden correcto', async () => {
    const docs = [
      { id: 'uid-a', ref: 'actividades/1/inscritos/uid-a' },
      { id: 'uid-b', ref: 'actividades/1/inscritos/uid-b' },
    ]
    mockGetDocs.mockResolvedValue({ docs })

    await eliminarActividad(1)

    // 2 inscripciones de usuario + 2 docs de inscritos + 1 actividad
    expect(mockDeleteDoc).toHaveBeenCalledTimes(5)
    expect(mockDeleteDoc).toHaveBeenCalledWith('users/uid-a/inscripciones/1')
    expect(mockDeleteDoc).toHaveBeenCalledWith('users/uid-b/inscripciones/1')
    expect(mockDeleteDoc).toHaveBeenCalledWith('actividades/1')
  })

  it('lee la subcollección correcta de Firestore', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] })

    await eliminarActividad(42)

    expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'actividades', '42', 'inscritos')
  })

  it('la actividad se borra siempre la última', async () => {
    const docs = [
      { id: 'uid-a', ref: 'actividades/1/inscritos/uid-a' },
      { id: 'uid-b', ref: 'actividades/1/inscritos/uid-b' },
    ]
    mockGetDocs.mockResolvedValue({ docs })

    await eliminarActividad(1)

    const calls = mockDeleteDoc.mock.calls.map((c: unknown[]) => c[0])
    expect(calls[calls.length - 1]).toBe('actividades/1')
  })
})
