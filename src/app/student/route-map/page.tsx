'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { getActiveTrips, getRoutes, getVehicles, getDrivers } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const mapBackground = PlaceHolderImages.find(i => i.id === 'map-background');

// Constantes de mapa (Deben coincidir con las del admin para que las posiciones sean iguales)
const BASE_LAT = -16.500;
const BASE_LNG = -68.119;
const MAP_SCALE = 20000;

export default function StudentRouteMapPage() {
  const [activeTrips, setActiveTrips] = React.useState<Trip[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);

  // Cargar datos estáticos (Rutas, Vehículos, etc.)
  React.useEffect(() => {
    async function loadData() {
      const [r, v, d] = await Promise.all([getRoutes(), getVehicles(), getDrivers()]);
      setRoutes(r);
      setVehicles(v);
      setDrivers(d);
    }
    loadData();
  }, []);

  // Polling: Actualizar viajes activos cada 3 segundos
  React.useEffect(() => {
    const fetchTrips = async () => {
      const trips = await getActiveTrips();
      setActiveTrips(trips);
    };
    fetchTrips();
    const interval = setInterval(fetchTrips, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtramos solo las rutas que están marcadas como "Publicada"
  const publishedRoutes = routes.filter(r => r.status === 'Publicada');

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      {/* --- MAPA DE RUTAS --- */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Rutas en Vivo</CardTitle>
            <CardDescription>Visualiza la ubicación de los buses de la universidad en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-muted border border-border">
               {mapBackground && (
                <Image
                  src={mapBackground.imageUrl}
                  alt="Fondo de mapa"
                  fill
                  className="object-cover opacity-60"
                  data-ai-hint={mapBackground.imageHint}
                />
              )}

              {/* Renderizado de los buses en el mapa */}
              {activeTrips.map(trip => {
                 const route = routes.find(r => r.id === trip.routeId);
                 const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                 
                 // Cálculo de posición relativa
                 const top = 50 + (trip.locationLat! - BASE_LAT) * -MAP_SCALE;
                 const left = 50 + (trip.locationLng! - BASE_LNG) * MAP_SCALE;

                 return (
                   <div key={trip.id} style={{ top: `${top}%`, left: `${left}%`, position: 'absolute', transition: 'all 1s ease-in-out' }}>
                      <Popover>
                        <PopoverTrigger asChild>
                           {/* Icono del bus más amigable para el estudiante */}
                           <button className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center animate-pulse hover:scale-110 transition-transform">
                              <Bus className="w-5 h-5 text-white"/>
                           </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                           <div className="space-y-2">
                              <h4 className="font-bold text-primary">{route?.name}</h4>
                              <Badge variant="outline" className="mb-1">En camino</Badge>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Bus className="w-3 h-3"/> {vehicle?.plate}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                 <Clock className="w-3 h-3"/> Salida: {new Date(trip.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                           </div>
                        </PopoverContent>
                      </Popover>
                   </div>
                 );
              })}

              {activeTrips.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/80 px-4 py-2 rounded-full text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
                        No hay buses en circulación ahora mismo.
                      </div>
                  </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- LISTA DE RUTAS --- */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Rutas Disponibles</CardTitle>
            <CardDescription>Horarios y estado actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishedRoutes.map(route => {
                  // Verificamos si esta ruta tiene un viaje activo
                  const isActive = activeTrips.some(t => t.routeId === route.id);
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        {route.name}
                        {isActive && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>}
                      </TableCell>
                      <TableCell>{route.schedule}</TableCell>
                      <TableCell>
                        {isActive ? (
                           <Badge className="bg-green-600 hover:bg-green-700">En Camino</Badge>
                        ) : (
                           <Badge variant="secondary">Programada</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {publishedRoutes.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center h-16 text-muted-foreground">No hay rutas publicadas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}