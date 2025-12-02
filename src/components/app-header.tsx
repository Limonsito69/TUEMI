'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Search, HelpCircle, Settings, LogOut, Phone, Mail, CheckCircle2, X } from 'lucide-react';
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
    admin: 'Principal', users: 'Usuarios', drivers: 'Conductores', vehicles: 'Vehículos', routes: 'Rutas', stops: 'Paradas', monitoring: 'Monitoreo', reports: 'Reportes', student: 'Estudiante', driver: 'Conductor', assistant: 'Asistente IA', profile: 'Perfil', 'route-map': 'Mapa', history: 'Historial', 'active-route': 'Ruta Activa', settings: 'Configuración'
  };
  return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = getPathSegments(pathname);
  const { toast } = useToast();
  
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const [lostItemDesc, setLostItemDesc] = React.useState("");
  const [lostItemRoute, setLostItemRoute] = React.useState("");
  const [isReporting, setIsReporting] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleReportLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    const stored = sessionStorage.getItem('loggedInUser');
    if (stored) {
        try {
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
        } catch (e) {
             console.error(e);
             toast({ variant: "destructive", title: "Error", description: "Error al procesar usuario." });
        }
    } else {
         toast({ variant: "destructive", title: "Error", description: "No se pudo identificar al usuario." });
    }
    setIsReporting(false);
  };

  let settingsLink = '#';
  if (pathname.startsWith('/student')) settingsLink = '/student/settings';
  else if (pathname.startsWith('/driver')) settingsLink = '/driver/settings';
  else if (pathname.startsWith('/admin')) settingsLink = '/admin/settings';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 sm:gap-4 border-b bg-background/95 px-3 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:h-auto md:border-0 md:bg-transparent md:px-6">
      
      {/* --- BOTÓN SIDEBAR (Mobile/Tablet) --- */}
      <SidebarTrigger className="lg:hidden shrink-0" />

      {/* --- BREADCRUMBS --- */}
      <Breadcrumb className="hidden sm:flex flex-1 min-w-0">
        <BreadcrumbList className="flex-wrap">
          {segments.map((segment, index) => (
            <React.Fragment key={segment}>
              <BreadcrumbItem className="max-w-[150px] md:max-w-none">
                {index < segments.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={`/${segments.slice(0, index + 1).join('/')}`} className="truncate">
                      {formatSegment(segment)}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{formatSegment(segment)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < segments.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- TÍTULO MÓVIL (Solo en pantallas muy pequeñas cuando no hay breadcrumb) --- */}
      <div className="flex-1 min-w-0 sm:hidden">
        <h1 className="text-sm font-semibold truncate">
          {segments.length > 0 ? formatSegment(segments[segments.length - 1]) : 'Inicio'}
        </h1>
      </div>

      {/* --- BARRA DE BÚSQUEDA (Desktop) --- */}
      <div className="hidden lg:flex relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Buscar..." 
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[280px] xl:w-[336px]" 
        />
      </div>

      {/* --- BOTÓN BÚSQUEDA (Mobile/Tablet) --- */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden shrink-0"
        onClick={() => setIsSearchOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Buscar</span>
      </Button>

      {/* --- MENÚ DE USUARIO --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full shrink-0 h-9 w-9 sm:h-10 sm:w-10">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Menú usuario</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={settingsLink} className="cursor-pointer w-full flex items-center">
              <Settings className="mr-2 h-4 w-4" /> Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsSupportOpen(true)} className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" /> Soporte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsLogoutOpen(true)} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- DIÁLOGO DE BÚSQUEDA MÓVIL --- */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[425px] top-[10%] translate-y-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Buscar</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar en T.U.E.M.I..." 
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* --- DIÁLOGO DE SOPORTE --- */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Centro de Ayuda T.U.E.M.I.</DialogTitle>
              <DialogDescription className="text-sm">¿Cómo podemos ayudarte hoy?</DialogDescription>
            </DialogHeader>
          </div>
          
          <Tabs defaultValue="faq" className="w-full px-4 sm:px-6 pb-4 sm:pb-6">
            <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="faq" className="text-xs sm:text-sm py-2">
                  Preguntas
                </TabsTrigger>
                <TabsTrigger value="lost" className="text-xs sm:text-sm py-2">
                  Obj. Perdidos
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm py-2">
                  Contacto
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="faq" className="space-y-3 mt-4">
                <div className="space-y-3">
                    <div className="border rounded-lg p-3 sm:p-4 hover:bg-secondary/50 transition-colors">
                        <h4 className="font-semibold text-sm sm:text-base flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5"/>
                          <span>¿Cómo pago mi abono?</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 ml-6 sm:ml-7">
                          En la oficina de transporte (Bloque B), efectivo o QR.
                        </p>
                    </div>
                    <div className="border rounded-lg p-3 sm:p-4 hover:bg-secondary/50 transition-colors">
                        <h4 className="font-semibold text-sm sm:text-base flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5"/>
                          <span>¿Qué hago si el bus no llega?</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 ml-6 sm:ml-7">
                          Revisa el mapa. Si el retraso es mayor a 15 min, contacta soporte.
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="lost" className="mt-4">
                <form onSubmit={handleReportLostItem} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">¿Qué perdiste?</Label>
                        <Textarea 
                          placeholder="Ej: Mochila negra, olvidada en el asiento..." 
                          value={lostItemDesc} 
                          onChange={e => setLostItemDesc(e.target.value)} 
                          required 
                          className="min-h-[100px] text-sm sm:text-base resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm sm:text-base">¿En qué ruta?</Label>
                        <Input 
                          placeholder="Ej: Ruta Irpavi - 07:30 AM" 
                          value={lostItemRoute} 
                          onChange={e => setLostItemRoute(e.target.value)} 
                          required 
                          className="text-sm sm:text-base h-10 sm:h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isReporting}>
                        {isReporting ? "Enviando..." : "Enviar Reporte"}
                    </Button>
                </form>
            </TabsContent>

            <TabsContent value="contact" className="mt-4 space-y-3 sm:space-y-4">
                 <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/20 rounded-lg border">
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-full shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Línea Gratuita</p>
                      <p className="text-base sm:text-lg font-bold truncate">800-10-5555</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary/20 rounded-lg border">
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-full shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Correo</p>
                      <p className="text-sm sm:text-base truncate">transporte@emi.edu.bo</p>
                    </div>
                 </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* --- ALERTA DE CIERRE DE SESIÓN --- */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-lg sm:text-xl">¿Cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  Tendrás que ingresar tus credenciales nuevamente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="w-full sm:w-auto m-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout} 
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 m-0"
                >
                  Salir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}