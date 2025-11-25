'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Search, HelpCircle, Settings, LogOut, Phone, Mail, AlertCircle, SearchX, CheckCircle2 } from 'lucide-react';
import React from 'react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { reportLostItem, logout } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function getPathSegments(pathname: string) {
  return pathname.split('/').filter(Boolean);
}

function formatSegment(segment: string) {
  const segmentMap: { [key: string]: string } = {
    admin: 'Principal', users: 'Usuarios', drivers: 'Conductores', vehicles: 'Vehículos', routes: 'Rutas', monitoring: 'Monitoreo', reports: 'Reportes', student: 'Estudiante', driver: 'Conductor', assistant: 'Asistente IA', profile: 'Perfil', 'route-map': 'Mapa de Rutas', history: 'Historial', 'active-route': 'Ruta Activa', settings: 'Configuración'
  };
  return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = getPathSegments(pathname);
  const { toast } = useToast();
  
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false); // Estado para alerta de logout

  // Estado para formulario Objetos Perdidos
  const [lostItemDesc, setLostItemDesc] = React.useState("");
  const [lostItemRoute, setLostItemRoute] = React.useState("");
  const [isReporting, setIsReporting] = React.useState(false);

  const handleLogout = async () => {
    // Llamamos a la Server Action que borra la cookie real
    await logout();
  };

  const handleReportLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    const stored = sessionStorage.getItem('loggedInUser');
    if (stored) {
        const user = JSON.parse(stored);
        const success = await reportLostItem(user.id, lostItemDesc, lostItemRoute);
        if (success) {
            toast({ title: "Reporte enviado", description: "Nos contactaremos contigo si encontramos el objeto." });
            setLostItemDesc("");
            setLostItemRoute("");
            setIsSupportOpen(false);
        } else {
            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el reporte." });
        }
    }
    setIsReporting(false);
  };

  let settingsLink = '#';
  if (pathname.startsWith('/student')) settingsLink = '/student/settings';
  else if (pathname.startsWith('/driver')) settingsLink = '/driver/settings';
  else if (pathname.startsWith('/admin')) settingsLink = '/admin/settings';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {segments.map((segment, index) => (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                {index < segments.length - 1 ? (
                  <BreadcrumbLink asChild><Link href={`/${segments.slice(0, index + 1).join('/')}`}>{formatSegment(segment)}</Link></BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < segments.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Buscar..." className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full"><CircleUser className="h-5 w-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href={settingsLink} className="cursor-pointer w-full flex"><Settings className="mr-2 h-4 w-4" /> Configuración</Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsSupportOpen(true)} className="cursor-pointer"><HelpCircle className="mr-2 h-4 w-4" /> Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* En lugar de ejecutar logout directo, abrimos la alerta */}
          <DropdownMenuItem onSelect={() => setIsLogoutOpen(true)} className="text-red-600 cursor-pointer"><LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DIÁLOGO DE SOPORTE --- */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Centro de Ayuda T.U.E.M.I.</DialogTitle>
            <DialogDescription>¿Cómo podemos ayudarte hoy?</DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="faq">Preguntas</TabsTrigger>
                <TabsTrigger value="lost">Obj. Perdidos</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
            </TabsList>
            
            {/* Pestaña 1: FAQ */}
            <TabsContent value="faq" className="space-y-4 mt-4">
                <div className="space-y-4">
                    <div className="border rounded-md p-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> ¿Cómo pago mi abono?</h4>
                        <p className="text-sm text-muted-foreground mt-1">Debes acercarte a la oficina de transporte en el Bloque B y realizar el pago en efectivo o QR.</p>
                    </div>
                    <div className="border rounded-md p-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> ¿Qué hago si el bus no llega?</h4>
                        <p className="text-sm text-muted-foreground mt-1">Revisa el mapa en vivo. Si hay un retraso mayor a 15 min, contacta al soporte.</p>
                    </div>
                </div>
            </TabsContent>

            {/* Pestaña 2: Objetos Perdidos */}
            <TabsContent value="lost" className="mt-4">
                <form onSubmit={handleReportLostItem} className="space-y-4">
                    <div className="space-y-2">
                        <Label>¿Qué perdiste y cómo es?</Label>
                        <Textarea placeholder="Ej: Mochila negra marca Adidas, olvidada en el asiento trasero..." value={lostItemDesc} onChange={e => setLostItemDesc(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>¿En qué ruta o bus?</Label>
                        <Input placeholder="Ej: Ruta Irpavi - 07:30 AM" value={lostItemRoute} onChange={e => setLostItemRoute(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isReporting}>
                        {isReporting ? "Enviando..." : "Reportar Objeto Perdido"}
                    </Button>
                </form>
            </TabsContent>

            {/* Pestaña 3: Contacto */}
            <TabsContent value="contact" className="mt-4 space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-md border">
                    <div className="bg-primary/10 p-3 rounded-full"><Phone className="w-6 h-6 text-primary"/></div>
                    <div><p className="font-medium">Línea Gratuita</p><p className="text-lg font-bold">800-10-5555</p></div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-md border">
                    <div className="bg-primary/10 p-3 rounded-full"><Mail className="w-6 h-6 text-primary"/></div>
                    <div><p className="font-medium">Correo</p><p className="text-lg">transporte@emi.edu.bo</p></div>
                 </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* --- ALERTA DE CIERRE DE SESIÓN --- */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tendrás que ingresar tus credenciales nuevamente para acceder.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Salir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}