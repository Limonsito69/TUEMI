'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trip, Route, Vehicle, Driver } from '@/types';
import { getActiveTrips, getRoutes, getVehicles, getDrivers } from '@/lib/actions';

// Cargar mapa dinámicamente sin SSR
const Map = dynamic(() => import('@/components/ui/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Cargando Mapa...</div>
});

export default function StudentRouteMapPage() {
  const [activeTrips, setActiveTrips] = React.useState<Trip[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  
  // Estado para controlar el montaje en el cliente y evitar errores de hidratación
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [r, v, d] = await Promise.all([getRoutes(), getVehicles(), getDrivers()]);
      setRoutes(r);
      setVehicles(v);
      setDrivers(d);
    }
    loadData();
  }, []);

  React.useEffect(() => {
    const fetchTrips = async () => {
      const trips = await getActiveTrips();
      setActiveTrips(trips);
    };
    
    if (mounted) {
        fetchTrips();
        const interval = setInterval(fetchTrips, 3000);
        return () => clearInterval(interval);
    }
  }, [mounted]);

  const publishedRoutes = routes.filter(r => r.status === 'Publicada');

  // Evitar renderizar hasta que el componente esté montado en el cliente
  if (!mounted) return null;

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Rutas en Vivo</CardTitle>
            <CardDescription>Ubicación en tiempo real (OpenStreetMap).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border relative z-0">
               <Map 
                 trips={activeTrips} 
                 routes={routes} 
                 vehicles={vehicles} 
                 drivers={drivers} 
               />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Rutas Disponibles</CardTitle>
            <CardDescription>Horarios y estado.</CardDescription>
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
                  const isActive = activeTrips.some(t => t.routeId === route.id);
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        {route.name}
                        {isActive && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>}
                      </TableCell>
                      <TableCell>{route.schedule}</TableCell>
                      <TableCell>
                        {isActive ? <Badge className="bg-green-600">En Camino</Badge> : <Badge variant="secondary">Programada</Badge>}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {publishedRoutes.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center h-16 text-muted-foreground">No hay rutas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}