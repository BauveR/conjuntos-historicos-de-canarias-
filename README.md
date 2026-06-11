# Conjuntos Históricos de Canarias

Plataforma web para descubrir, explorar e inscribirse en actividades culturales vinculadas a los conjuntos históricos protegidos de las siete islas Canarias.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v4 |
| Routing | React Router DOM |
| Animaciones | Framer Motion |
| Mapa | React Leaflet + OpenStreetMap (tiles CartoDB Positron) |

---

## Estructura del proyecto

```
src/
├── assets/
│   └── canarias-01.svg          # SVG islas (7 paths, viewBox 0 0 1920 1080)
├── components/
│   ├── actividades/
│   │   ├── ActividadCard.tsx    # Card tipo Airbnb Experiences con badges de color
│   │   ├── ActividadesSection.tsx # Grid filtrable con useMemo
│   │   └── FilterBar.tsx        # Filtros: temática · isla · conjunto
│   ├── hero/
│   │   └── HeroSplit.tsx        # Sección hero con imagen parallax
│   ├── map/
│   │   ├── ConjuntosMap.tsx     # Mapa Leaflet con markers personalizados y flyTo
│   │   ├── ConjuntoDrawer.tsx   # Portal drawer: bottom sheet mobile / card flotante desktop
│   │   ├── ConjuntoPanel.tsx    # Panel lateral desktop con info del conjunto
│   │   └── MapSection.tsx       # Contenedor de estado del mapa
│   ├── CanariasAnimation.tsx    # SVG animado de las islas (stroke dashoffset)
│   ├── HandTap.tsx              # Ícono animado con Framer Motion
│   └── Navbar.tsx               # Navbar responsive con burger, scroll hide/show
├── data/
│   ├── actividades.ts           # Tipo Actividad + 10 mocks + helpers de consulta
│   ├── conjuntos.ts             # Tipo Conjunto + 5 conjuntos históricos mock
│   └── tematicas.ts             # 10 temáticas + TEMATICA_COLORS (paleta oficial)
├── hooks/
│   └── useScrollDirection.ts    # Hook hide-on-scroll-down / show-on-scroll-up
└── pages/
    ├── Home.tsx                 # Hero + Mapa + Sección actividades
    └── ActividadPage.tsx        # Detalle actividad: layout centrado + card inscripción sticky
```

---

## Modelo de datos

### Conjunto
```ts
type Conjunto = {
  id: number
  nombre: string
  municipio: string
  isla: string
  imagen: string
  descripcion: string
  actividadIds: number[]   // relación bidireccional
  lat: number
  lng: number
}
```

### Actividad
```ts
type Actividad = {
  id: number
  imagen: string
  titulo: string
  conjuntoId: number       // relación bidireccional
  descripcion: string
  fecha: string            // ISO "2026-07-15"
  hora: string             // "10:00"
  duracion: string         // "2h 30min"
  dificultad: 'Fácil' | 'Media' | 'Difícil'
  plazas: number
  plazasDisponibles: number
  tematica: Tematica
}
```

### Helpers
```ts
getActividadesByConjunto(conjuntoId: number): Actividad[]
getConjuntoByActividad(actividadId: number): Conjunto | undefined
```

---

## Temáticas y paleta de colores

| Temática | Color |
|---|---|
| Arquitectura | `#DAB36D` |
| Historia local | `#C89145` |
| Patrimonio religioso | `#B27035` |
| Agua y paisaje | `#A24A35` |
| Patrimonio marítimo | `#53664D` |
| Fiestas y tradiciones | `#40608E` |
| Arqueología | `#2D2E30` |
| Personajes históricos | `#5D5D5D` |
| Patrimonio industrial | `#B39571` |
| Patrimonio inmaterial | `#967955` |

---

## Badges de disponibilidad (ActividadCard)

| Disponibilidad | Color |
|---|---|
| ≥ 60% de plazas libres | Azul |
| 40–59% | Sin badge |
| < 40% y > 10% | Naranja |
| ≤ 10% | Rojo |

---

## Rutas

| Ruta | Componente |
|---|---|
| `/` | `Home` — Hero + Mapa + Actividades |
| `/actividades/:id` | `ActividadPage` — Detalle + inscripción |

---

## Conjuntos históricos (mock)

| ID | Conjunto | Isla |
|---|---|---|
| 1 | La Laguna | Tenerife |
| 2 | Betancuria | Fuerteventura |
| 3 | Vegueta-Triana | Gran Canaria |
| 4 | Garachico | Tenerife |
| 5 | Agüimes | Gran Canaria |

---

## Decisiones de arquitectura

- **Relación bidireccional** entre Conjunto y Actividad: `Conjunto.actividadIds[]` ↔ `Actividad.conjuntoId`. Los helpers actúan como capa de consulta — pensados para ser sustituidos por llamadas a API.
- **Mock data** diseñado para ser intercambiable. Toda la capa de datos vive en `src/data/` — cuando haya backend real, solo cambia esa capa.
- **Portal para ConjuntoDrawer**: el drawer usa `createPortal → document.body` con `z-[9999]` para quedar por encima del z-index interno de Leaflet.
- **TEMATICA_COLORS** como single source of truth: definido en `tematicas.ts`, importado en cards y páginas.

---

## Ramas

| Rama | Descripción |
|---|---|
| `main` | Rama principal estable |
| `construction-page` | En desarrollo — secciones hero, mapa y actividades |

---

## Instalación

```bash
npm install
npm run dev
```
