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
import { Bus, Clock } from 'lucide-react';
import { mockRoutes, getDriverById, getVehicleById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const mapBackground = PlaceHolderImages.find(i => i.id === 'map-background');

export default function StudentRouteMapPage() {
  const publishedRoutes = mockRoutes.filter(route => route.status === 'Publicada');

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Rutas</CardTitle>
            <CardDescription>Visualiza las rutas disponibles y la ubicación de los buses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted">
              {mapBackground && (
                <Image
                  src={mapBackground.imageUrl}
                  alt="Fondo de mapa"
                  fill
                  className="object-cover"
                  data-ai-hint={mapBackground.imageHint}
                />
              )}
              {/* Ejemplo de un bus en el mapa */}
              <div style={{ top: '35%', left: '50%'}} className="absolute flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-primary/80 border-2 border-primary-foreground/80 shadow-lg flex items-center justify-center">
                    <Bus className="w-4 h-4 text-primary-foreground"/>
                 </div>
                 <div className="bg-background/80 text-foreground text-xs px-2 py-1 rounded-md mt-1">
                    Ruta Irpavi
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Rutas Publicadas</CardTitle>
            <CardDescription>Rutas activas que puedes tomar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishedRoutes.map(route => {
                  const vehicle = getVehicleById(route.vehicleId);
                  return (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>{route.schedule}</TableCell>
                      <TableCell>
                        <Badge variant={route.type === 'Abonados' ? 'default' : 'secondary'}>{route.type}</Badge>
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
