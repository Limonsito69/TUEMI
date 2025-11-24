'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Bus, Navigation, Clock, MapPin } from 'lucide-react';
import { Trip, Route, Driver, Vehicle } from '@/types';
import { getActiveTrips, getRoutes, getDrivers, getVehicles } from '@/lib/actions';

// Importación dinámica del mapa para evitar SSR (Server Side Rendering)
const Map = dynamic(() => import('@/components/ui/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Conectando satélite...</div>
});

// --- Componente de Alertas (Muestra avisos si hay incidentes) ---
function AlertsPanel({ trips, vehicles }: { trips: Trip[], vehicles: Vehicle[] }) {
  // Lógica de ejemplo: Busca si el vehículo "1234-TUB" está activo para mostrar alerta
  const alertTrip = trips.find(t => {
    const v = vehicles.find(vh => vh.id === t.vehicleId);
    return v?.plate === '1234-TUB'; 
  });

  if (!alertTrip) return null;

  return (
    <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 fade-in duration-500">
       <Alert variant="destructive" className="border-l-4 border-l-red-600 bg-red-50 shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alerta de Parada Prolongada</AlertTitle>
          <AlertDescription className="text-xs mt-1">
             El vehículo <strong>1234-TUB</strong> ha estado detenido por más de 10 minutos fuera de parada autorizada.
          </AlertDescription>
       </Alert>
    </div>
  );
}

export default function MonitoringPage() {
  // Inicializamos estados con arrays vacíos para evitar "undefined"
  const [activeTrips, setActiveTrips] = React.useState<Trip[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [mounted, setMounted] = React.useState(false);
  
  const [selectedTripId, setSelectedTripId] = React.useState<number | null>(null);

  // Carga inicial de datos estáticos (conductores, rutas, vehículos)
  React.useEffect(() => {
    setMounted(true);
    async function loadCatalogs() {
      try {
        const [d, r, v] = await Promise.all([getDrivers(), getRoutes(), getVehicles()]);
        setDrivers(d || []);
        setRoutes(r || []);
        setVehicles(v || []);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    }
    loadCatalogs();
  }, []);

  // Polling: Actualiza la posición de los viajes cada 4 segundos
  React.useEffect(() => {
    if (!mounted) return;
    const fetchTrips = async () => {
      try {
        const trips = await getActiveTrips();
        setActiveTrips(trips || []);
      } catch (error) {
        console.error("Error actualizando viajes:", error);
      }
    };
    fetchTrips();
    const interval = setInterval(fetchTrips, 4000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  // Calculamos cuántos incidentes hay activos
  const incidentCount = activeTrips.filter(t => {
      const v = vehicles.find(vh => vh.id === t.vehicleId);
      return v?.plate === '1234-TUB';
  }).length;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-4">
      
      {/* Encabezado con Resumen */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" /> Centro de Monitoreo
          </h1>
          <p className="text-sm text-muted-foreground">Supervisión de flota en tiempo real.</p>
        </div>
        
        <div className="flex gap-2">
           <Badge variant="outline" className="h-8 px-3 gap-2 bg-background shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {activeTrips.length} Unidades Activas
           </Badge>
           
           {incidentCount > 0 ? (
             <Badge variant="destructive" className="h-8 px-3 animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> {incidentCount} Incidente Activo
             </Badge>
           ) : (
             <Badge variant="secondary" className="h-8 px-3 text-green-600 bg-green-50">
                Sin Incidentes
             </Badge>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        
        {/* PANEL LATERAL IZQUIERDO: Lista de Vehículos */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden border-l-4 border-l-primary shadow-md">
          <CardHeader className="pb-2 bg-muted/30 pt-4">
            <CardTitle className="text-base font-semibold flex justify-between items-center">
                Estado de la Flota
                <Clock className="w-4 h-4 text-muted-foreground"/>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-3 overflow-hidden flex flex-col">
            
            <AlertsPanel trips={activeTrips} vehicles={vehicles} />

            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Vehículos en Ruta</div>
            
            <ScrollArea className="flex-1 pr-3">
              <div className="flex flex-col gap-2">
                {activeTrips.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed rounded-lg bg-slate-50">
                        <Bus className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-20" />
                        <p className="text-sm text-muted-foreground">No hay vehículos circulando.</p>
                    </div>
                ) : activeTrips.map(trip => {
                  const route = routes.find(r => r.id === trip.routeId);
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const driver = drivers.find(d => d.id === trip.driverId);
                  const isSelected = selectedTripId === trip.id;
                  const isAlert = vehicle?.plate === '1234-TUB'; 
                  
                  return (
                    <button 
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`
                          relative flex flex-col gap-1 p-3 rounded-lg text-left transition-all border group
                          ${isSelected 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-card border-border hover:border-primary/50 hover:bg-accent'}
                          ${isAlert ? 'border-red-300 bg-red-50/50' : ''}
                        `}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />}
                      
                      <div className="flex justify-between items-start w-full">
                        <span className="font-bold text-sm truncate text-foreground pr-2">{route?.name || 'Ruta Desconocida'}</span>
                        <Badge className={`text-[10px] h-5 px-1.5 ${isAlert ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' : ''}`} variant={trip.status === 'En curso' ? 'default' : 'secondary'}>
                            {isAlert ? 'Alerta' : trip.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <Bus className="h-3 w-3" /> 
                           <span className="font-mono">{vehicle?.plate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <MapPin className="h-3 w-3" />
                           <span>En ruta</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed w-full border-gray-200">
                        <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
                          {driver?.name?.charAt(0)}
                        </div>
                        <span className="text-xs font-medium truncate text-muted-foreground">{driver?.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* PANEL DERECHO: Mapa */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden relative shadow-lg border-0 ring-1 ring-black/5">
          <CardContent className="p-0 flex-1 bg-slate-100 relative z-0">
             <Map 
               trips={activeTrips} 
               routes={routes} 
               vehicles={vehicles} 
               drivers={drivers}
               selectedTripId={selectedTripId} 
             />
             
             <div className="absolute bottom-5 right-5 bg-white/95 p-3 rounded-lg shadow-lg border border-slate-200 backdrop-blur-sm z-[400] text-xs space-y-2">
                <div className="font-semibold mb-1 text-slate-700">Estado del Vehículo</div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></span> 
                  <span className="text-slate-600">En Movimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                  </span>
                  <span className="text-slate-600">Alerta / Parada Larga</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}