'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Users, Play, Square, Bus, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { Trip, Route, Vehicle } from '@/types';
import { 
  getDriverActiveTrip, 
  getRoutes, 
  getVehicles, 
  startTrip, 
  endTrip, 
  updateTripLocation 
} from '@/lib/actions';

export default function DriverActiveRoutePage() {
  // --- ESTADOS (Aquí definimos todas las variables) ---
  const [driverId, setDriverId] = React.useState<number | null>(null);
  const [activeTrip, setActiveTrip] = React.useState<Trip | null>(null);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Estado para el formulario de inicio
  const [selectedRouteId, setSelectedRouteId] = React.useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string>('');

  // --- EFECTOS ---

  // 1. Obtener el ID del conductor desde la sesión al cargar
  React.useEffect(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'driver' && user.id) {
        setDriverId(user.id);
      } else {
        console.error("Usuario no es conductor o no tiene ID válido");
        // Aquí podrías redirigir al login si quisieras
      }
    } else {
        // Si no hay sesión, dejamos driverId en null
        console.log("No hay sesión activa");
    }
  }, []);

  // 2. Cargar datos de la BD (solo cuando ya tenemos el driverId)
  const loadData = React.useCallback(async () => {
    if (!driverId) return;

    setIsLoading(true);
    try {
      const [trip, r, v] = await Promise.all([
        getDriverActiveTrip(driverId),
        getRoutes(),
        getVehicles()
      ]);
      
      setActiveTrip(trip);
      // Solo mostrar rutas publicadas/borrador y vehículos activos
      setRoutes(r.filter(x => x.status === 'Publicada' || x.status === 'En borrador'));
      setVehicles(v.filter(x => x.status === 'Activo'));
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  React.useEffect(() => {
    if (driverId) {
      loadData();
    } else {
        // Si no hay driverId, quitamos el loading inicial tras un breve momento
        // para mostrar el estado vacío o login
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }
  }, [driverId, loadData]);

  // --- HANDLERS (Funciones de los botones) ---

  const handleStartTrip = async () => {
    if (!driverId) return alert('No se ha identificado al conductor.');
    if (!selectedRouteId || !selectedVehicleId) return alert('Selecciona ruta y vehículo');
    
    try {
      // Coordenadas iniciales (Plaza del Estudiante, La Paz aprox)
      const startLat = -16.500;
      const startLng = -68.119;

      const newTrip = await startTrip({
        routeId: parseInt(selectedRouteId),
        vehicleId: parseInt(selectedVehicleId),
        driverId: driverId, 
        startLat,
        startLng
      });

      if (newTrip) {
        setActiveTrip(newTrip);
        alert('¡Viaje iniciado!');
      }
    } catch (error) {
      console.error(error);
      alert('Error al iniciar el viaje.');
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    if (confirm('¿Estás seguro de finalizar el viaje?')) {
      const success = await endTrip(activeTrip.id);
      if (success) {
        setActiveTrip(null);
        setSelectedRouteId('');
        setSelectedVehicleId('');
        alert('Viaje finalizado correctamente.');
      }
    }
  };

  const handleSimulateGPS = async () => {
    if (!activeTrip) return;
    // Mueve el bus un poco al sur-este para simular movimiento
    const newLat = (activeTrip.locationLat || -16.500) - 0.001;
    const newLng = (activeTrip.locationLng || -68.119) + 0.001;
    
    await updateTripLocation(activeTrip.id, newLat, newLng);
    
    // Actualizamos el estado local para verlo reflejado al instante
    setActiveTrip({ ...activeTrip, locationLat: newLat, locationLng: newLng });
    alert('Ubicación GPS actualizada (simulación)');
  };

  // --- RENDERIZADO ---

  if (isLoading) {
    return <div className="p-8 text-center">Cargando panel de conductor...</div>;
  }

  if (!driverId) {
      return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader><CardTitle>Acceso Restringido</CardTitle></CardHeader>
            <CardContent>Debes iniciar sesión como conductor para ver esta página.</CardContent>
        </Card>
      );
  }

  // VISTA 1: SIN VIAJE ACTIVO (Formulario de Inicio)
  if (!activeTrip) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Nuevo Turno</CardTitle>
            <CardDescription>Selecciona tu ruta y vehículo asignado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ruta Asignada</Label>
              <Select onValueChange={setSelectedRouteId} value={selectedRouteId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar Ruta" /></SelectTrigger>
                <SelectContent>
                  {routes.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select onValueChange={setSelectedVehicleId} value={selectedVehicleId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar Vehículo" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.plate} - {v.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleStartTrip} disabled={!selectedRouteId || !selectedVehicleId}>
              <Play className="mr-2 h-5 w-5" /> Comenzar Viaje
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // VISTA 2: EN RUTA (Panel de Control)
  const currentRoute = routes.find(r => r.id === activeTrip.routeId);
  const currentVehicle = vehicles.find(v => v.id === activeTrip.vehicleId);

  return (
    <div className="grid gap-6 lg:grid-cols-1 max-w-2xl mx-auto">
       <Card className="border-primary/50 shadow-lg">
          <CardHeader className="bg-primary/5 pb-4">
              <div className="flex justify-between items-start">
                <div>
                    <Badge variant="default" className="mb-2">EN CURSO</Badge>
                    <CardTitle className="text-2xl">{currentRoute?.name}</CardTitle>
                    <CardDescription className="mt-1 font-mono text-lg text-foreground">
                       {currentVehicle?.plate} • {currentVehicle?.model}
                    </CardDescription>
                </div>
                <Bus className="h-12 w-12 text-primary/20" />
              </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Inicio</p>
                      <p className="text-xl font-bold">{format(new Date(activeTrip.startTime), 'HH:mm')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Pasajeros</p>
                      <p className="text-xl font-bold flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" /> 
                        {activeTrip.passengersAbonado + activeTrip.passengersNoAbonado}
                      </p>
                  </div>
              </div>

              <div className="space-y-2">
                 <Button variant="outline" className="w-full h-16 text-lg" onClick={handleSimulateGPS}>
                    <Navigation className="mr-2 h-6 w-6 text-blue-500" /> 
                    Simular Avance GPS
                 </Button>
                 <p className="text-xs text-center text-muted-foreground">
                   * En una app real, esto se actualiza automáticamente.
                 </p>
              </div>
          </CardContent>
          <CardFooter className="pt-2">
              <Button variant="destructive" size="lg" className="w-full" onClick={handleEndTrip}>
                  <Square className="mr-2 h-5 w-5 fill-current" /> Finalizar Viaje
              </Button>
          </CardFooter>
      </Card>
    </div>
  );
}