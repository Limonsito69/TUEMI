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

import { mockTrips, getDriverById, getRouteById, getVehicleById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Bus, Clock, Users, Route as RouteIcon } from 'lucide-react';
import { IncidentDetector } from '@/components/incident-detector';

const mapBackground = PlaceHolderImages.find(i => i.id === 'map-background');

function VehiclePopover({ tripId }: { tripId: string }) {
  const trip = mockTrips.find(t => t.id === tripId);
  if (!trip) return null;

  const driver = getDriverById(trip.driverId);
  const route = getRouteById(trip.routeId);
  const vehicle = getVehicleById(trip.vehicleId);
  const driverAvatar = PlaceHolderImages.find(i => i.id === driver?.avatar);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="absolute w-8 h-8 rounded-full bg-primary/80 border-2 border-primary-foreground/80 shadow-lg animate-pulse flex items-center justify-center">
            <Bus className="w-4 h-4 text-primary-foreground"/>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{route?.name}</h4>
            <p className="text-sm text-muted-foreground">
              Vehicle: {vehicle?.plate}
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
                <p className="text-sm text-muted-foreground">Driver</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground"/>
                <span>{trip.passengers.abonado + trip.passengers.noAbonado} / {vehicle?.capacity} passengers</span>
            </div>
             <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground"/>
                <span>On trip for {Math.floor((Date.now() - new Date(trip.startTime).getTime()) / 60000)} min</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function MonitoringPage() {
  const activeTrips = mockTrips.filter(trip => trip.status === 'En curso');
  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
            <CardDescription>Real-time location of all active vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[400px] md:h-[600px] rounded-lg overflow-hidden bg-muted">
              {mapBackground && (
                <Image
                  src={mapBackground.imageUrl}
                  alt="Map background"
                  fill
                  className="object-cover"
                  data-ai-hint={mapBackground.imageHint}
                />
              )}
               {/* Mock vehicle positions */}
              <div style={{ top: '25%', left: '40%'}}><VehiclePopover tripId="trip1"/></div>
              <div style={{ top: '55%', left: '60%'}}><VehiclePopover tripId="trip2"/></div>
            </div>
          </CardContent>
        </Card>
        <IncidentDetector/>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Trips</CardTitle>
            <CardDescription>All vehicles currently on a route.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrips.map(trip => {
                  const route = getRouteById(trip.routeId);
                  const vehicle = getVehicleById(trip.vehicleId);
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{route?.name}</TableCell>
                      <TableCell>{vehicle?.plate}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default">{trip.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
