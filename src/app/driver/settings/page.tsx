'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun, Bell } from 'lucide-react';
import { changeDriverPassword } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function DriverSettingsPage() {
  const { toast } = useToast();
  const [userId, setUserId] = React.useState<number | null>(null);
  
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [loadingPass, setLoadingPass] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const stored = sessionStorage.getItem('loggedInUser');
    if (stored) {
       const user = JSON.parse(stored);
       if (user.role === 'driver') setUserId(user.id);
    }
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoadingPass(true);
    
    const res = await changeDriverPassword(userId, currentPass, newPass);
    
    if (res.success) {
        toast({ title: "Éxito", description: res.message });
        setCurrentPass("");
        setNewPass("");
    } else {
        toast({ variant: "destructive", title: "Error", description: res.message });
    }
    setLoadingPass(false);
  };

  const toggleTheme = (checked: boolean) => {
      setIsDarkMode(checked);
      if (checked) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="max-w-2xl mx-auto grid gap-6 p-4">
      <h1 className="text-2xl font-bold">Ajustes del Conductor</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de la App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                   <div>
                      <Label className="text-base">Modo Oscuro</Label>
                      <p className="text-xs text-muted-foreground">Reduce la fatiga visual en turnos nocturnos.</p>
                   </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Bell className="h-5 w-5" />
                   <div>
                      <Label className="text-base">Alertas de Tráfico</Label>
                      <p className="text-xs text-muted-foreground">Recibir avisos sobre congestión en la ruta.</p>
                   </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Mantén segura tu cuenta de conductor.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña Actual</Label>
                  <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Nueva Contraseña</Label>
                  <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={loadingPass} className="w-full">
                    {loadingPass ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}