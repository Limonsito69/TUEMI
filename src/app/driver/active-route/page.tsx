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
  mockTrips,
  getRouteById,
  getVehicleById,
  getDriverById,
} from '@/lib/data';
import { MapPin, Users, Play, Square, User, Bus } from 'lucide-react';
import { format } from 'date-fns';

export default function DriverActiveRoutePage() {
  const driver = getDriverById('1'); // Conductor de ejemplo: Juan López
  const activeTrip = mockTrips.find(
    (trip) => trip.driverId === driver?.id && trip.status === 'En curso'
  );

  const [tripStatus, setTripStatus] = React.useState<'pending' | 'active' | 'finished'>('active');
  const [passengerCount, setPassengerCount] = React.useState(activeTrip ? activeTrip.passengers.abonado + activeTrip.passengers.noAbonado : 13);


  if (!driver || !activeTrip) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay viaje activo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tienes ninguna ruta asignada en este momento.</p>
        </CardContent>
      </Card>
    );
  }

  const route = getRouteById(activeTrip.routeId);
  const vehicle = getVehicleById(activeTrip.vehicleId);

  const stops = [
    { name: 'Inicio: Plaza del Estudiante', status: 'visitado' },
    { name: 'Parada: Av. 6 de Agosto', status: 'visitado' },
    { name: 'Parada: C. 21 de Calacoto', status: 'actual' },
    { name: 'Parada: C. 15 de Obrajes', status: 'pendiente' },
    { name: 'Destino: Campus EMI Irpavi', status: 'pendiente' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
         <Card>
            <CardHeader>
                <CardTitle>Información del Viaje Actual</CardTitle>
                <CardDescription>Ruta: <span className="font-semibold">{route?.name}</span></CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <User className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Conductor</p>
                        <p className="font-semibold">{driver.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <Bus className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Vehículo</p>
                        <p className="font-semibold">{vehicle?.plate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <Users className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-sm text-muted-foreground">Pasajeros</p>
                        <p className="font-semibold">{passengerCount} / {vehicle?.capacity}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button disabled={tripStatus !== 'active'} onClick={() => setPassengerCount(p => p+1)}>
                    +1 Pasajero
                </Button>
                <Button variant="outline" disabled={tripStatus !== 'active'} onClick={() => setPassengerCount(p => Math.max(0, p-1))}>
                    -1 Pasajero
                </Button>
            </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Paradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parada</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stops.map((stop) => (
                  <TableRow key={stop.name}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${stop.status === 'actual' ? 'text-primary' : 'text-muted-foreground'}`}/>
                        {stop.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          stop.status === 'visitado'
                            ? 'secondary'
                            : stop.status === 'actual'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Control de Viaje</CardTitle>
            <CardDescription>Inicia o finaliza tu ruta actual.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
             <p className="text-sm text-muted-foreground">Estado Actual</p>
             <Badge variant={tripStatus === 'active' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                {tripStatus === 'active' ? 'En Curso' : 'Finalizado'}
             </Badge>
             <p className="text-sm text-muted-foreground">
                Iniciado a las {format(new Date(activeTrip.startTime), 'HH:mm')}
             </p>
          </CardContent>
          <CardFooter className="grid grid-cols-1 gap-2">
            <Button size="lg" disabled={tripStatus !== 'pending'} onClick={() => setTripStatus('active')}>
                <Play className="mr-2 h-4 w-4"/> Iniciar Viaje
            </Button>
            <Button size="lg" variant="destructive" disabled={tripStatus !== 'active'} onClick={() => setTripStatus('finished')}>
                <Square className="mr-2 h-4 w-4"/> Finalizar Viaje
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
