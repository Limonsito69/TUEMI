
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Logo } from '@/components/logo';

type Role = 'admin' | 'driver' | 'student';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>('admin');

  const handleLogin = () => {
    switch (role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'driver':
        router.push('/driver');
        break;
      case 'student':
        router.push('/student');
        break;
      default:
        router.push('/admin');
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <Image
          src="https://picsum.photos/seed/EMI/1920/1080"
          alt="Campus universitario EMI"
          fill
          className="object-cover opacity-20"
          data-ai-hint="university campus"
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="w-8 h-8 mr-2" />
          Sistema T.U.E.M.I.
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Optimizando el transporte universitario para un viaje fluido, seguro y eficiente para cada estudiante y miembro del personal.&rdquo;
            </p>
            <footer className="text-sm">Administración EMI</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Iniciar Sesión</h1>
            <p className="text-balance text-muted-foreground">
              Seleccione su rol para acceder al sistema
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenido</CardTitle>
              <CardDescription>
                Elija su tipo de usuario para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <RadioGroup
                defaultValue="admin"
                className="grid grid-cols-1 gap-4"
                value={role}
                onValueChange={(value: Role) => setRole(value)}
              >
                <div>
                  <RadioGroupItem value="admin" id="admin" className="peer sr-only" />
                  <Label
                    htmlFor="admin"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Administrador
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="driver"
                    id="driver"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="driver"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Conductor
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="student"
                    id="student"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Estudiante
                  </Label>
                </div>
              </RadioGroup>

              <Button onClick={handleLogin} type="submit" className="w-full">
                Ingresar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
