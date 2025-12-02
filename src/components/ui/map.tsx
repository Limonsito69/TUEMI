'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { MapPin } from 'lucide-react';

const CENTER_LA_PAZ: [number, number] = [-16.500, -68.119];

// --- CONFIGURACIÓN DE ICONOS ---
const createIcon = (color: string) => L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const busIcon = L.divIcon({
  className: 'bus-icon',
  html: `<div style="font-size: 24px;">🚌</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// --- TIPOS DE PROPS ---
type Stop = { id: number; name: string; lat: number; lng: number };
type RouteStop = { stopId: number; name: string; lat: number; lng: number; order: number };

type MapProps = {
  // Modo Monitoreo
  trips?: Trip[];
  routes?: Route[];
  vehicles?: Vehicle[];
  drivers?: Driver[];
  selectedTripId?: number | null;
  
  // Modo Editor (Paradas y Rutas)
  stops?: any[]; // Lista de todas las paradas disponibles (Pines grises)
  tempMarker?: { name: string; lat: number; lng: number } | null; // Pin nuevo temporal
  routePath?: RouteStop[]; // Lista de paradas seleccionadas para dibujar línea
  
  // Eventos
  onMapClick?: (e: { lat: number, lng: number }) => void;
  onStopClick?: (stop: any) => void;
  
  // Configuración
  readonly?: boolean; // Si es true, no interactúa
  interactive?: boolean; // Si es true, habilita clics en el mapa
};

// --- COMPONENTE PARA CAPTURAR CLICS EN EL MAPA ---
function MapEvents({ onClick }: { onClick?: (e: { lat: number, lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// --- COMPONENTE PRINCIPAL ---
export default function Map({
  trips = [], 
  routes = [], 
  vehicles = [], 
  drivers = [], 
  stops = [],
  tempMarker,
  routePath = [],
  onMapClick,
  onStopClick,
  selectedTripId,
  interactive = false
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fix iconos Leaflet (igual que antes)
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);
  if (!isMounted) {
    return <div className="h-full w-full bg-slate-100 flex items-center justify-center">Cargando Mapa...</div>;
  }

  return (
    // 3. IMPORTANTE: key={...} fuerza a React a destruir y recrear el mapa si cambias de página
    // Usamos una key estática o basada en algo que no cambie a cada rato
    <MapContainer 
        key="map-container" 
        center={CENTER_LA_PAZ} 
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer 
        attribution='&copy; CARTO' 
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
      />
      
      {/* Capturador de Clics (Solo si es interactivo) */}
      {interactive && <MapEvents onClick={onMapClick} />}

      {/* 1. DIBUJAR TODAS LAS PARADAS (Modo Editor) */}
      {stops.map((stop) => {
        // ... tu lógica de dibujo de paradas ...
        // (Copia el contenido que ya tenías aquí)
        const isSelected = routePath.some(r => r.stopId === stop.id);
        const lat = Number(stop.lat);
        const lng = Number(stop.lng);
        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker 
            key={`stop-${stop.id}`} 
            position={[lat, lng]} 
            icon={createIcon(isSelected ? '#2563eb' : '#94a3b8')}
            eventHandlers={{
                click: () => onStopClick && onStopClick(stop),
            }}
          >
            <Popup>{stop.name}</Popup>
          </Marker>
        );
      })}

      {/* 2. DIBUJAR MARCADOR TEMPORAL (Creando nueva parada) */}
      {tempMarker && (
        <Marker position={[tempMarker.lat, tempMarker.lng]} icon={createIcon('#ef4444')}>
           <Popup>Nueva Parada</Popup>
        </Marker>
      )}

      {/* 3. DIBUJAR LÍNEA DE RUTA (Modo Editor) */}
      {routePath.length > 1 && (
        <Polyline 
          positions={routePath.map(p => [p.lat, p.lng])}
          pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
        />
      )}

      {/* 4. DIBUJAR BUSES EN TIEMPO REAL (Modo Monitoreo) */}
      {trips.map((trip) => (
        <Marker key={`trip-${trip.id}`} position={[trip.locationLat || 0, trip.locationLng || 0]} icon={busIcon}>
           <Popup>Bus en camino</Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}