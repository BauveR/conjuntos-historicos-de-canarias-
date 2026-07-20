import type { VercelRequest, VercelResponse } from '@vercel/node'

const SITE_URL = 'https://conjuntoshistoricosdecanarias.com'
const PROJECT_ID = 'conjuntos-historicos-canarias'
const FALLBACK_IMAGE = 'https://res.cloudinary.com/dvsldhnaa/image/upload/v1781621990/Betancuria_4_conjuntos_historicos_de_canarias_wkus2l.jpg'

type FirestoreValue = { stringValue?: string; integerValue?: string }
type FirestoreDoc = { fields?: Record<string, FirestoreValue> }

function field(doc: FirestoreDoc, key: string): string | undefined {
  const v = doc.fields?.[key]
  return v?.stringValue ?? v?.integerValue
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

async function fetchDoc(collection: string, id: string): Promise<FirestoreDoc | null> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`
  )
  if (!res.ok) return null
  return res.json() as Promise<FirestoreDoc>
}

function formatFecha(fecha: string): string {
  try {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return fecha }
}

function renderHtml({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const i = escapeHtml(image)
  const u = escapeHtml(url)
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>${t}</title>
<meta name="description" content="${d}" />
<link rel="canonical" href="${u}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:image" content="${i}" />
<meta property="og:url" content="${u}" />
<meta property="og:site_name" content="Conjuntos Históricos de Canarias" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${i}" />
</head>
<body>
<img src="${i}" alt="${t}" style="max-width:100%;height:auto" />
<h1>${t}</h1>
<p>${d}</p>
<p><a href="${u}">Ver evento →</a></p>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string
  const url = `${SITE_URL}/actividades/${id}`

  const actividad = id ? await fetchDoc('actividades', id) : null

  if (!actividad) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).send(renderHtml({
      title: 'Conjuntos Históricos de Canarias',
      description: 'Rutas y actividades por los conjuntos históricos de Canarias.',
      image: FALLBACK_IMAGE,
      url: SITE_URL,
    }))
  }

  const titulo    = field(actividad, 'titulo') ?? 'Actividad'
  const imagen    = field(actividad, 'imagen') || FALLBACK_IMAGE
  const fecha     = field(actividad, 'fecha')
  const conjuntoId = field(actividad, 'conjuntoId')
  const cancelada = actividad.fields?.cancelada

  const conjunto = conjuntoId ? await fetchDoc('conjuntos', conjuntoId) : null
  const conjuntoNombre = conjunto ? field(conjunto, 'nombre') : undefined
  const conjuntoIsla   = conjunto ? field(conjunto, 'isla') : undefined

  const partes = [
    fecha ? formatFecha(fecha) : null,
    conjuntoNombre ? `${conjuntoNombre}${conjuntoIsla ? `, ${conjuntoIsla}` : ''}` : null,
  ].filter(Boolean)

  const title = cancelada ? `[Cancelado] ${titulo}` : titulo
  const description = partes.length > 0
    ? partes.join(' · ')
    : 'Ruta y actividad patrimonial en Canarias.'

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600')
  return res.status(200).send(renderHtml({ title, description, image: imagen, url }))
}
