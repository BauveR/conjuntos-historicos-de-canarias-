export type Tematica = string

export type TematicaData = {
  nombre: string
  color: string
}

// Semilla inicial para poblar la colección `tematicas` en Firestore (ver seedFirestore en lib/db.ts)
export const TEMATICAS_SEED = [
  'Arquitectura',
  'Historia local',
  'Patrimonio religioso',
  'Agua y paisaje',
  'Patrimonio marítimo',
  'Fiestas y tradiciones',
  'Arqueología',
  'Personajes históricos',
  'Patrimonio industrial',
  'Patrimonio inmaterial',
] as const

export const TEMATICA_COLORS_SEED: Record<string, string> = {
  'Arquitectura':          '#DAB36D',
  'Historia local':        '#C89145',
  'Patrimonio religioso':  '#B27035',
  'Agua y paisaje':        '#A24A35',
  'Patrimonio marítimo':   '#53664D',
  'Fiestas y tradiciones': '#40608E',
  'Arqueología':           '#2D2E30',
  'Personajes históricos': '#5D5D5D',
  'Patrimonio industrial': '#B39571',
  'Patrimonio inmaterial': '#967955',
}

// Paleta para elegir color al crear una temática nueva desde el admin
export const TEMATICA_COLOR_PALETTE = [
  '#DAB36D', '#C89145', '#B27035', '#A24A35', '#53664D',
  '#40608E', '#2D2E30', '#5D5D5D', '#B39571', '#967955',
  '#8A6D9C', '#4A7C7C', '#C2542F', '#3D5A80', '#7A8450',
] as const

export const DEFAULT_TEMATICA_COLOR = '#8a8a8a'

export function getTematicaColor(nombre: string, tematicas: TematicaData[]): string {
  return tematicas.find(t => t.nombre === nombre)?.color ?? DEFAULT_TEMATICA_COLOR
}
