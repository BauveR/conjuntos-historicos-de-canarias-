// Tamaños fijos (a 2x) por contenedor: pocas variantes = más aciertos de caché en CDN y navegador.
const PRESETS = {
  thumb:  { w: 320,  h: 240 },  // miniaturas de carrusel (w-36/w-40, 4:3)
  square: { w: 160,  h: 160 },  // ProfileCardCompact (80×80)
  card:   { w: 800,  h: 600 },  // ActividadCard (grid, 4:3)
  panel:  { w: 1200, h: 525 },  // ConjuntoPanel (40% viewport, 16:7)
  modal:  { w: 1000, h: 667 },  // ActividadPage modal estrecho (3:2)
  hero:   { w: 1600, h: 700 },  // ActividadPage (max-w-5xl, 16:7)
  admin:  { w: 600,  h: 150 },  // previews del formulario admin (h-24)
} as const

export type ImagePreset = keyof typeof PRESETS

function transform(url: string, w: number, h?: number): string {
  if (url.includes('ik.imagekit.io')) {
    const tr = h ? `w-${w},h-${h},fo-auto` : `w-${w}`
    return `${url}${url.includes('?') ? '&' : '?'}tr=${tr}`
  }
  // Transición: URLs de Cloudinary aún presentes en Firestore
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
  }
  return url
}

export function imageUrl(url: string, preset: ImagePreset): string {
  const { w, h } = PRESETS[preset]
  return transform(url, w, h)
}

// Para contenedores de proporción variable: el navegador elige ancho según `sizes`.
export function imageSrcSet(url: string, widths: number[]): string {
  return widths.map(w => `${transform(url, w)} ${w}w`).join(', ')
}
