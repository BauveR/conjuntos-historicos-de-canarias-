import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Conjunto } from '../../data/conjuntos'

// Centro aproximado del archipiélago canario
const CANARIAS_CENTER: [number, number] = [28.3, -15.6]
const CANARIAS_ZOOM = 7

const createMarkerIcon = (selected: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${selected ? '#1c1917' : '#ffffff'};
      border:2px solid #1c1917;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
      transition:transform 0.2s;
      ${selected ? 'transform:scale(1.4)' : ''}
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })

function FlyTo({ conjunto }: { conjunto: Conjunto | null }) {
  const map = useMap()
  useEffect(() => {
    if (conjunto) {
      map.flyTo([conjunto.lat, conjunto.lng], 11, { duration: 1.2 })
    }
  }, [conjunto, map])
  return null
}

type Props = {
  conjuntos: Conjunto[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ConjuntosMap({ conjuntos, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={CANARIAS_CENTER}
      zoom={CANARIAS_ZOOM}
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
          icon={createMarkerIcon(c.id === selectedId)}
          eventHandlers={{ click: () => onSelect(c.id) }}
        />
      ))}

      <FlyTo conjunto={conjuntos.find(c => c.id === selectedId) ?? null} />
    </MapContainer>
  )
}
