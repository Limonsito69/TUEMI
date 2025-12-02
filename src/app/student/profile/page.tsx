'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { getCurrentUser, getUserProfile } from '@/lib/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogOut, IdCard, School, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
  const [user, setUser] = React.useState<User | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function load() {
      const session = await getCurrentUser();
      if (session?.id) {
        const profile = await getUserProfile(session.id);
        setUser(profile);
      }
    }
    load();
  }, []);

  if (!user) return <div className="p-8 text-center text-muted-foreground">Cargando credencial...</div>;

  const avatar = PlaceHolderImages.find(img => img.id === user.avatar);
  const isActive = user.status === 'Activo';

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 px-4">
      
      {/* CREDECIAL DIGITAL ESTILO CARNET */}
      <Card className="overflow-hidden border-0 shadow-2xl relative bg-white">
        {/* Encabezado Institucional */}
        <div className="bg-[#1A237E] p-4 text-center">
            <h3 className="text-white font-bold tracking-widest text-sm uppercase">Escuela Militar de Ingeniería</h3>
            <p className="text-blue-200 text-xs">Credencial Universitario Digital</p>
        </div>

        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center relative">
            {/* Foto de Perfil con Borde de Estado */}
            <div className={`p-1 rounded-full border-4 ${isActive ? 'border-green-500' : 'border-red-500'} mb-4`}>
                <Avatar className="w-32 h-32">
                    <AvatarImage src={avatar?.imageUrl} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-slate-100">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            
            {/* Datos Principales */}
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.name}</h2>
            
            {/* Badge de Estado (Semaforo visual para el chofer) */}
            <Badge 
                variant={isActive ? "default" : "destructive"} 
                className={`mb-4 px-4 py-1 text-base ${isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
                {isActive ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> HABILITADO</span>
                ) : (
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/> INHABILITADO</span>
                )}
            </Badge>

            <div className="w-full border-t border-slate-100 my-4"></div>

            {/* Grilla de Detalles */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 w-full text-left px-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1">
                        <IdCard className="w-3 h-3"/> Cédula
                    </p>
                    <p className="text-sm font-mono font-medium text-slate-700">{user.ci}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1">
                        <School className="w-3 h-3"/> Carrera
                    </p>
                    <p className="text-sm font-medium text-slate-700">Ing. Sistemas</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                        Celular
                    </p>
                    <p className="text-sm font-medium text-slate-700">{user.phone}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
                        Vencimiento
                    </p>
                    <p className="text-sm font-medium text-slate-700">Dic 2025</p>
                </div>
            </div>
        </CardContent>
        
        {/* Pie de Credencial Decorativo */}
        <div className="h-4 bg-gradient-to-r from-blue-600 via-[#1A237E] to-blue-800"></div>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-4">
            Muestra esta pantalla al conductor al subir al vehículo.
        </p>
        <Button variant="outline" className="w-full border-red-100 text-red-600 hover:bg-red-50" onClick={() => router.push('/')}>
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}