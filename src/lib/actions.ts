'use server';

import { detectRouteIncident, DetectRouteIncidentInput, DetectRouteIncidentOutput } from "@/ai/flows/route-incident-detection";
import { suggestAlternativeTransport, SuggestAlternativeTransportInput, SuggestAlternativeTransportOutput } from "@/ai/flows/transportation-disruption-suggestions";

export async function runIncidentDetection(input: DetectRouteIncidentInput): Promise<DetectRouteIncidentOutput> {
    console.log('Running incident detection with input:', input);
    try {
        const result = await detectRouteIncident(input);
        return result;
    } catch (error) {
        console.error("Error in runIncidentDetection:", error);
        return {
            incidentDetected: true,
            incidentType: 'Error',
            incidentDetails: 'An error occurred while processing the request.'
        };
    }
}


export async function getTransportSuggestions(input: SuggestAlternativeTransportInput): Promise<SuggestAlternativeTransportOutput> {
    console.log('Getting transport suggestions with input:', input);
    try {
        const result = await suggestAlternativeTransport(input);
        return result;
    } catch (error) {
        console.error("Error in getTransportSuggestions:", error);
        return {
            alternativeSuggestions: 'Sorry, we could not fetch suggestions at this time. Please check public transport services directly.'
        };
    }
}
