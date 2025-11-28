'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Navigation, Users, User, Clock, MapPin } from 'lucide-react';

const CENTER_LA_PAZ: [number, number] = [-16.500, -68.119];

// Configuración de iconos (Fix Leaflet)
const createBusIcon = (isAlert: boolean = false) => L.divIcon({
  className: 'custom-bus-icon',
  html: `
    <div style="
      position: relative;
      width: 40px; height: 40px; 
      background-color: ${isAlert ? '#ef4444' : '#3b82f6'}; 
      border: 3px solid white; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

type MapProps = {
  trips: Trip[];
  routes: Route[];
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedTripId?: number | null;
};

// Controlador de Zoom
function MapController({ selectedTripId, trips }: { selectedTripId?: number | null, trips: Trip[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedTripId && trips && trips.length > 0) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (trip && trip.locationLat && trip.locationLng) {
        map.flyTo([trip.locationLat, trip.locationLng], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedTripId, trips, map]);
  return null;
}

export default function Map({ trips, routes, vehicles, drivers, selectedTripId }: MapProps) {
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const safeTrips = trips || [];
  const safeRoutes = routes || [];

  // Colores para las rutas
  const routeColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <MapContainer center={CENTER_LA_PAZ} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
      <TileLayer attribution='&copy; OSM contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <MapController selectedTripId={selectedTripId} trips={safeTrips} />

      {/* DIBUJAR RUTAS (LÍNEAS) */}
      {safeRoutes.map((route, index) => {
        if (!route.waypoints || route.waypoints.length < 2) return null;
        // Convertimos el formato {lat, lng} al formato de Leaflet [lat, lng]
        const positions = route.waypoints.map(w => [w.lat, w.lng] as [number, number]);
        
        return (
          <Polyline 
            key={`route-line-${route.id}`}
            positions={positions}
            pathOptions={{ 
              color: routeColors[index % routeColors.length], 
              weight: 4,
              opacity: 0.7,
              lineCap: 'round'
            }} 
          />
        );
      })}

      {/* DIBUJAR BUSES */}
      {safeTrips.map((trip) => {
        if (!trip.locationLat || !trip.locationLng) return null;
        const route = safeRoutes.find(r => r.id === trip.routeId);
        const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
        const driver = drivers?.find(d => d.id === trip.driverId);
        const isAlert = vehicle?.plate === '1234-TUB'; 

        return (
          <Marker key={trip.id} position={[trip.locationLat, trip.locationLng]} icon={createBusIcon(isAlert)}>
             <Popup className="custom-popup" closeButton={false}>
              <div className="p-1 w-[200px]">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-bold text-sm">{route?.name || 'Ruta'}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span className="text-gray-400">Móvil:</span> <b>{vehicle?.plate}</b></div>
                  <div className="flex justify-between"><span className="text-gray-400">Conductor:</span> <b>{driver?.name}</b></div>
                  <div className="flex justify-between"><span className="text-gray-400">Velocidad:</span> <b>25 km/h</b></div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}