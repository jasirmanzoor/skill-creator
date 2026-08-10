'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import type L from 'leaflet';
import type { Dealership } from '@/lib/types';
import { statusIcon, userLocationIcon } from '@/lib/icons';

const AL_QADISIYAH_CENTER: [number, number] = [24.8260, 46.8230];

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [target, map]);
  return null;
}

interface MapCanvasProps {
  dealerships: Dealership[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  basemap: 'street' | 'satellite';
  userLocation: { lat: number; lng: number } | null;
  routeStops?: Dealership[];
  flyTarget: [number, number] | null;
}

export default function MapCanvas({
  dealerships,
  selectedId,
  onSelect,
  basemap,
  userLocation,
  routeStops,
  flyTarget,
}: MapCanvasProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  return (
    <MapContainer
      center={AL_QADISIYAH_CENTER}
      zoom={15}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer key={basemap} url={TILE_LAYERS[basemap].url} attribution={TILE_LAYERS[basemap].attribution} maxZoom={19} />
      <FlyTo target={flyTarget} />

      {routeStops && routeStops.length > 1 && (
        <Polyline
          positions={routeStops.map((d) => [d.lat, d.lng])}
          pathOptions={{ color: '#2563eb', weight: 4, dashArray: '2 8', opacity: 0.8 }}
        />
      )}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon()} zIndexOffset={-100} />
      )}

      {dealerships.map((d) => (
        <Marker
          key={d.id}
          position={[d.lat, d.lng]}
          icon={statusIcon(d.visitStatus, d.id === selectedId)}
          ref={(el) => {
            markerRefs.current[d.id] = el;
          }}
          eventHandlers={{ click: () => onSelect(d.id) }}
        />
      ))}
    </MapContainer>
  );
}
