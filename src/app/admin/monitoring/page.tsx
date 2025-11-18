'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip, Route, Driver, Vehicle } from '@/types';
import { getActiveTrips, getRoutes, getDrivers, getVehicles } from '@/lib/actions';

// Carga el mapa solo en el cliente
const Map = dynamic(() => import('@/components/ui/map'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse flex items-center justify-center">Cargando Mapa...</div>
});

export default function MonitoringPage() {
  const [activeTrips, setActiveTrips] = React.useState<Trip[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // Cargar catálogos una vez
  React.useEffect(() => {
    setMounted(true);
    async function loadCatalogs() {
      const [d, r, v] = await Promise.all([getDrivers(), getRoutes(), getVehicles()]);
      setDrivers(d);
      setRoutes(r);
      setVehicles(v);
    }
    loadCatalogs();
  }, []);

  // Polling cada 3 segundos para ver movimiento real
  React.useEffect(() => {
    if (!mounted) return;
    const fetchTrips = async () => {
      const trips = await getActiveTrips();
      setActiveTrips(trips);
    };
    fetchTrips();
    const interval = setInterval(fetchTrips, 3000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
            <div>
              <CardTitle>Monitoreo de Flota</CardTitle>
              <CardDescription>Ubicación en tiempo real vía GPS.</CardDescription>
            </div>
            <Badge variant={activeTrips.length > 0 ? "default" : "secondary"}>
                {activeTrips.length} Vehículos Activos
            </Badge>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
             <Map 
               trips={activeTrips} 
               routes={routes} 
               vehicles={vehicles} 
               drivers={drivers} 
             />
          </CardContent>
        </Card>
    </div>
  );
}