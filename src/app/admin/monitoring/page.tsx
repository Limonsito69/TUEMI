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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Bus, Clock, Users, Play } from 'lucide-react';
import { IncidentDetector } from '@/components/incident-detector';
import { Trip, Route, Driver, Vehicle } from '@/types';
import { getActiveTrips, getRoutes, getDrivers, getVehicles, simulateVehicleMovement } from '@/lib/actions';

const mapBackground = PlaceHolderImages.find(i => i.id === 'map-background');

// Coordenadas base aproximadas de La Paz para el mapa relativo
const BASE_LAT = -16.500;
const BASE_LNG = -68.119;
const MAP_SCALE = 20000; // Ajuste para que se vean los puntos en el div

function VehicleMarker({ trip, drivers, routes, vehicles }: { trip: Trip, drivers: Driver[], routes: Route[], vehicles: Vehicle[] }) {
  const driver = drivers.find(d => d.id === trip.driverId);
  const route = routes.find(r => r.id === trip.routeId);
  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
  const driverAvatar = PlaceHolderImages.find(i => i.id === driver?.avatar);
  
  const tripDuration = trip.startTime ? Math.floor((Date.now() - new Date(trip.startTime).getTime()) / 60000) : 0;

  // Cálculo simple para posicionar en el div basado en coordenadas
  // Nota: Esto es una aproximación visual simple, no un mapa GIS real.
  const top = 50 + (trip.locationLat! - BASE_LAT) * -MAP_SCALE;
  const left = 50 + (trip.locationLng! - BASE_LNG) * MAP_SCALE;

  return (
    <div style={{ top: `${top}%`, left: `${left}%`, position: 'absolute', transition: 'all 1s ease-in-out' }}>
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-8 h-8 rounded-full bg-primary/90 border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Bus className="w-4 h-4 text-white"/>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{route?.name || 'Ruta Desconocida'}</h4>
              <p className="text-sm text-muted-foreground">
                Vehículo: {vehicle?.plate}
              </p>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
               <Avatar>
                <AvatarImage src={driverAvatar?.imageUrl} />
                <AvatarFallback>{driver?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                  <p className="font-medium">{driver?.name}</p>
                  <p className="text-sm text-muted-foreground">Conductor</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground"/>
                  <span>{trip.passengersAbonado + trip.passengersNoAbonado} / {vehicle?.capacity} pas.</span>
              </div>
               <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground"/>
                  <span>{tripDuration} min en ruta</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {/* Etiqueta flotante pequeña */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
        {vehicle?.plate}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const [activeTrips, setActiveTrips] = React.useState<Trip[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  // Cargar datos iniciales (catálogos)
  React.useEffect(() => {
    async function loadCatalogs() {
      const [d, r, v] = await Promise.all([getDrivers(), getRoutes(), getVehicles()]);
      setDrivers(d);
      setRoutes(r);
      setVehicles(v);
    }
    loadCatalogs();
  }, []);

  // Polling: Actualizar posiciones cada 3 segundos
  React.useEffect(() => {
    const fetchTrips = async () => {
      const trips = await getActiveTrips();
      setActiveTrips(trips);
      setLastUpdate(new Date());
    };

    fetchTrips(); // Primera carga inmediata
    const interval = setInterval(fetchTrips, 3000); // Recargar cada 3s

    return () => clearInterval(interval);
  }, []);

  const handleSimulateMovement = async () => {
    await simulateVehicleMovement();
    // Forzamos una recarga inmediata visual
    const trips = await getActiveTrips();
    setActiveTrips(trips);
  };

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mapa en Vivo</CardTitle>
              <CardDescription>
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleSimulateMovement}>
              <Play className="mr-2 h-4 w-4"/> Simular Movimiento GPS
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden bg-muted border border-border">
              {mapBackground && (
                <Image
                  src={mapBackground.imageUrl}
                  alt="Fondo de mapa"
                  fill
                  className="object-cover opacity-50 grayscale" // Mapa un poco más sutil para que resalten los buses
                  data-ai-hint={mapBackground.imageHint}
                />
              )}
              
              {/* Renderizar los buses en el mapa */}
              {activeTrips.map(trip => (
                <VehicleMarker 
                  key={trip.id} 
                  trip={trip} 
                  drivers={drivers} 
                  routes={routes} 
                  vehicles={vehicles} 
                />
              ))}

              {activeTrips.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium bg-white/40">
                  No hay vehículos en ruta actualmente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <IncidentDetector/>
      </div>

      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Viajes Activos ({activeTrips.length})</CardTitle>
            <CardDescription>Detalle de flota en operación.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead className="text-right">Pasajeros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrips.map(trip => {
                  const route = routes.find(r => r.id === trip.routeId);
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{route?.name}</TableCell>
                      <TableCell>{vehicle?.plate}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{trip.passengersAbonado + trip.passengersNoAbonado}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                 {activeTrips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                      Sin actividad.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}