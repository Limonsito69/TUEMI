'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Moon, Sun, Lock, CheckCircle } from 'lucide-react';
import { changeStudentPassword } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [userId, setUserId] = React.useState<number | null>(null);
  
  // Estado para cambio de contraseña
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [loadingPass, setLoadingPass] = React.useState(false);

  // Estado para Tema (Simulado por ahora)
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const stored = sessionStorage.getItem('loggedInUser');
    if (stored) {
       const user = JSON.parse(stored);
       setUserId(user.id);
    }
    // Chequear si el HTML tiene la clase dark
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoadingPass(true);
    
    const res = await changeStudentPassword(userId, currentPass, newPass);
    
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
      if (checked) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  };

  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      <h1 className="text-3xl font-bold">Configuración</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Cuenta y Seguridad</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        {/* --- PESTAÑA: CUENTA --- */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu clave de acceso para mantener tu cuenta segura.</CardDescription>
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
                <Button type="submit" disabled={loadingPass}>
                    {loadingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PESTAÑA: PREFERENCIAS --- */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia y Notificaciones</CardTitle>
              <CardDescription>Personaliza tu experiencia en la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-4">
                   {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                   <div className="space-y-0.5">
                      <Label className="text-base">Modo Oscuro</Label>
                      <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro.</p>
                   </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-4">
                   <Bell className="h-5 w-5" />
                   <div className="space-y-0.5">
                      <Label className="text-base">Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">Recibe alertas cuando el bus esté cerca.</p>
                   </div>
                </div>
                <Switch defaultChecked />
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}