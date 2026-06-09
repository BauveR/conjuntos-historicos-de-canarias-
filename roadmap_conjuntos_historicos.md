# Conjuntos Históricos de Canarias — Roadmap de implementación

> Plataforma web responsive a medida · Portal Público + CMS + CRM  
> Stack: React · TypeScript · Vite · Firebase · Leaflet · Cloudinary · Resend · Vercel

---

## Stack tecnológico

| Capa | Tecnología | Plan | Coste |
|---|---|---|---|
| Frontend | React 18 + TypeScript + Vite | — | 0 € |
| Auth + DB + Functions | Firebase (Firestore + Auth + Cloud Functions) | Spark/Blaze | 0 € |
| Mapa | Leaflet + OpenStreetMap | Sin límites | 0 € |
| Imágenes | Cloudinary | Free (25 GB) | 0 € |
| Email | Resend | Free (3.000/mes) | 0 € |
| Deploy | Vercel | Free | 0 € |
| Dominio | .es o .com | — | ~15 €/año |
| Tests | Vitest + React Testing Library | — | 0 € |

---

## Estructura del proyecto

```
conjuntos-historicos-canarias/
├── src/
│   ├── components/
│   │   ├── ui/              # Botones, inputs, badges, modales — átomos reutilizables
│   │   ├── layout/          # Header, Footer, Nav, PageWrapper
│   │   ├── map/             # MapaInteractivo, Marker, Popup, FiltroIslas
│   │   ├── conjuntos/       # FichaConjunto, GaleriaFotos, InfoAdicional
│   │   ├── activities/      # ActividadCard, Calendario, ShareButton
│   │   ├── auth/            # LoginForm, RegisterForm, AuthGuard
│   │   ├── admin/           # ActividadForm, SubidaFoto, ListaInscritos
│   │   └── shared/          # KeepAlive, ErrorBoundary, LoadingSpinner
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── ConjuntoDetalle.tsx   # /conjunto/:id
│   │   ├── Actividades.tsx
│   │   ├── PanelUsuario.tsx
│   │   ├── PanelAdmin.tsx
│   │   ├── Login.tsx
│   │   ├── Registro.tsx
│   │   ├── Privacidad.tsx
│   │   ├── Cookies.tsx
│   │   └── AvisoLegal.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFirestoreCache.ts
│   │   ├── useActividades.ts
│   │   ├── useInscripcion.ts
│   │   └── useSupabaseKeepalive.ts
│   ├── services/
│   │   ├── firebase.ts           # Inicialización + App Check
│   │   ├── conjuntosService.ts
│   │   ├── actividadesService.ts
│   │   ├── inscripcionesService.ts
│   │   └── cloudinaryService.ts
│   ├── lib/
│   │   └── firebaseConfig.ts
│   ├── types/
│   │   └── index.ts              # Todos los tipos TypeScript del proyecto
│   ├── i18n/
│   │   ├── es.json               # Español
│   │   └── gd.json               # Variante canaria
│   ├── utils/
│   │   ├── fechas.ts
│   │   ├── validaciones.ts
│   │   └── share.ts
│   └── tests/
│       ├── setup.ts
│       ├── components/
│       └── hooks/
├── functions/                    # Cloud Functions Firebase
│   ├── src/
│   │   ├── onInscripcion.ts      # Trigger: envía email confirmación
│   │   ├── onCancelacion.ts      # Trigger: envía email cancelación
│   │   └── pingKeepalive.ts      # HTTP: anti-pausa (por si acaso)
│   └── package.json
├── public/
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Colecciones Firestore

```
conjuntos_historicos/          → 46 docs fijos (id = slug del conjunto)
  {id}
    nombre, isla, municipio
    descripcion_corta, descripcion_larga
    coordenadas: GeoPoint
    fotos: string[]            → URLs Cloudinary
    foto_principal: string
    declaracion_ano, info_adicional
    activo: boolean

actividades/                   → creadas por admin
  {id}
    titulo, tipo, descripcion  → máx 500 chars
    fecha_inicio: Timestamp
    punto_encuentro
    cupo_total, cupo_disponible
    conjunto_id, conjunto_nombre   → desnormalizado
    foto_url, foto_cloudinary_id
    contacto_email, contacto_telefono  → solo visible si auth
    creado_por, creado_at
    cancelacion_limite: Timestamp  → fecha_inicio − 48h
    publicada, estado

    inscripciones/             → subcolección
      {uid_usuario}
        usuario_id, usuario_email, usuario_nombre
        inscrito_at, estado, cancelado_at

