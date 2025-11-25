'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QrCode, RefreshCw, LogOut } from 'lucide-react';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserProfile, getCurrentUser } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
  const [student, setStudent] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  // Función para cargar datos
  const loadProfile = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Pedir al servidor "quién soy" (En lugar de sessionStorage)
      const sessionUser = await getCurrentUser();
      
      if (sessionUser && sessionUser.id) {
          // 2. Pedir datos completos a la BD usando el ID de la sesión
          const dbUser = await getUserProfile(sessionUser.id);
          setStudent(dbUser);
      }
    } catch (error) {
        console.error("Error cargando perfil", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    router.push('/');
  };

  if (isLoading) {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="grid gap-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!student) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <p className="text-muted-foreground">No se encontró información del usuario.</p>
            <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
        </div>
      );
  }

  const avatar = PlaceHolderImages.find((img) => img.id === student?.avatar);
  
  // Simulación de progreso de abono (en un sistema real, esto vendría de una tabla de Pagos/Suscripciones)
  const tripsLeft = student.status === 'Abonado' ? 12 : 0;
  const totalTrips = 20;
  const progressValue = student.status === 'Abonado' ? (tripsLeft / totalTrips) * 100 : 0;

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      {/* TARJETA DE IDENTIFICACIÓN */}
      <Card className="overflow-hidden border-primary/20 shadow-md">
        <div className="h-24 bg-gradient-to-r from-primary to-blue-600 relative">
            <div className="absolute -bottom-10 left-6 p-1 bg-background rounded-full">
                <Avatar className="h-20 w-20 border-2 border-background">
                    <AvatarImage src={avatar?.imageUrl} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </div>
        <CardHeader className="pt-12 pb-2">
          <div className="flex justify-between items-start">
             <div>
                <CardTitle className="text-2xl font-bold">{student.name}</CardTitle>
                <CardDescription className="text-base font-mono mt-1">{student.ci}</CardDescription>
             </div>
             <Badge 
                className="text-sm px-3 py-1" 
                variant={student.status === 'Abonado' ? 'default' : 'secondary'}
             >
                {student.status}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{student.phone}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Carrera</p>
                    <p className="font-medium">Ingeniería de Sistemas</p> 
                    {/* Dato estático por ahora, se podría añadir a la tabla Users */}
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <Button className="flex-1 gap-2" disabled={student.status !== 'Abonado'}>
                    <QrCode className="h-4 w-4"/>
                    {student.status === 'Abonado' ? 'Ver Código QR' : 'Sin Abono Activo'}
                </Button>
                <Button variant="outline" size="icon" onClick={loadProfile} title="Actualizar datos">
                    <RefreshCw className="h-4 w-4"/>
                </Button>
                <Button variant="destructive" size="icon" onClick={handleLogout} title="Cerrar Sesión">
                    <LogOut className="h-4 w-4"/>
                </Button>
            </div>
        </CardContent>
      </Card>
      
      {/* ESTADO DEL ABONO */}
      <Card>
        <CardHeader>
            <CardTitle>Estado de tu Abono</CardTitle>
            <CardDescription>
                {student.status === 'Abonado' 
                    ? 'Tienes viajes disponibles para este mes.' 
                    : 'No tienes un abono activo actualmente.'}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {student.status === 'Abonado' ? (
                <div className="space-y-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Viajes restantes</span>
                        <span className="font-bold">{tripsLeft} / {totalTrips}</span>
                    </div>
                    <Progress value={progressValue} className="h-3" />
                    <p className="text-xs text-muted-foreground pt-2">
                        Tu abono es válido hasta el 30 de Noviembre.
                    </p>
                </div>
            ) : (
                <div className="text-center py-4 bg-secondary/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground mb-2">Acércate a caja para renovar tu suscripción.</p>
                    <Button variant="link" className="text-primary h-auto p-0">Ver puntos de pago</Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}