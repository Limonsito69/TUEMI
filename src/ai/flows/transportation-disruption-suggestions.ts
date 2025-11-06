'use server';

/**
 * @fileOverview Este archivo define un flujo de Genkit para sugerir arreglos de transporte alternativos
 * cuando se detecta una interrupción del transporte en el sistema T.U.E.M.I.
 *
 * @exports suggestAlternativeTransport - Una función asíncrona que toma una descripción de una interrupción del transporte y devuelve sugerencias para transporte alternativo.
 * @exports SuggestAlternativeTransportInput - El tipo de entrada para la función suggestAlternativeTransport.
 * @exports SuggestAlternativeTransportOutput - El tipo de salida para la función suggestAlternativeTransport.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeTransportInputSchema = z.object({
  disruptionDescription: z.string().describe('Una descripción de la interrupción del transporte, incluyendo ubicación, hora y naturaleza de la interrupción.'),
  studentLocation: z.string().describe('La ubicación actual del estudiante.'),
  destination: z.string().describe('El destino del estudiante (ej., universidad, casa).'),
});
export type SuggestAlternativeTransportInput = z.infer<typeof SuggestAlternativeTransportInputSchema>;

const SuggestAlternativeTransportOutputSchema = z.object({
  alternativeSuggestions: z.string().describe('Una lista de arreglos de transporte alternativos sugeridos, considerando la interrupción, la ubicación del estudiante y el destino.'),
});
export type SuggestAlternativeTransportOutput = z.infer<typeof SuggestAlternativeTransportOutputSchema>;

export async function suggestAlternativeTransport(input: SuggestAlternativeTransportInput): Promise<SuggestAlternativeTransportOutput> {
  return suggestAlternativeTransportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeTransportPrompt',
  input: {schema: SuggestAlternativeTransportInputSchema},
  output: {schema: SuggestAlternativeTransportOutputSchema},
  prompt: `Eres un asistente útil que sugiere arreglos de transporte alternativos para estudiantes de la Universidad EMI en La Paz, Bolivia, que enfrentan interrupciones en el transporte.

  Dada la siguiente información sobre la interrupción, la ubicación del estudiante y su destino, proporciona una lista de opciones de transporte alternativas.

  Descripción de la Interrupción: {{{disruptionDescription}}}
  Ubicación del Estudiante: {{{studentLocation}}}
  Destino: {{{destination}}}

  Considera factores como:
  - Opciones de transporte público en La Paz (ej., minibuses, PumaKatari, WaynaBus, Teleférico, taxis, trufis)
  - Servicios de transporte por aplicación (ej. Uber, InDriver, Yango)
  - Caminar o ir en bicicleta (si es factible)
  - Tiempo de viaje y costo estimados
  - Seguridad y fiabilidad

  Proporciona una lista clara y concisa de sugerencias para ayudar al estudiante a llegar a su destino a tiempo. Sé específico sobre las líneas de minibús o teleférico si es posible.
`,
});

const suggestAlternativeTransportFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeTransportFlow',
    inputSchema: SuggestAlternativeTransportInputSchema,
    outputSchema: SuggestAlternativeTransportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
