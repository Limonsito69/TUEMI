'use client';

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

export default function StudentProfilePage() {
  const student = mockUsers[0]; // Usando a Ana Pérez como ejemplo
  const avatar = PlaceHolderImages.find((img) => img.id === student.avatar);

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
