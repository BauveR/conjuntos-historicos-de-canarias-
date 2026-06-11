import type { Dificultad } from './actividades'

export const ISLAS = [
  'Tenerife', 'Gran Canaria', 'Lanzarote',
  'Fuerteventura', 'La Palma', 'La Gomera', 'El Hierro',
] as const

export const DIFICULTADES: Dificultad[] = ['Fácil', 'Media', 'Difícil']
