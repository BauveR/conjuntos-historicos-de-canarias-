import type { Tematica } from './tematicas'
import { CONJUNTOS, type Conjunto } from './conjuntos'

export type Dificultad = 'Fácil' | 'Media' | 'Difícil'

export type Actividad = {
  id: number
  imagen: string
  titulo: string
  conjuntoId: number
  descripcion: string
  fecha: string        // ISO: "2026-07-15"
  hora: string         // "10:00"
  duracion: string     // "2h 30min"
  dificultad: Dificultad
  plazas: number
  plazasDisponibles: number
  tematica: Tematica
}

const IMG = 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg'

export const ACTIVIDADES: Actividad[] = [
  {
    id: 1,
    imagen: IMG,
    titulo: 'Ruta por el centro histórico de La Laguna',
    conjuntoId: 1,
    descripcion: 'Recorrido guiado por las calles del primer núcleo urbano planificado de la colonización española en América. Arquitectura civil y religiosa del siglo XVI.',
    fecha: '2026-07-15',
    hora: '10:00',
    duracion: '2h 30min',
    dificultad: 'Fácil',
    plazas: 20,
    plazasDisponibles: 12,
    tematica: 'Arquitectura',
  },
  {
    id: 2,
    imagen: IMG,
    titulo: 'Personajes que forjaron La Laguna',
    conjuntoId: 1,
    descripcion: 'Visita dramatizada con actores que dan vida a figuras históricas clave de la ciudad: religiosos, conquistadores y pensadores que marcaron la historia canaria.',
    fecha: '2026-07-22',
    hora: '18:00',
    duracion: '1h 30min',
    dificultad: 'Fácil',
    plazas: 15,
    plazasDisponibles: 8,
    tematica: 'Personajes históricos',
  },
  {
    id: 3,
    imagen: IMG,
    titulo: 'El convento y la fe en Betancuria',
    conjuntoId: 2,
    descripcion: 'Visita al Convento de San Buenaventura y la iglesia de Santa María de Betancuria. Historia del catolicismo en la primera capital majorera.',
    fecha: '2026-08-05',
    hora: '11:00',
    duracion: '2h',
    dificultad: 'Fácil',
    plazas: 18,
    plazasDisponibles: 18,
    tematica: 'Patrimonio religioso',
  },
  {
    id: 4,
    imagen: IMG,
    titulo: 'Vegueta: raíces de Las Palmas',
    conjuntoId: 3,
    descripcion: 'Recorrido por el barrio fundacional de Las Palmas: la Catedral de Santa Ana, la Plaza de Santa Ana y la Casa de Colón, testigos de cinco siglos de historia.',
    fecha: '2026-07-18',
    hora: '09:30',
    duracion: '3h',
    dificultad: 'Fácil',
    plazas: 25,
    plazasDisponibles: 10,
    tematica: 'Historia local',
  },
  {
    id: 5,
    imagen: IMG,
    titulo: 'Arqueología urbana en Vegueta',
    conjuntoId: 3,
    descripcion: 'Taller con arqueólogos que trabajan en las excavaciones del subsuelo de Vegueta. Descubrimiento de los yacimientos prehispánicos bajo la ciudad colonial.',
    fecha: '2026-08-12',
    hora: '10:00',
    duracion: '2h',
    dificultad: 'Media',
    plazas: 12,
    plazasDisponibles: 4,
    tematica: 'Arqueología',
  },
  {
    id: 6,
    imagen: IMG,
    titulo: 'Garachico y el mar: memoria portuaria',
    conjuntoId: 4,
    descripcion: 'Historia del puerto natural de Garachico, epicentro del comercio atlántico del siglo XVII antes de ser sepultado por la lava. Tradición marinera y pesca artesanal.',
    fecha: '2026-07-30',
    hora: '17:00',
    duracion: '2h',
    dificultad: 'Fácil',
    plazas: 20,
    plazasDisponibles: 15,
    tematica: 'Patrimonio marítimo',
  },
  {
    id: 7,
    imagen: IMG,
    titulo: 'Agüimes: fiesta y tradición viva',
    conjuntoId: 5,
    descripcion: 'Inmersión en las fiestas patronales de Agüimes y sus tradiciones populares. Folklore, gastronomía y artesanía local en el corazón del casco histórico.',
    fecha: '2026-08-20',
    hora: '11:00',
    duracion: '3h 30min',
    dificultad: 'Fácil',
    plazas: 30,
    plazasDisponibles: 22,
    tematica: 'Fiestas y tradiciones',
  },
  {
    id: 8,
    imagen: IMG,
    titulo: 'El agua en Garachico: fuentes, aljibes y canales',
    conjuntoId: 4,
    descripcion: 'Recorrido por el sistema hidráulico histórico de Garachico: fuentes coloniales, aljibes subterráneos y la red de canales que abastecía la villa antes de la erupción de 1706.',
    fecha: '2026-09-03',
    hora: '09:00',
    duracion: '2h',
    dificultad: 'Fácil',
    plazas: 16,
    plazasDisponibles: 16,
    tematica: 'Agua y paisaje',
  },
  {
    id: 9,
    imagen: IMG,
    titulo: 'Molinos y almazaras de La Laguna',
    conjuntoId: 1,
    descripcion: 'Visita a los molinos harineros y almazaras de aceite del entorno de La Laguna. Historia de la industria agroalimentaria canaria desde el siglo XVI hasta el XIX.',
    fecha: '2026-09-10',
    hora: '10:30',
    duracion: '2h 30min',
    dificultad: 'Fácil',
    plazas: 20,
    plazasDisponibles: 3,
    tematica: 'Patrimonio industrial',
  },
  {
    id: 10,
    imagen: IMG,
    titulo: 'El silbo gomero y la memoria oral de Canarias',
    conjuntoId: 4,
    descripcion: 'Taller sobre el silbo gomero y otras tradiciones orales inmateriales de Canarias. Demostración en vivo y práctica guiada de este lenguaje silbado declarado Patrimonio Inmaterial de la Humanidad.',
    fecha: '2026-09-18',
    hora: '17:30',
    duracion: '1h 30min',
    dificultad: 'Fácil',
    plazas: 25,
    plazasDisponibles: 0,
    tematica: 'Patrimonio inmaterial',
  },
]

// Helpers de consulta
export function getActividadesByConjunto(conjuntoId: number): Actividad[] {
  return ACTIVIDADES.filter(a => a.conjuntoId === conjuntoId)
}

export function getConjuntoByActividad(actividadId: number): Conjunto | undefined {
  const actividad = ACTIVIDADES.find(a => a.id === actividadId)
  if (!actividad) return undefined
  return CONJUNTOS.find(c => c.id === actividad.conjuntoId)
}
