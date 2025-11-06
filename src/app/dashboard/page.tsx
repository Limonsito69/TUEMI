import {
  Activity,
  ArrowUpRight,
  Bus,
  AlertTriangle,
  Users,
  Car,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { mockAlerts, mockTrips, mockDrivers, mockUsers, mockRoutes, getVehicleById, mockVehicles } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const onlineDrivers = mockTrips.filter(t => t.status === 'En curso').length;
const totalAbonados = mockUsers.filter(u => u.status === 'Abonado').length;
const activeRoutes = mockRoutes.filter(r => r.status === 'Publicada').length;

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Routes
              </CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRoutes}</div>
              <p className="text-xs text-muted-foreground">
                currently operational
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscribed Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalAbonados}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Drivers</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineDrivers}</div>
              <p className="text-xs text-muted-foreground">
                currently on a trip
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{mockAlerts.length}</div>
              <p className="text-xs text-muted-foreground">
                in the last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>
                  Overview of the latest transportation activities.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/monitoring">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Route
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Passengers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrips.slice(0, 5).map((trip) => {
                    const driver = mockDrivers.find(d => d.id === trip.driverId);
                    const route = mockRoutes.find(r => r.id === trip.routeId);
                    const driverAvatar = PlaceHolderImages.find(i => i.id === driver?.avatar);
                    return (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="hidden h-9 w-9 sm:flex">
                              <AvatarImage src={driverAvatar?.imageUrl} alt="Avatar" />
                              <AvatarFallback>{driver?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{driver?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {route?.name}
                        </TableCell>
                         <TableCell className="hidden md:table-cell">
                          <Badge className="text-xs" variant={trip.status === 'En curso' ? 'default' : 'secondary'}>
                            {trip.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{trip.passengers.abonado + trip.passengers.noAbonado}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Live incidents and alerts from the transport fleet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              {mockAlerts.map((alert) => {
                 const vehicle = mockVehicles.find(v => v.plate === alert.vehiclePlate);
                return (
                <div key={alert.id} className="flex items-center gap-4">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {alert.type} - {alert.vehiclePlate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.details}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )})}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
