'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, ShieldAlert, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = (checked: boolean) => {
      setIsDarkMode(checked);
      if (checked) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  };

  const handleSaveSystemConfig = (e: React.FormEvent) => {
      e.preventDefault();
      toast({ title: "Configuración Guardada", description: "Los parámetros del sistema han sido actualizados." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Configuración del Sistema</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PREFERENCIAS DE INTERFAZ */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia del Panel</CardTitle>
            <CardDescription>Personaliza tu vista de administración.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                   <Label className="text-base">Modo Oscuro</Label>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>
          </CardContent>
        </Card>

        {/* PARÁMETROS GLOBALES (Simulados) */}
        <Card>
            <CardHeader>
                <CardTitle>Parámetros Operativos</CardTitle>
                <CardDescription>Configuraciones globales para la flota.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSaveSystemConfig} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Radio de Detección de Parada (metros)</Label>
                        <Input type="number" defaultValue={50} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tiempo Máximo de Espera (minutos)</Label>
                        <Input type="number" defaultValue={5} />
                    </div>
                    <Button type="submit" variant="outline" className="w-full">
                        <Save className="mr-2 h-4 w-4"/> Guardar Cambios
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* ZONA DE PELIGRO */}
        <Card className="border-destructive/50 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5"/> Zona de Riesgo
                </CardTitle>
                <CardDescription>Acciones críticas del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <p className="font-medium">Reiniciar Sistema</p>
                    <p className="text-sm text-muted-foreground">Desconecta a todos los usuarios y reinicia servicios.</p>
                </div>
                <Button variant="destructive">Reiniciar</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}