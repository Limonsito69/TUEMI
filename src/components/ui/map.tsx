'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Navigation, Users, User, Clock, MapPin } from 'lucide-react';

const CENTER_LA_PAZ: [number, number] = [-16.500, -68.119];

// --- Función para crear iconos de autobús personalizados ---
const createBusIcon = (isAlert: boolean = false) => L.divIcon({
  className: 'custom-bus-icon',
  html: `
    <div style="
      position: relative;
      width: 40px; 
      height: 40px; 
      background-color: ${isAlert ? '#ef4444' : '#3b82f6'}; 
      border: 3px solid white; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      transform-origin: center bottom;
      animation: ${isAlert ? 'pulse 1.5s infinite' : 'none'};
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
        <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
        <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
      </svg>
      ${isAlert ? '<div style="position:absolute; top:-2px; right:-2px; width:12px; height:12px; background:#ef4444; border:2px solid white; border-radius:50%;"></div>' : ''}
    </div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40], // Punta abajo
  popupAnchor: [0, -40],
});

type MapProps = {
  trips: Trip[];
  routes: Route[];
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedTripId?: number | null;
};

// --- Controlador de Cámara (Zoom Automático) ---
function MapController({ selectedTripId, trips }: { selectedTripId?: number | null, trips: Trip[] }) {
  const map = useMap();

  useEffect(() => {
    // PROTECCIÓN: Aseguramos que trips exista y tenga elementos
    if (selectedTripId && trips && trips.length > 0) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (trip && trip.locationLat && trip.locationLng) {
        map.flyTo([trip.locationLat, trip.locationLng], 16, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [selectedTripId, trips, map]);

  return null;
}

export default function Map({ trips, routes, vehicles, drivers, selectedTripId }: MapProps) {
  useEffect(() => {
    // Corrección de iconos de Leaflet para Next.js
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // PROTECCIÓN CONTRA EL ERROR "UNDEFINED": 
  // Si trips es null o undefined, usamos un array vacío.
  const safeTrips = trips || [];

  return (
    <MapContainer 
      center={CENTER_LA_PAZ} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '0', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <MapController selectedTripId={selectedTripId} trips={safeTrips} />

      {safeTrips.map((trip) => {
        if (!trip.locationLat || !trip.locationLng) return null;

        // Usamos encadenamiento opcional (?.) para evitar errores si las listas de catálogos no han cargado
        const route = routes?.find(r => r.id === trip.routeId);
        const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
        const driver = drivers?.find(d => d.id === trip.driverId);
        
        // Lógica de alerta (ejemplo: placa específica o estado)
        const isAlert = vehicle?.plate === '1234-TUB'; 

        return (
          <Marker 
            key={trip.id} 
            position={[trip.locationLat, trip.locationLng]} 
            icon={createBusIcon(isAlert)}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="p-1 w-[220px]">
                <div className={`flex items-center justify-between mb-3 pb-2 border-b ${isAlert ? 'border-red-200' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isAlert ? 'text-red-500' : 'text-primary'}`} />
                        <span className="font-bold text-sm">{route?.name || 'Ruta'}</span>
                    </div>
                    <Badge variant={isAlert ? "destructive" : "outline"} className="text-[10px] h-5 px-1.5">
                        {isAlert ? 'Alerta' : 'En Ruta'}
                    </Badge>
                </div>
                
                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-md">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold text-gray-700">{vehicle?.plate}</span>
                    </div>
                    <span className="text-gray-400">{vehicle?.model}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-1">
                    <User className="w-3.5 h-3.5 text-green-600" />
                    <span>{driver?.name || 'Sin conductor'}</span>
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span>{trip.passengersAbonado + trip.passengersNoAbonado} / {vehicle?.capacity} Pasajeros</span>
                  </div>

                  {isAlert && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 rounded border border-red-100 text-[10px]">
                          <strong>!</strong> Parada prolongada detectada (12 min).
                      </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-gray-400">
                     <Clock className="w-3 h-3" />
                     <span className="text-[10px]">Actualizado hace unos segundos</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}