usuarios/                      → perfil extendido (id = UID Firebase Auth)
  {uid}
    nombre, email, rol, telefono
    creado_at, actividades_ids

    mis_inscripciones/         → subcolección vista rápida
      {actividad_id}
        actividad_titulo, actividad_fecha, actividad_tipo
        conjunto_nombre, foto_url
        contacto_email, contacto_telefono
        estado, cancelacion_limite, inscrito_at
```

---

## Roles y acceso

| Acción | Visitante | Usuario | Admin |
|---|:---:|:---:|:---:|
| Ver home, mapa, fichas | ✓ | ✓ | ✓ |
| Ver actividades (sin contacto) | ✓ | ✓ | ✓ |
| Ver datos de contacto | — | ✓ | ✓ |
| Inscribirse / cancelar | — | ✓ | ✓ |
| Ver panel personal | — | ✓ | ✓ |
| Crear / editar actividades | — | — | ✓ |
| Subir fotos a Cloudinary | — | — | ✓ |
| Ver inscritos por actividad | — | — | ✓ |
| Publicar / despublicar | — | — | ✓ |

---

## Límites de servicios gratuitos

| Servicio | Límite gratuito | Uso estimado proyecto | Margen |
|---|---|---|---|
| Firestore lecturas | 50.000/día | ~4.000/día | 92% libre |
| Firestore escrituras | 20.000/día | ~600/día | 97% libre |
| Firestore storage | 1 GB | ~50 MB | 95% libre |
| Firebase Auth | 50.000 MAU/mes | <500 MAU | 99% libre |
| Cloud Functions | 2.000.000/mes | ~600/mes | 99% libre |
| Resend emails | 3.000/mes · 100/día | ~600/mes | 80% libre |
| Cloudinary storage | 25 GB | ~5 GB | 80% libre |
| Vercel deploy | Ilimitado (free) | — | — |

---

## Fases de implementación

### Fase 0 — Setup y configuración
**Duración estimada: 3–4 días**

- [ ] Crear proyecto Firebase · activar Firestore, Auth, Functions
- [ ] Crear proyecto Vercel · conectar repositorio GitHub
- [ ] Crear cuenta Cloudinary · configurar upload preset unsigned
- [ ] Crear cuenta Resend · verificar dominio · crear plantillas email
- [ ] Inicializar proyecto Vite + React + TypeScript
- [ ] Configurar ESLint + Prettier + Vitest
- [ ] Configurar aliases de rutas (`@/components`, `@/hooks`, etc.)
- [ ] Crear `.env.example` con todas las variables necesarias
- [ ] Configurar Firebase App Check con reCAPTCHA v3
- [ ] Configurar rate limiter en Vercel Edge (middleware.ts)

**Variables de entorno necesarias:**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_RECAPTCHA_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
RESEND_API_KEY                    # solo en Cloud Functions, nunca en frontend
```

---

### Fase 1 — Portal público
**Duración estimada: 2–3 semanas**  
**Entregable: versión navegable sin auth**

#### 1.1 Tipos y servicios base
- [ ] Definir todos los tipos TypeScript (`src/types/index.ts`)
- [ ] Configurar cliente Firebase (`src/lib/firebaseConfig.ts`)
- [ ] Implementar `conjuntosService.ts` (getAll, getById)
- [ ] Implementar `useFirestoreCache.ts` (TTL 24h para conjuntos)
- [ ] Cargar datos de los 46 conjuntos en Firestore

#### 1.2 Componentes UI base
- [ ] Sistema de diseño: colores, tipografía, espaciados (`src/components/ui/`)
- [ ] Button, Input, Badge, Card, Modal, Spinner
- [ ] Header con navegación + selector de idioma
- [ ] Footer con links legales
- [ ] PageWrapper con meta tags Open Graph dinámicos

#### 1.3 Home
- [ ] Sección hero con presentación del proyecto
- [ ] Sección "sobre los conjuntos históricos"
- [ ] Preview de próximas actividades (cards)
- [ ] Acceso al mapa y al calendario

#### 1.4 Mapa interactivo
- [ ] Integrar react-leaflet + OpenStreetMap
- [ ] 46 markers con coordenadas reales
- [ ] Clustering automático (react-leaflet-cluster)
- [ ] Popup con foto en miniatura + nombre + botón a ficha
- [ ] Filtro por isla (8 islas)
- [ ] Responsive táctil

