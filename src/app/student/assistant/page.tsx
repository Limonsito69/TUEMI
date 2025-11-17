'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, Sparkles, Send, MapPin, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTransportSuggestions } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

// Esquema de validación para el formulario
const formSchema = z.object({
  disruptionDescription: z.string().min(5, 'Por favor describe el problema con más detalle.'),
  studentLocation: z.string().min(3, 'Ingresa tu ubicación actual.'),
  destination: z.string().min(3, 'Ingresa tu destino.'),
});

export default function StudentAssistantPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  // Estado para guardar la respuesta de la IA
  const [suggestion, setSuggestion] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disruptionDescription: '',
      studentLocation: '',
      destination: 'Universidad EMI, Campus Irpavi',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    try {
      // Llamamos a la Server Action que usa Genkit
      const result = await getTransportSuggestions(values);
      setSuggestion(result.alternativeSuggestions);
    } catch (error) {
      console.error(error);
      setSuggestion("Lo siento, hubo un error al conectar con el asistente inteligente. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <Card className="h-fit">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="w-6 h-6" /> Asistente de Transporte
            </CardTitle>
            <CardDescription>
              ¿Problemas en tu ruta? Cuéntame qué pasa y te ayudaré a llegar a clases.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="disruptionDescription" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500"/> ¿Qué está pasando?
                </Label>
                <Textarea
                  id="disruptionDescription"
                  placeholder="Ej: Hay un bloqueo en el Prado, mi bus no avanza..."
                  className="min-h-[100px]"
                  {...form.register('disruptionDescription')}
                />
                {form.formState.errors.disruptionDescription && <p className="text-sm text-destructive">{form.formState.errors.disruptionDescription.message}</p>}
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentLocation" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500"/> Tu Ubicación
                  </Label>
                  <Input id="studentLocation" placeholder="Ej: Plaza del Estudiante" {...form.register('studentLocation')} />
                  {form.formState.errors.studentLocation && <p className="text-sm text-destructive">{form.formState.errors.studentLocation.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600"/> Destino
                  </Label>
                  <Input id="destination" placeholder="Ej: Universidad EMI, Irpavi" {...form.register('destination')} />
                  {form.formState.errors.destination && <p className="text-sm text-destructive">{form.formState.errors.destination.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 animate-spin"/> Analizando rutas...</span>
                ) : (
                    <span className="flex items-center gap-2">Obtener Sugerencias <Send className="w-4 h-4" /></span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- COLUMNA DERECHA: RESULTADOS --- */}
        <div className="space-y-4">
          {isLoading && (
            <Card className="animate-pulse">
                <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-1/2 mb-2"/>
                    <Skeleton className="h-4 w-3/4"/>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-5/6"/>
                </CardContent>
            </Card>
          )}

          {suggestion && !isLoading && (
            <Card className="border-primary/50 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="w-5 h-5 text-primary fill-primary/20"/> Sugerencias de la IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-wrap leading-relaxed">
                        {suggestion}
                    </div>
                </CardContent>
            </Card>
          )}

          {!suggestion && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <Bot className="w-12 h-12 mb-4 opacity-20"/>
                <p>Llena el formulario para recibir ayuda personalizada de la IA.</p>
            </div>
          )}
        </div>
    </div>
  );
}