'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { format } from 'date-fns';

const CENTER_LA_PAZ: [number, number] = [-16.500, -68.119];

const createBusIcon = () => L.divIcon({
  className: 'custom-bus-icon',
  html: `
    <div style="width: 32px; height: 32px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

type MapProps = {
  trips: Trip[];
  routes: Route[];
  vehicles: Vehicle[];
  drivers: Driver[];
};

export default function Map({ trips, routes, vehicles, drivers }: MapProps) {
  useEffect(() => {
    // Arreglar iconos por defecto de Leaflet
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer 
      center={CENTER_LA_PAZ} 
      zoom={13} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {trips.map((trip) => {
        // Validar que tenga coordenadas
        if (!trip.locationLat || !trip.locationLng) return null;

        const route = routes.find(r => r.id === trip.routeId);
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        const driver = drivers.find(d => d.id === trip.driverId);

        return (
          <Marker 
            key={trip.id} 
            position={[trip.locationLat, trip.locationLng]} 
            icon={createBusIcon()}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h3 className="font-bold text-sm mb-1">{route?.name || 'Ruta'}</h3>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>🚗 {vehicle?.plate}</p>
                  <p>👤 {driver?.name}</p>
                  <p>👥 {trip.passengersAbonado + trip.passengersNoAbonado} pasajeros</p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}