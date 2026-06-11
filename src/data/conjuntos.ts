export type Conjunto = {
  id: number
  nombre: string
  municipio: string
  isla: string
  imagen: string
  descripcion: string
  actividadIds: number[]
  lat: number
  lng: number
}

export const CONJUNTOS: Conjunto[] = [
  {
    id: 1,
    nombre: 'Conjunto Histórico de La Laguna',
    municipio: 'San Cristóbal de La Laguna',
    isla: 'Tenerife',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg',
    descripcion: 'Ciudad fundada en 1496 y declarada Patrimonio de la Humanidad por la UNESCO en 1999. Su trazado urbano sirvió de modelo para las ciudades coloniales de América.',
    actividadIds: [1, 2, 9],
    lat: 28.4853,
    lng: -16.3161,
  },
  {
    id: 2,
    nombre: 'Conjunto Histórico de Betancuria',
    municipio: 'Betancuria',
    isla: 'Fuerteventura',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg',
    descripcion: 'Primera capital de Fuerteventura, fundada a principios del siglo XV. Conserva un extraordinario patrimonio arquitectónico y religioso en un entorno natural singular.',
    actividadIds: [3],
    lat: 28.4227,
    lng: -14.0583,
  },
  {
    id: 3,
    nombre: 'Conjunto Histórico de Vegueta-Triana',
    municipio: 'Las Palmas de Gran Canaria',
    isla: 'Gran Canaria',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg',
    descripcion: 'Núcleo fundacional de Las Palmas de Gran Canaria, con la Catedral de Santa Ana y la Casa de Colón como joyas de su patrimonio histórico y cultural.',
    actividadIds: [4, 5],
    lat: 28.1024,
    lng: -15.4148,
  },
  {
    id: 4,
    nombre: 'Conjunto Histórico de Garachico',
    municipio: 'Garachico',
    isla: 'Tenerife',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg',
    descripcion: 'Antigua capital comercial de Tenerife, devastada por la erupción volcánica de 1706. Conserva un centro histórico de gran valor con piscinas naturales en la lava volcánica.',
    actividadIds: [6, 8, 10],
    lat: 28.3704,
    lng: -16.7614,
  },
  {
    id: 5,
    nombre: 'Conjunto Histórico de Agüimes',
    municipio: 'Agüimes',
    isla: 'Gran Canaria',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Convento_de_San_Buenaventura_-_Betancuria_-_Fuerteventura.jpg',
    descripcion: 'Villa de origen prehispánico con un casco histórico de arquitectura canaria bien conservado, centrado en la iglesia de San Sebastián y sus calles empedradas.',
    actividadIds: [7],
    lat: 27.9044,
    lng: -15.4477,
  },
]
