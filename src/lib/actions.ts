'use server';

import { detectRouteIncident, DetectRouteIncidentInput, DetectRouteIncidentOutput } from "@/ai/flows/route-incident-detection";
import { suggestAlternativeTransport, SuggestAlternativeTransportInput, SuggestAlternativeTransportOutput } from "@/ai/flows/transportation-disruption-suggestions";

export async function runIncidentDetection(input: DetectRouteIncidentInput): Promise<DetectRouteIncidentOutput> {
    console.log('Ejecutando detección de incidentes con entrada:', input);
    try {
        const result = await detectRouteIncident(input);
        return result;
    } catch (error) {
        console.error("Error en runIncidentDetection:", error);
        return {
            incidentDetected: true,
            incidentType: 'Error',
            incidentDetails: 'Ocurrió un error al procesar la solicitud.'
        };
    }
}


export async function getTransportSuggestions(input: SuggestAlternativeTransportInput): Promise<SuggestAlternativeTransportOutput> {
    console.log('Obteniendo sugerencias de transporte con entrada:', input);
    try {
        const result = await suggestAlternativeTransport(input);
        return result;
    } catch (error) {
        console.error("Error en getTransportSuggestions:", error);
        return {
            alternativeSuggestions: 'Lo sentimos, no pudimos obtener sugerencias en este momento. Por favor, verifica los servicios de transporte público directamente.'
        };
    }
}
