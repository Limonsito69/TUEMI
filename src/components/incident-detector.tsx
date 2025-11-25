'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Sparkles } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { runIncidentDetection } from '@/lib/actions';
import { mockTrips, getVehicleById } from '@/lib/data';
import type { DetectRouteIncidentOutput } from '@/ai/flows/route-incident-detection';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  tripId: z.string().min(1, 'Por favor seleccione un vehículo.'),
  currentSpeed: z.coerce.number().min(0, 'La velocidad debe ser un número positivo.'),
});

export function IncidentDetector() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<DetectRouteIncidentOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripId: '',
      currentSpeed: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    // CORRECCIÓN 1: Convertimos t.id a string para poder compararlo con values.tripId
    const trip = mockTrips.find(t => t.id.toString() === values.tripId);
    const vehicle = trip ? getVehicleById(trip.vehicleId) : null;
    
    if (!trip || !vehicle) {
        alert('No se encontró el viaje o vehículo seleccionado.');
        setIsLoading(false);
        return;
    }

    const aiInput = {
        // CORRECCIÓN 2: La IA espera strings, así que convertimos los IDs numéricos
        routeId: trip.routeId.toString(),
        vehicleId: trip.vehicleId.toString(),
        currentLocation: {
            latitude: trip.locationLat || 0,
            longitude: trip.locationLng || 0,
            timestamp: new Date().toISOString(),
        },
        // Agregamos plannedRoute vacío para cumplir con el esquema de la IA
        plannedRoute: [], 
        lastKnownGoodLocation: {
            latitude: (trip.locationLat || 0) + 0.005, 
            longitude: (trip.locationLng || 0) + 0.005,
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        averageSpeed: 30, 
        currentSpeed: values.currentSpeed,
        passengers: trip.passengersAbonado + trip.passengersNoAbonado,
        capacity: vehicle.capacity,
    };

    const detectionResult = await runIncidentDetection(aiInput);
    setResult(detectionResult);
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot /> Detector de Incidentes IA
        </CardTitle>
        <CardDescription>
          Verifica manualmente un vehículo en busca de posibles incidentes como paradas prolongadas o desvíos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tripId">Vehículo Activo</Label>
              <Controller
                name="tripId"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="tripId">
                      <SelectValue placeholder="Seleccione un vehículo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTrips.filter(t => t.status === 'En curso').map(trip => {
                        const vehicle = getVehicleById(trip.vehicleId);
                        // CORRECCIÓN 3: El value del Select debe ser string, convertimos el ID
                        return <SelectItem key={trip.id} value={trip.id.toString()}>{vehicle?.plate}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSpeed">Velocidad Actual (km/h)</Label>
              <Input id="currentSpeed" type="number" {...form.register('currentSpeed')} />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Analizando...' : 'Verificar Incidentes'}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-6">
          {isLoading && <Skeleton className="h-24 w-full" />}
          {result && (
            <Alert variant={result.incidentDetected ? 'destructive' : 'default'}>
              <AlertTitle>
                {result.incidentDetected ? '¡Incidente Detectado!' : 'No se Detectó Ningún Incidente'}
              </AlertTitle>
              <AlertDescription>
                {result.incidentDetected
                  ? `Tipo: ${result.incidentType} - ${result.incidentDetails}`
                  : 'El vehículo parece estar operando normalmente.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}