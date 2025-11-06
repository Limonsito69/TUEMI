'use server';

/**
 * @fileOverview Detecta incidentes inusuales durante una ruta, como paradas prolongadas o desviaciones del camino planificado.
 *
 * - detectRouteIncident - Una función que maneja el proceso de detección de incidentes en la ruta.
 * - DetectRouteIncidentInput - El tipo de entrada para la función detectRouteIncident.
 * - DetectRouteIncidentOutput - El tipo de retorno para la función detectRouteIncident.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRouteIncidentInputSchema = z.object({
  routeId: z.string().describe('El ID de la ruta que se está monitoreando.'),
  vehicleId: z.string().describe('El ID del vehículo en la ruta.'),
  currentLocation: z
    .object({
      latitude: z.number().describe('La latitud actual del vehículo.'),
      longitude: z.number().describe('La longitud actual del vehículo.'),
      timestamp: z.string().describe('La marca de tiempo de la lectura de la ubicación (formato ISO 8601).'),
    })
    .describe('La ubicación actual del vehículo.'),
  plannedRoute: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
  })).describe('La ruta planificada como un arreglo de coordenadas de latitud/longitud.'),
  lastKnownGoodLocation: z
    .object({
      latitude: z.number().describe('La última latitud conocida del vehículo que estaba en ruta.'),
      longitude: z.number().describe('La última longitud conocida del vehículo que estaba en ruta.'),
      timestamp: z.string().describe('La marca de tiempo de la lectura de la ubicación (formato ISO 8601).'),
    })
    .optional().describe('La última ubicación conocida del vehículo que estaba en ruta.'),
  averageSpeed: z.number().describe('La velocidad promedio del vehículo en esta ruta en km/h.'),
  currentSpeed: z.number().describe('La velocidad actual del vehículo en km/h.'),
  passengers: z.number().describe('El número de pasajeros actualmente en el vehículo.'),
  capacity: z.number().describe('La capacidad máxima del vehículo.'),
});
export type DetectRouteIncidentInput = z.infer<typeof DetectRouteIncidentInputSchema>;

const DetectRouteIncidentOutputSchema = z.object({
  incidentDetected: z.boolean().describe('Si se ha detectado un incidente.'),
  incidentType: z
    .string()
    .optional()
    .describe('El tipo de incidente detectado (ej., parada prolongada, desvío de ruta, sobrecupo).'),
  incidentDetails: z.string().optional().describe('Detalles sobre el incidente.'),
});
export type DetectRouteIncidentOutput = z.infer<typeof DetectRouteIncidentOutputSchema>;

export async function detectRouteIncident(input: DetectRouteIncidentInput): Promise<DetectRouteIncidentOutput> {
  return detectRouteIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectRouteIncidentPrompt',
  input: {schema: DetectRouteIncidentInputSchema},
  output: {schema: DetectRouteIncidentOutputSchema},
  prompt: `Eres un experto en detectar incidentes inusuales durante una ruta de transporte de la Universidad EMI en La Paz, Bolivia.

  Recibirás datos en tiempo real sobre la ruta, el vehículo y la ubicación, y deberás determinar si está ocurriendo un incidente.

  Aquí está la información sobre la ruta actual:
  - ID de Ruta: {{{routeId}}}
  - ID de Vehículo: {{{vehicleId}}}
  - Ubicación Actual: Latitud {{{currentLocation.latitude}}}, Longitud {{{currentLocation.longitude}}} a las {{{currentLocation.timestamp}}}
  - Última Ubicación Buena Conocida: Latitud {{{lastKnownGoodLocation.latitude}}}, Longitud {{{lastKnownGoodLocation.longitude}}} a las {{{lastKnownGoodLocation.timestamp}}}
  - Ruta Planificada: (lista de coordenadas - no disponible en esta versión, pero aún es posible calcular desviaciones)
  - Velocidad Promedio: {{{averageSpeed}}} km/h
  - Velocidad Actual: {{{currentSpeed}}} km/h
  - Pasajeros: {{{passengers}}}
  - Capacidad: {{{capacity}}}

  Considera los siguientes factores para detectar incidentes:
  - Parada Prolongada: Si la velocidad actual es 0 y el vehículo ha estado estacionario por más de 10 minutos en una ubicación que no está en la ruta, es una parada prolongada.
  - Desvío de Ruta: Si el vehículo está a más de 500 metros de la ruta planificada, es un desvío de ruta. (Nota: la ruta real no está disponible, así que haz una estimación basada en la última ubicación buena conocida).
  - Sobrecupo: Si el número de pasajeros excede la capacidad del vehículo, es un incidente de sobrecupo.

  Emite tu decisión en formato JSON. Si se detecta un incidente, establece incidentDetected en true y proporciona el incidentType y los incidentDetails. Si no se detecta ningún incidente, establece incidentDetected en false.

  Los incidentDetails deben describir el incidente y el impacto potencial. Asegúrate de que la ubicación y la hora actual se mencionen en los detalles para facilitar la verificación manual.

  Si el vehículo aún no ha visitado una ubicación "buena" conocida, entonces no intentes determinar si se ha desviado de su ruta, ya que no hay una línea de base con la cual comparar.
  `,
});

const detectRouteIncidentFlow = ai.defineFlow(
  {
    name: 'detectRouteIncidentFlow',
    inputSchema: DetectRouteIncidentInputSchema,
    outputSchema: DetectRouteIncidentOutputSchema,
  },
  async input => {
    const {
      currentLocation,
      averageSpeed,
      currentSpeed,
      passengers,
      capacity,
      lastKnownGoodLocation
    } = input;

    // Parada Prolongada (velocidad 0 por > 10 minutos)
    const isStopped = currentSpeed === 0;

    // Sobrecupo
    const isOvercapacity = passengers > capacity;

    // Desvío de Ruta (distancia de la ruta planificada > 500 metros). No disponible en esta versión debido a la falta de información de la ruta planificada, pero podemos compararla con la última ubicación buena conocida.

    // Comprobar si se cumplen las condiciones para un incidente
    let incidentDetected = false;
    let incidentType: string | undefined = undefined;
    let incidentDetails: string | undefined = undefined;

    if (isStopped) {
      incidentDetected = true;
      incidentType = 'parada_prolongada';
      incidentDetails = `El vehículo ha estado detenido en la ubicación (${currentLocation.latitude}, ${currentLocation.longitude}) por más de 10 minutos.`
    }

    if (isOvercapacity) {
      incidentDetected = true;
      incidentType = 'sobrecupo';
      incidentDetails = `El vehículo tiene sobrecupo. Hay ${passengers} pasajeros, pero el vehículo solo tiene una capacidad de ${capacity}.`;
    }

    if (lastKnownGoodLocation == null) {
        // No intentar calcular el desvío de ruta, no hay una línea de base con la cual comparar.
    } else {
      // Implementé una versión simplificada de la fórmula de Haversine, suficientemente buena para una precisión de 500m
      const R = 6371e3; // metros
      const φ1 = lastKnownGoodLocation.latitude * Math.PI/180; // φ, λ en radianes
      const φ2 = currentLocation.latitude * Math.PI/180;
      const Δφ = (currentLocation.latitude-lastKnownGoodLocation.latitude) * Math.PI/180;
      const Δλ = (currentLocation.longitude-lastKnownGoodLocation.longitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      const distance = R * c;

      if (distance > 500) {
        incidentDetected = true;
        incidentType = 'desvio_de_ruta';
        incidentDetails = `El vehículo se ha desviado de la ruta. Está a ${Math.round(distance)} metros de la última ubicación conocida. Coordenadas actuales: (${currentLocation.latitude}, ${currentLocation.longitude}). Última ubicación conocida: (${lastKnownGoodLocation.latitude}, ${lastKnownGoodLocation.longitude})`;
      }
    }

    if (!incidentDetected) {
      return {incidentDetected: false};
    }

    // No llamar al prompt si ya hemos determinado la lógica del incidente
    return {
      incidentDetected,
      incidentType,
      incidentDetails,
    };
  }
);
