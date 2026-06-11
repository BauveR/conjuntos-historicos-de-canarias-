import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Conjunto } from '../../data/conjuntos'

const CANARIAS_CENTER: [number, number] = [28.2, -15.8]

const createDotIcon = (faded: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:8px;height:8px;border-radius:50%;
      background:${faded ? '#e7e5e4' : '#ffffff'};
      border:1.5px solid ${faded ? '#d6d3d1' : '#78716c'};
      box-shadow:0 1px 4px rgba(0,0,0,${faded ? '0.06' : '0.15'});
      transform:translateX(-50%) translateY(-50%);
    "></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

const createLabelIcon = (selected: boolean, label: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      display:inline-flex;align-items:center;
      padding:5px 12px;border-radius:9999px;
      background:${selected ? '#1c1917' : '#ffffff'};
      border:1.5px solid ${selected ? '#1c1917' : '#78716c'};
      box-shadow:0 2px 10px rgba(0,0,0,${selected ? '0.35' : '0.18'});
      font-family:'Open Sans',sans-serif;font-size:11px;
      font-weight:${selected ? '700' : '500'};
      color:${selected ? '#ffffff' : '#1c1917'};
      white-space:nowrap;cursor:pointer;
      transform:translateX(-50%) translateY(-50%);
      transition:background 0.15s,box-shadow 0.15s;
    ">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })

function getIcon(c: Conjunto, selectedId: number | null, selectedIsla: string | null) {
  const isSelected = c.id === selectedId
  const label = c.nombre.replace('Conjunto Histórico de ', '')

  // Selected marker always shows its label regardless of island filter
  if (isSelected) return createLabelIcon(true, label)

  if (selectedIsla === null) {
    // Overview: plain dots for all
    return createDotIcon(false)
  }

  // Island filter active: label for matching island, faded dot for others
  return c.isla === selectedIsla ? createLabelIcon(false, label) : createDotIcon(true)
}

function FlyTo({ conjunto }: { conjunto: Conjunto | null }) {
  const map = useMap()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (conjunto) map.flyTo([conjunto.lat, conjunto.lng], 11, { duration: 1.2 })
  }, [conjunto, map])
  return null
}

function FlyToIsla({ isla, conjuntos }: { isla: string | null; conjuntos: Conjunto[] }) {
  const map = useMap()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }

    if (!isla) {
      const zoom = window.matchMedia('(min-width: 640px)').matches ? 8 : 6
      map.flyTo(CANARIAS_CENTER, zoom, { duration: 1.2 })
      return
    }

    const pts = conjuntos.filter(c => c.isla === isla)
    if (pts.length === 0) return

    if (pts.length === 1) {
      map.flyTo([pts[0].lat, pts[0].lng], 12, { duration: 1.2 })
    } else {
      const lats = pts.map(c => c.lat)
      const lngs = pts.map(c => c.lng)
      const bounds = L.latLngBounds(
        [Math.min(...lats) - 0.08, Math.min(...lngs) - 0.08],
        [Math.max(...lats) + 0.08, Math.max(...lngs) + 0.08]
      )
      map.flyToBounds(bounds, { duration: 1.2, padding: [60, 60] })
    }
  }, [isla, conjuntos, map])
  return null
}

type Props = {
  conjuntos: Conjunto[]
  selectedId: number | null
  selectedIsla: string | null
  onSelect: (id: number) => void
}

export function ConjuntosMap({ conjuntos, selectedId, selectedIsla, onSelect }: Props) {
  const [initialZoom] = useState(() =>
    window.matchMedia('(min-width: 640px)').matches ? 8 : 6
  )

  return (
    <MapContainer
      center={CANARIAS_CENTER}
      zoom={initialZoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      {conjuntos.map(c => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          icon={getIcon(c, selectedId, selectedIsla)}
          eventHandlers={{ click: () => onSelect(c.id) }}
        />
      ))}

      <FlyTo conjunto={conjuntos.find(c => c.id === selectedId) ?? null} />
      <FlyToIsla isla={selectedIsla} conjuntos={conjuntos} />
    </MapContainer>
  )
}