#### 1.5 Fichas de conjuntos (×46)
- [ ] Componente reutilizable `FichaConjunto.tsx`
- [ ] Galería de fotos con Cloudinary (lazy load + WebP)
- [ ] Textos descriptivos + info adicional
- [ ] Localización (mini mapa individual)
- [ ] Share button (Web Share API + Open Graph)
- [ ] Breadcrumb y SEO por ficha
- [ ] Ruta dinámica `/conjunto/:id`

#### 1.6 i18n
- [ ] Configurar react-i18next
- [ ] Archivo `es.json` con todos los textos de la UI
- [ ] Archivo `gd.json` con variante canaria
- [ ] Selector de idioma en header

#### Tests fase 1
- [ ] Test: `FichaConjunto` renderiza con props correctas
- [ ] Test: `useFirestoreCache` sirve desde caché si no ha expirado
- [ ] Test: filtro por isla en el mapa

---

### Fase 2 — Autenticación y sistema de inscripciones
**Duración estimada: 2–3 semanas**  
**Entregable: usuarios pueden registrarse e inscribirse**

#### 2.1 Auth
- [ ] Configurar Firebase Auth (email + Google)
- [ ] `useAuth.ts` hook con contexto global
- [ ] Formulario de registro con validación (React Hook Form + Zod)
- [ ] Formulario de login
- [ ] Recuperación de contraseña
- [ ] `AuthGuard.tsx` para rutas protegidas
- [ ] Creación automática de documento en `usuarios/` al registrarse

#### 2.2 Actividades
- [ ] `actividadesService.ts` (getPublicadas, getById)
- [ ] `ActividadCard.tsx` con foto, fecha, cupo, tipo, botón inscribirse
- [ ] Página de calendario `/actividades`
- [ ] Filtro por tipo (ruta / visita guiada / otra)
- [ ] Indicador de cupo disponible en tiempo real

#### 2.3 Inscripciones
- [ ] `inscripcionesService.ts` con transacción atómica (cupo --)
- [ ] `useInscripcion.ts` hook
- [ ] Flujo completo: card → auth gate → confirmación → email
- [ ] Lógica de cancelación: bloquear si `Date.now() > cancelacion_limite`
- [ ] Actualización de `mis_inscripciones` subcolección

#### 2.4 Panel de usuario
- [ ] Ruta protegida `/mi-panel`
- [ ] Lista de actividades inscritas ordenadas por fecha
- [ ] Estado de cada inscripción (confirmada / cancelada / finalizada)
- [ ] Datos de contacto del organizador (desbloqueados tras auth)
- [ ] Botón cancelar con confirmación y validación 48h

#### 2.5 Cloud Functions — emails
- [ ] Configurar Resend en Cloud Functions
- [ ] `onInscripcion.ts`: trigger onCreate en `inscripciones/` → email confirmación
- [ ] `onCancelacion.ts`: trigger onUpdate estado → email cancelación
- [ ] Plantilla HTML email: nombre actividad + fecha + punto de encuentro + contacto

#### Tests fase 2
- [ ] Test: `LoginForm` muestra error con credenciales inválidas
- [ ] Test: `useInscripcion` no permite inscribirse si cupo = 0
- [ ] Test: botón cancelar deshabilitado si faltan < 48h
- [ ] Test: `AuthGuard` redirige a login si no hay sesión

---

### Fase 3 — Panel de administrador (CMS + CRM)
**Duración estimada: 1–2 semanas**  
**Entregable: admin puede gestionar todo sin tocar código**

#### 3.1 Acceso y seguridad
- [ ] Verificación de rol admin en frontend y Firestore Security Rules
- [ ] Ruta protegida `/admin` (solo rol = "admin")
- [ ] Dashboard con resumen: actividades publicadas, inscritos totales, próximas fechas

#### 3.2 Gestión de actividades
- [ ] Formulario crear actividad (`ActividadForm.tsx`) con todos los campos obligatorios:
  - título, tipo (desplegable), descripción (contador chars, máx 500)
  - fecha + hora, punto de encuentro
  - cupo disponible
  - desplegable de los 46 conjuntos (+ opción "otro")
  - contacto email y teléfono
- [ ] Subida de foto a Cloudinary con progreso + previsualización
- [ ] Si no se sube foto → usa `foto_principal` del conjunto seleccionado
- [ ] Cálculo automático de `cancelacion_limite` (fecha − 48h)
- [ ] Guardar como borrador o publicar directamente
- [ ] Editar / despublicar actividades existentes

#### 3.3 Vista de inscritos
- [ ] Lista de inscritos por actividad con nombre, email, fecha inscripción, estado
- [ ] Indicador de cupo usado vs total

