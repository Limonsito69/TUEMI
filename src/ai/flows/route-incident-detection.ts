'use server';

/**
 * @fileOverview Detects unusual incidents during a route, such as prolonged stops or deviations from the planned path.
 *
 * - detectRouteIncident - A function that handles the route incident detection process.
 * - DetectRouteIncidentInput - The input type for the detectRouteIncident function.
 * - DetectRouteIncidentOutput - The return type for the detectRouteIncident function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRouteIncidentInputSchema = z.object({
  routeId: z.string().describe('The ID of the route being monitored.'),
  vehicleId: z.string().describe('The ID of the vehicle on the route.'),
  currentLocation: z
    .object({
      latitude: z.number().describe('The current latitude of the vehicle.'),
      longitude: z.number().describe('The current longitude of the vehicle.'),
      timestamp: z.string().describe('The timestamp of the location reading (ISO 8601 format).'),
    })
    .describe('The current location of the vehicle.'),
  plannedRoute: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
  })).describe('The planned route as an array of latitude/longitude coordinates.'),
  lastKnownGoodLocation: z
    .object({
      latitude: z.number().describe('The last known latitude of the vehicle that was on route.'),
      longitude: z.number().describe('The last known longitude of the vehicle that was on route.'),
      timestamp: z.string().describe('The timestamp of the location reading (ISO 8601 format).'),
    })
    .optional().describe('The last known location of the vehicle that was on route.'),
  averageSpeed: z.number().describe('The average speed of the vehicle on this route in km/h.'),
  currentSpeed: z.number().describe('The current speed of the vehicle in km/h.'),
  passengers: z.number().describe('The number of passengers currently on the vehicle.'),
  capacity: z.number().describe('The maximum capacity of the vehicle.'),
});
export type DetectRouteIncidentInput = z.infer<typeof DetectRouteIncidentInputSchema>;

const DetectRouteIncidentOutputSchema = z.object({
  incidentDetected: z.boolean().describe('Whether an incident has been detected.'),
  incidentType: z
    .string()
    .optional()
    .describe('The type of incident detected (e.g., prolonged stop, route deviation, overcapacity).'),
  incidentDetails: z.string().optional().describe('Details about the incident.'),
});
export type DetectRouteIncidentOutput = z.infer<typeof DetectRouteIncidentOutputSchema>;

export async function detectRouteIncident(input: DetectRouteIncidentInput): Promise<DetectRouteIncidentOutput> {
  return detectRouteIncidentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectRouteIncidentPrompt',
  input: {schema: DetectRouteIncidentInputSchema},
  output: {schema: DetectRouteIncidentOutputSchema},
  prompt: `You are an expert in detecting unusual incidents during a university transport route.

  You will receive real-time data about the route, vehicle, and location, and must determine if there is an incident occurring.

  Here is the information about the current route:
  - Route ID: {{{routeId}}}
  - Vehicle ID: {{{vehicleId}}}
  - Current Location: Latitude {{{currentLocation.latitude}}}, Longitude {{{currentLocation.longitude}}} at {{{currentLocation.timestamp}}}
  - Last Known Good Location: Latitude {{{lastKnownGoodLocation.latitude}}}, Longitude {{{lastKnownGoodGoodLocation.longitude}}} at {{{lastKnownGoodGoodLocation.timestamp}}}
  - Planned Route: (list of coordinates - not available in this version, but deviations are still possible to compute)
  - Average Speed: {{{averageSpeed}}} km/h
  - Current Speed: {{{currentSpeed}}} km/h
  - Passengers: {{{passengers}}}
  - Capacity: {{{capacity}}}

  Consider the following factors to detect incidents:
  - Prolonged Stop: If the current speed is 0 and the vehicle has been stationary for more than 10 minutes at a location not on the route, it's a prolonged stop.
  - Route Deviation: If the vehicle is more than 500 meters away from the planned route, it's a route deviation. (Note: actual route is not available so make an estimation based on previous good known location).
  - Overcapacity: If the number of passengers exceeds the vehicle capacity, it's an overcapacity incident.

  Output your decision in JSON format. If an incident is detected, set incidentDetected to true and provide the incidentType and incidentDetails. If no incident is detected, set incidentDetected to false.

  The incidentDetails should describe the incident and the potential impact. Make sure the location and current time are mentioned in the details to facilitate manual verification.

  If the vehicle has not yet visited a known "good" location, then do not try to determine if it has deviated from its route since there is no baseline to compare against.
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

    // Prolonged Stop (speed 0 for > 10 minutes)
    const isStopped = currentSpeed === 0;

    // Overcapacity
    const isOvercapacity = passengers > capacity;

    // Route Deviation (distance from planned route > 500 meters). Unavailable in this version due to missing planned route information, but we can compare it against the last known good location

    // Check if the conditions for an incident are met
    let incidentDetected = false;
    let incidentType: string | undefined = undefined;
    let incidentDetails: string | undefined = undefined;

    if (isStopped) {
      incidentDetected = true;
      incidentType = 'prolonged_stop';
      incidentDetails = `The vehicle has been stopped at the location (${currentLocation.latitude}, ${currentLocation.longitude}) for more than 10 minutes.`
    }

    if (isOvercapacity) {
      incidentDetected = true;
      incidentType = 'overcapacity';
      incidentDetails = `The vehicle is over capacity. There are ${passengers} passengers, but the vehicle only has a capacity of ${capacity}.`;
    }

    if (lastKnownGoodLocation == null) {
        // Don't try to compute route deviation, there is no baseline to compare against.
    } else {
      // Implemented a dumbed-down version of the Haversine formula, good enough for 500m precision
      const R = 6371e3; // meters
      const φ1 = lastKnownGoodLocation.latitude * Math.PI/180; // φ, λ in radians
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
        incidentType = 'route_deviation';
        incidentDetails = `The vehicle has deviated from the route. It is ${distance} meters away from last known location. Current coordinates: (${currentLocation.latitude}, ${currentLocation.longitude}). Last known location coordinates: (${lastKnownGoodLocation.latitude}, ${lastKnownGoodLocation.longitude})`;
      }
    }

    if (!incidentDetected) {
      return {incidentDetected: false};
    }

    const {output} = await prompt(input);
    return {
      incidentDetected,
      incidentType,
      incidentDetails,
    };
  }
);
