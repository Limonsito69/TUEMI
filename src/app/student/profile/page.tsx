
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
import { mockUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QrCode } from 'lucide-react';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentProfilePage() {
  const [student, setStudent] = React.useState<User | null>(null);

  React.useEffect(() => {
    // Intentamos obtener el usuario recién registrado desde sessionStorage
    const registeredUserJson = sessionStorage.getItem('registeredUser');
    if (registeredUserJson) {
      setStudent(JSON.parse(registeredUserJson));
    } else {
      // Si no, usamos el usuario de ejemplo
      setStudent(mockUsers[0]);
    }
  }, []);

  const avatar = PlaceHolderImages.find((img) => img.id === student?.avatar);

  if (!student) {
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
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2"/>
                    <Skeleton className="h-4 w-3/4"/>
                </CardHeader>
                <CardContent>
                     <Skeleton className="h-8 w-full"/>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatar?.imageUrl} />
            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <CardDescription>{student.ci}</CardDescription>
            <div className="flex items-center gap-2 pt-2">
                <Badge variant={student.status === 'Abonado' ? 'default' : 'secondary'}>
                    {student.status}
                </Badge>
                <p className="text-sm text-muted-foreground">{student.phone}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Button>
                <QrCode className="mr-2 h-4 w-4"/>
                Mostrar Código QR
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Progreso del Abono</CardTitle>
            <CardDescription>Viajes restantes en tu plan actual.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Progress value={60} aria-label="60% de viajes utilizados"/>
                <p className="text-sm text-muted-foreground">Te quedan <span className="font-bold text-foreground">8</span> de 20 viajes este mes.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
