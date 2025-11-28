"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bus,
  AlertTriangle,
  Users,
  Car,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Importamos tipos y acciones reales
import { Trip, Driver, Route } from "@/types";
import {
  getSystemStats,
  getActiveTrips,
  getDrivers,
  getRoutes,
  DashboardStats,
} from "@/lib/actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentTrips, setRecentTrips] = React.useState<Trip[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        // Cargar todas las estadísticas y datos necesarios en paralelo
        const [statsData, tripsData, driversData, routesData] =
          await Promise.all([
            getSystemStats(),
            getActiveTrips(),
            getDrivers(),
            getRoutes(),
          ]);

        setStats(statsData);
        // Tomamos solo los 5 primeros viajes para el resumen del dashboard
        setRecentTrips(tripsData.slice(0, 5));
        setDrivers(driversData);
        setRoutes(routesData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* --- TARJETAS DE ESTADÍSTICAS --- */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rutas Activas
              </CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentTrips.length}</div>
              <p className="text-xs text-muted-foreground">
                vehículos en circulación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Abonados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.abonados}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0
                  ? ((stats.abonados / stats.totalUsers) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conductores</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
              <p className="text-xs text-muted-foreground">
                registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Viajes Totales
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrips}</div>
              <p className="text-xs text-muted-foreground">desde el inicio</p>
            </CardContent>
          </Card>
        </div>

        {/* --- SECCIÓN INFERIOR --- */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* TABLA DE VIAJES RECIENTES */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Viajes en Curso</CardTitle>
                <CardDescription>
                  Monitoreo de la flota activa en tiempo real.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/admin/monitoring">
                  Ver Mapa
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conductor</TableHead>
                    <TableHead className="hidden xl:table-cell">Ruta</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Estado
                    </TableHead>
                    <TableHead className="text-right">Pasajeros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrips.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground h-24"
                      >
                        No hay vehículos en ruta en este momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTrips.map((trip) => {
                      const driver = drivers.find(
                        (d) => d.id === trip.driverId
                      );
                      const route = routes.find((r) => r.id === trip.routeId);
                      const driverAvatar = PlaceHolderImages.find(
                        (i) => i.id === driver?.avatar
                      );

                      return (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="hidden h-9 w-9 sm:flex">
                                <AvatarImage
                                  src={driverAvatar?.imageUrl}
                                  alt="Avatar"
                                />
                                <AvatarFallback>
                                  {driver?.name.charAt(0) || "C"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {driver?.name || "Desconocido"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {route?.name || "Ruta no asignada"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              className="text-xs"
                              variant={
                                trip.status === "En curso"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {trip.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {(trip.PasajerosRegistrados || 0) +
                              (trip.PasajerosInvitados || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SECCIÓN DE ALERTAS (Simulada por ahora) */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Incidentes reportados.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                <AlertTriangle className="h-8 w-8 mb-2 opacity-20" />
                <p>Sin alertas críticas registradas.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