#### 3.4 Gestión de conjuntos
- [ ] Editar textos y fotos de los 46 conjuntos desde el panel
- [ ] Subida de nuevas fotos a Cloudinary

#### Tests fase 3
- [ ] Test: `ActividadForm` no permite enviar sin campos obligatorios
- [ ] Test: descripción trunca a 500 caracteres
- [ ] Test: si no hay foto subida, usa foto del conjunto seleccionado
- [ ] Test: solo usuarios con rol admin ven la ruta /admin

---

### Fase 4 — Pulido, SEO y despliegue
**Duración estimada: 1 semana**

#### 4.1 SEO y rendimiento
- [ ] Meta tags Open Graph dinámicos por página (título, descripción, imagen)
- [ ] Sitemap.xml estático con las 46 fichas
- [ ] Lazy loading de imágenes con Cloudinary (f_auto, q_auto)
- [ ] Code splitting por ruta (React.lazy + Suspense)
- [ ] Lighthouse score > 90 en mobile

#### 4.2 Páginas legales
- [ ] `/privacidad` — Política de privacidad RGPD
- [ ] `/cookies` — Política de cookies
- [ ] `/aviso-legal` — Aviso legal
- [ ] Banner de cookies al primer acceso (localStorage)

#### 4.3 Accesibilidad
- [ ] WCAG 2.1 AA: contraste, foco visible, roles ARIA en mapa y modales
- [ ] Navegación por teclado completa
- [ ] Textos alternativos en todas las imágenes

#### 4.4 Despliegue producción
- [ ] Configurar dominio personalizado en Vercel
- [ ] Variables de entorno en Vercel Dashboard
- [ ] Deploy de Cloud Functions en Firebase
- [ ] Activar Firebase App Check en producción
- [ ] Smoke test completo: registro → inscripción → email → cancelación → email
- [ ] Configurar alertas de presupuesto en Google Cloud (límite 10 €/mes)

#### 4.5 Documentación
- [ ] README con instrucciones de setup local
- [ ] Guía de uso para el administrador (cómo crear actividades, subir fotos)
- [ ] Checklist de mantenimiento mensual

---

## Dependencias del cliente

Estos materiales deben estar listos **antes** de iniciar cada fase:

| Material | Necesario para | Formato |
|---|---|---|
| Textos de los 46 conjuntos | Fase 1 | Google Doc o Word |
| Fotografías de los 46 conjuntos | Fase 1 | JPG/PNG ≥ 1200px ancho |
| Coordenadas de los 46 conjuntos | Fase 1 | Latitud/Longitud o dirección exacta |
| Nombre de dominio elegido | Fase 4 | — |
| Logo e identidad visual | Fase 1 | SVG o PNG transparente |
| Datos de contacto del administrador | Fase 3 | Email y teléfono |

---

## Checklist de seguridad pre-lanzamiento

- [ ] Firebase Security Rules revisadas y testeadas con el emulador
- [ ] `contacto_email` y `contacto_telefono` solo legibles si `auth != null`
- [ ] El campo `rol` solo modificable por Cloud Function, nunca desde el cliente
- [ ] App Check activado — solo peticiones desde el dominio verificado
- [ ] Rate limiter activo en `/api/*` (60 req/min por IP)
- [ ] API keys en variables de entorno, nunca en el código
- [ ] `RESEND_API_KEY` solo en Cloud Functions, nunca en el frontend
- [ ] Cloudinary upload preset configurado como `unsigned` con carpeta restringida
- [ ] Headers de seguridad en Vercel: CSP, HSTS, X-Frame-Options
- [ ] Presupuesto máximo Google Cloud configurado (10 €/mes)

---

## Estimación de plazos

```
Semana 1–2   Fase 0 + Fase 1.1–1.3   Setup + tipos + home
Semana 3–4   Fase 1.4–1.6            Mapa + 46 fichas + i18n
Semana 5–6   Fase 2.1–2.3            Auth + actividades + inscripciones
Semana 7–8   Fase 2.4–2.5            Panel usuario + emails
Semana 9–10  Fase 3                  Panel admin completo
Semana 11    Fase 4.1–4.3            SEO + legal + accesibilidad
Semana 12    Fase 4.4–4.5            Deploy producción + documentación
```

**Hito intermedio (semana 4):** versión en construcción navegable con home + mapa + fichas estáticas · dominio activo en Vercel.

**Entrega final (semana 12):** plataforma completa en producción con todos los módulos funcionales y testeados.

---

*Documento generado: Barcelona, junio 2026*  
*Versión del stack verificada a fecha de generación*
