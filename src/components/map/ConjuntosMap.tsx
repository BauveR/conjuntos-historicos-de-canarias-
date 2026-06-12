import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Conjunto } from '../../data/conjuntos'

const CANARIAS_CENTER: [number, number] = [28.2, -15.8]

let savedMapView: { center: [number, number]; zoom: number } | null = null

function SaveMapView() {
  const map = useMap()
  useEffect(() => {
    const save = () => {
      savedMapView = { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() }
    }
    map.on('moveend', save)
    map.on('zoomend', save)
    return () => { map.off('moveend', save); map.off('zoomend', save) }
  }, [map])
  return null
}

// Manages scroll-wheel zoom gating and first-click activation
function MapActivation({ active, onActivate }: { active: boolean; onActivate: () => void }) {
  const map = useMap()
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate

  useEffect(() => {
    if (active) {
      map.scrollWheelZoom.enable()
      return
    }
    map.scrollWheelZoom.disable()
    const handle = () => onActivateRef.current()
    map.on('click', handle)
    return () => { map.off('click', handle) }
  }, [active, map])

  return null
}

const createDotIcon = (faded: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;
      display:flex;align-items:center;justify-content:center;
      transform:translate(-50%,-50%);
    ">
      <div style="
        width:8px;height:8px;border-radius:50%;
        background:${faded ? '#e7e5e4' : '#af7537'};
        border:1.5px solid ${faded ? '#d6d3d1' : '#af7537'};
        box-shadow:0 1px 4px rgba(0,0,0,${faded ? '0.06' : '0.15'});
      "></div>
    </div>`,
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
      border:1.5px solid ${selected ? '#1c1917' : '#78.2716c'};
      box-shadow:0 2px 10px rgba(0,0,0,${selected ? '0.35' : '0.18.2'});
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

  if (isSelected) return createLabelIcon(true, label)
  if (selectedIsla === null) return createDotIcon(false)
  return c.isla === selectedIsla ? createLabelIcon(false, label) : createDotIcon(true)
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

function FlyTo({ conjunto }: { conjunto: Conjunto | null }) {
  const map = useMap()
  const prev = useRef(conjunto)

  useEffect(() => {
    if (conjunto === prev.current) return
    prev.current = conjunto
    if (conjunto) map.flyTo([conjunto.lat, conjunto.lng], 11, { duration: 1.2 })
  }, [conjunto, map])
  return null
}

function FlyToIsla({ isla, conjuntos }: { isla: string | null; conjuntos: Conjunto[] }) {
  const map = useMap()
  const prev = useRef(isla)

  useEffect(() => {
    if (isla === prev.current) return
    prev.current = isla

    if (!isla) {
      const zoom = window.matchMedia('(min-width: 640px)').matches ? 8.5 : 6
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
  active: boolean
  onSelect: (id: number) => void
  onActivate: () => void
}

export function ConjuntosMap({ conjuntos, selectedId, selectedIsla, active, onSelect, onActivate }: Props) {
  const [initialCenter] = useState(() => savedMapView?.center ?? CANARIAS_CENTER)
  const [initialZoom] = useState(() =>
    savedMapView?.zoom ?? (window.matchMedia('(min-width: 640px)').matches ? 8.5 : 6)
  )

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
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

      <MapActivation active={active} onActivate={onActivate} />
      <MapResizer />
      <SaveMapView />
      <FlyTo conjunto={conjuntos.find(c => c.id === selectedId) ?? null} />
      <FlyToIsla isla={selectedIsla} conjuntos={conjuntos} />
    </MapContainer>
  )
}
