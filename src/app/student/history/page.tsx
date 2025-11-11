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
import { mockTrips, getRouteById } from '@/lib/data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StudentHistoryPage() {
  const completedTrips = mockTrips.filter(trip => trip.endTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Viajes</CardTitle>
        <CardDescription>
          Aquí puedes ver todos los viajes que has realizado con el transporte de la universidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ruta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora de Inicio</TableHead>
              <TableHead className="text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedTrips.map(trip => {
              const route = getRouteById(trip.routeId);
              const tripDate = new Date(trip.startTime);
              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{route?.name}</TableCell>
                  <TableCell>{format(tripDate, 'PPP', { locale: es })}</TableCell>
                  <TableCell>{format(tripDate, 'p', { locale: es })}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{trip.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
             <TableRow>
                <TableCell className="font-medium">Ruta Centro – EMI</TableCell>
                <TableCell>{format(new Date(Date.now() - 2 * 24 * 60 * 60000), 'PPP', { locale: es })}</TableCell>
                <TableCell>{format(new Date(Date.now() - 2 * 24 * 60 * 60000), 'p', { locale: es })}</TableCell>
                <TableCell className="text-right">
                <Badge variant="secondary">Finalizado</Badge>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
