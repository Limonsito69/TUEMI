"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Users,
  Play,
  Square,
  Navigation,
  AlertCircle,
  Radio,
} from "lucide-react";
import { format } from "date-fns";
import { Trip, Route, Vehicle } from "@/types";
import {
  getCurrentUser,
  getDriverActiveTrip,
  getRoutes,
  getVehicles,
  startTrip,
  endTrip,
  updateTripLocation,
} from "@/lib/actions";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DriverActiveRoutePage() {
  const [driverId, setDriverId] = React.useState<number | null>(null);
  const [activeTrip, setActiveTrip] = React.useState<Trip | null>(null);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Estado GPS
  const [gpsActive, setGpsActive] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);
  const watchIdRef = React.useRef<number | null>(null);
  const wakeLockRef = React.useRef<any>(null);
  const [selectedRouteId, setSelectedRouteId] = React.useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string>("");

  // 1. Cargar sesión y datos
  React.useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      if (user && user.role === "driver") {
        setDriverId(user.id);
      }
    }
    init();
  }, []);

  const loadData = React.useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);
    try {
      const [trip, r, v] = await Promise.all([
        getDriverActiveTrip(driverId),
        getRoutes(),
        getVehicles(),
      ]);

      setActiveTrip(trip);
      setRoutes(
        r.filter((x) => x.status === "Publicada" || x.status === "En borrador")
      );
      setVehicles(v.filter((x) => x.status === "Activo"));

      // Si ya tenía viaje, activar GPS automáticamente
      if (trip) startGpsTracking(trip.id);
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  React.useEffect(() => {
    if (driverId) loadData();
    else setTimeout(() => setIsLoading(false), 500);
  }, [driverId, loadData]);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        // @ts-ignore - TypeScript a veces no reconoce 'wakeLock' sin configuración extra
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        console.log("🔒 Pantalla bloqueada (No se apagará)");
      }
    } catch (err) {
      console.error("Error al solicitar Wake Lock:", err);
    }
  };
  // 2. Lógica de GPS Real
  const startGpsTracking = (tripId: number) => {
    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta GPS.");
      return;
    }

    setGpsActive(true);
    setGpsError(null);

    // WatchPosition: Se dispara cada vez que te mueves
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Enviar a BD
        await updateTripLocation(tripId, latitude, longitude);
      },
      (error) => {
        console.error("Error GPS:", error);
        setGpsActive(false);
        setGpsError("No se pudo obtener ubicación. Revisa permisos.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  };

  // Limpieza al salir
  React.useEffect(() => {
    return () => stopGpsTracking();
  }, []);

  const handleStartTrip = async () => {
    if (!driverId || !selectedRouteId || !selectedVehicleId) return;

    // Pedir primera ubicación para iniciar
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newTrip = await startTrip({
          routeId: parseInt(selectedRouteId),
          vehicleId: parseInt(selectedVehicleId),
          driverId: driverId,
          startLat: pos.coords.latitude,
          startLng: pos.coords.longitude,
        });
        if (newTrip) {
          setActiveTrip(newTrip);
          startGpsTracking(newTrip.id);
          requestWakeLock(); // <--- AGREGA ESTA LÍNEA
        }
      },
      (err) => {
        alert("Debes permitir la ubicación para iniciar el viaje.");
      }
    );
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    if (confirm("¿Finalizar turno?")) {
      await endTrip(activeTrip.id);
      stopGpsTracking();

      // LIBERAR WAKE LOCK 👇
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }

      setActiveTrip(null);
      setSelectedRouteId("");
      setSelectedVehicleId("");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (!driverId) return <div className="p-8 text-center">Acceso denegado.</div>;

  // VISTA: INICIAR
  if (!activeTrip) {
    return (
      <div className="max-w-md mx-auto mt-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Ruta</CardTitle>
            <CardDescription>
              El sistema pedirá acceso a tu GPS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ruta</Label>
              <Select
                onValueChange={setSelectedRouteId}
                value={selectedRouteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select
                onValueChange={setSelectedVehicleId}
                value={selectedVehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {gpsError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{gpsError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handleStartTrip}
              disabled={!selectedRouteId || !selectedVehicleId}
            >
              <Play className="mr-2" /> Iniciar y Activar GPS
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // VISTA: EN RUTA
  const route = routes.find((r) => r.id === activeTrip.routeId);
  const vehicle = vehicles.find((v) => v.id === activeTrip.vehicleId);

  return (
    <div className="max-w-md mx-auto mt-4 p-4 space-y-4">
      <Card
        className={`border-2 ${
          gpsActive
            ? "border-green-500 bg-green-50"
            : "border-yellow-500 bg-yellow-50"
        }`}
      >
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-2">
            {gpsActive ? (
              <Radio className="h-12 w-12 text-green-600 animate-pulse" />
            ) : (
              <MapPin className="h-12 w-12 text-yellow-600" />
            )}
          </div>
          <h2 className="text-xl font-bold">
            {gpsActive ? "GPS Transmitiendo" : "Buscando señal..."}
          </h2>
          <p className="text-sm text-muted-foreground">
            No cierres esta ventana.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{route?.name}</CardTitle>
          <CardDescription>Vehículo: {vehicle?.plate}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-around text-center">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Inicio</p>
            <p className="text-2xl font-bold">
              {format(new Date(activeTrip.startTime), "HH:mm")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Pasajeros</p>
            {/* CORRECCIÓN AQUÍ 👇 */}
            <p className="text-2xl font-bold">
              {(activeTrip.PasajerosRegistrados || 0) +
                (activeTrip.PasajerosInvitados || 0)}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={handleEndTrip}
          >
            <Square className="mr-2" /> Finalizar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
