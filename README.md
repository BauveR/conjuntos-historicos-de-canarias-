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
│   └── canarias-01.svg              # SVG islas (7 paths, viewBox 0 0 1920 1080)
├── components/
│   ├── actividades/
│   │   ├── ActividadCard.tsx        # Card tipo Airbnb Experiences con badges de disponibilidad
│   │   ├── ActividadesSection.tsx   # Grid filtrable con useMemo
│   │   ├── ActividadesSlider.tsx    # Slider/grid de tarjetas con toggle de vista
│   │   ├── ActividadesInactivas.tsx # Sección colapsable de actividades sin plazas
│   │   ├── DifficultyDots.tsx       # Indicador de dificultad animado con puntos
│   │   ├── FilterBar.tsx            # Filtros desktop (panel expandible) + mobile (botón → sheet)
│   │   └── FilterSheet.tsx          # Bottom sheet de filtros (portal, Framer Motion)
│   ├── hero/
│   │   ├── HeroSection.tsx          # Hero full-height con imagen parallax y overlay
│   │   └── HeroSplit.tsx            # Hero partido imagen/texto con parallax
│   ├── map/
│   │   ├── ActivityMiniCard.tsx     # Mini tarjeta de actividad para drawers y paneles
│   │   ├── ConjuntoDrawer.tsx       # Portal drawer: bottom sheet mobile / modal desktop
│   │   ├── ConjuntoPanel.tsx        # Panel lateral desktop con info completa del conjunto
│   │   ├── ConjuntoStatBar.tsx      # Barra de datos editoriales (actividades, declaraciones, fundación)
│   │   ├── ConjuntosMap.tsx         # Mapa Leaflet: dots por defecto, labels por isla, flyTo
│   │   ├── IslaFilter.tsx           # Pills de filtro por isla (fuera del mapa, flex-wrap)
│   │   └── MapSection.tsx           # Contenedor de estado del mapa
│   ├── CanariasAnimation.tsx        # SVG animado de las islas (stroke dashoffset)
│   ├── HandTap.tsx                  # Ícono animado con Framer Motion
│   └── Navbar.tsx                   # Navbar responsive con burger, scroll hide/show
├── data/
│   ├── actividades.ts               # Tipo Actividad + 26 mocks
│   ├── conjuntos.ts                 # Tipo Conjunto + 9 conjuntos históricos (sin actividadIds)
│   ├── filters.ts                   # Constantes compartidas: ISLAS, DIFICULTADES
│   └── tematicas.ts                 # 10 temáticas + TEMATICA_COLORS (paleta oficial)
├── hooks/
│   ├── useIsDesktop.ts              # Hook reactivo al breakpoint sm (640px)
│   ├── useParallax.ts               # Hook de parallax con requestAnimationFrame
│   └── useScrollDirection.ts        # Hook hide-on-scroll-down / show-on-scroll-up
├── pages/
│   ├── Home.tsx                     # Hero + Mapa + Sección actividades
│   └── ActividadPage.tsx            # Detalle actividad: layout centrado + card inscripción sticky
├── styles/
│   └── typography.ts                # labelStyle + titleStyle (fuente única compartida)
└── utils/
    └── motion.ts                    # desktopTransition, mobileTransition, sheetVariants
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
  lat: number
  lng: number
  fundacion?: string        // año de fundación (ej. '1496')
  declaraciones?: string[]  // reconocimientos (ej. ['Patrimonio UNESCO'])
}
```

### Actividad
```ts
type Actividad = {
  id: number
  imagen: string
  titulo: string
  conjuntoId: number        // única fuente de verdad de la relación
  descripcion: string
  fecha: string             // ISO "2026-07-15"
  hora: string              // "10:00"
  duracion: string          // "2h 30min"
  dificultad: 'Fácil' | 'Media' | 'Difícil'
  plazas: number
  plazasDisponibles: number
  tematica: Tematica
}
```

> La relación Conjunto ↔ Actividad es **unidireccional**: solo `Actividad.conjuntoId` existe. Los componentes que necesitan actividades de un conjunto filtran directamente `ACTIVIDADES.filter(a => a.conjuntoId === id)`.

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

## Conjuntos históricos

| ID | Conjunto | Isla |
|---|---|---|
| 1 | La Laguna | Tenerife |
| 2 | Betancuria | Fuerteventura |
| 3 | Vegueta-Triana | Gran Canaria |
| 4 | Garachico | Tenerife |
| 5 | Agüimes | Gran Canaria |
| 6 | Arrecife | Lanzarote |
| 7 | Puerto de la Cruz | Tenerife |
| 8 | Las Palmas de GC | Gran Canaria |
| 9 | Santa Cruz de La Palma | La Palma |

---

## Decisiones de arquitectura

- **Única fuente de verdad**: la relación Conjunto ↔ Actividad vive solo en `Actividad.conjuntoId`. Se eliminó `Conjunto.actividadIds[]` para evitar inconsistencias entre arrays paralelos.
- **Constantes compartidas**: `src/styles/typography.ts`, `src/utils/motion.ts` y `src/data/filters.ts` eliminan la duplicación de `labelStyle`, transiciones y listas de islas/dificultades que existían en ~10 ficheros.
- **`useIsDesktop` hook**: único punto de detección del breakpoint sm (640px) para lógica JS, reemplazando múltiples `window.matchMedia` en línea.
- **Portal para drawers**: `ConjuntoDrawer` y `FilterSheet` usan `createPortal → document.body` para quedar por encima del z-index interno de Leaflet.
- **Mapa con `isolation: isolate`**: el wrapper del mapa crea su propio contexto de apilamiento, conteniendo los z-index de Leaflet y evitando que interfieran con la Navbar.
- **Mock data** diseñado para ser intercambiable. Toda la capa de datos vive en `src/data/` — cuando haya backend real, solo cambia esa capa.
- **`TEMATICA_COLORS`** como single source of truth: definido en `tematicas.ts`, importado en cards, mini-cards y páginas.

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
