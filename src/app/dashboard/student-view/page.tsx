'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Sparkles, Send } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getTransportSuggestions } from '@/lib/actions';
import type { SuggestAlternativeTransportOutput } from '@/ai/flows/transportation-disruption-suggestions';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  disruptionDescription: z.string().min(10, 'Please describe the disruption in more detail.'),
  studentLocation: z.string().min(3, 'Please enter your current location.'),
  destination: z.string().min(3, 'Please enter your destination.'),
});

export default function StudentViewPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SuggestAlternativeTransportOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disruptionDescription: 'My bus (Route Irpavi - EMI) has broken down and is stopped.',
      studentLocation: 'Calle 21 de Calacoto, La Paz',
      destination: 'EMI University, Irpavi Campus',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const suggestionResult = await getTransportSuggestions(values);
    setResult(suggestionResult);
    setIsLoading(false);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Transport Disruption Helper
            </CardTitle>
            <CardDescription>
              Facing a transport problem? Describe the situation, and our AI will suggest alternative ways to get to your destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disruptionDescription">Disruption Description</Label>
                <Textarea
                  id="disruptionDescription"
                  placeholder="e.g., 'My bus broke down', 'There is a protest blocking the road'"
                  {...form.register('disruptionDescription')}
                />
                {form.formState.errors.disruptionDescription && <p className="text-sm text-destructive">{form.formState.errors.disruptionDescription.message}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentLocation">Your Current Location</Label>
                  <Input id="studentLocation" placeholder="e.g., 'Plaza Abaroa, Sopocachi'" {...form.register('studentLocation')} />
                  {form.formState.errors.studentLocation && <p className="text-sm text-destructive">{form.formState.errors.studentLocation.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Your Destination</Label>
                  <Input id="destination" placeholder="e.g., 'EMI University, Irpavi'" {...form.register('destination')} />
                  {form.formState.errors.destination && <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>}
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating Suggestions...' : 'Get Suggestions'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          {isLoading && (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2"/>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-5/6"/>
                    <Skeleton className="h-4 w-full"/>
                </CardContent>
            </Card>
          )}
          {result && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Generated Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
                        {result.alternativeSuggestions}
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}
