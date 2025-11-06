'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest alternative transportation arrangements
 * when a transportation disruption is detected in the T.U.E.M.I. system.
 *
 * @exports suggestAlternativeTransport - An async function that takes a description of a transportation disruption and returns suggestions for alternative transportation.
 * @exports SuggestAlternativeTransportInput - The input type for the suggestAlternativeTransport function.
 * @exports SuggestAlternativeTransportOutput - The output type for the suggestAlternativeTransport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeTransportInputSchema = z.object({
  disruptionDescription: z.string().describe('A description of the transportation disruption, including location, time, and nature of the disruption.'),
  studentLocation: z.string().describe('The current location of the student.'),
  destination: z.string().describe('The student’s destination (e.g., university, home).'),
});
export type SuggestAlternativeTransportInput = z.infer<typeof SuggestAlternativeTransportInputSchema>;

const SuggestAlternativeTransportOutputSchema = z.object({
  alternativeSuggestions: z.string().describe('A list of suggested alternative transportation arrangements, considering the disruption, student location, and destination.'),
});
export type SuggestAlternativeTransportOutput = z.infer<typeof SuggestAlternativeTransportOutputSchema>;

export async function suggestAlternativeTransport(input: SuggestAlternativeTransportInput): Promise<SuggestAlternativeTransportOutput> {
  return suggestAlternativeTransportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeTransportPrompt',
  input: {schema: SuggestAlternativeTransportInputSchema},
  output: {schema: SuggestAlternativeTransportOutputSchema},
  prompt: `You are a helpful assistant that suggests alternative transportation arrangements for students facing transportation disruptions.

  Given the following information about the disruption, the student's location, and their destination, provide a list of alternative transportation options.

  Disruption Description: {{{disruptionDescription}}}
  Student Location: {{{studentLocation}}}
  Destination: {{{destination}}}

  Consider factors such as:
  - Public transportation options (e.g., buses, trains, taxis)
  - Ride-sharing services
  - Walking or biking (if feasible)
  - Estimated travel time and cost
  - Safety and reliability

  Provide a clear and concise list of suggestions to help the student reach their destination on time.
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
