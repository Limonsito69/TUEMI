import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function LoginPage() {
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
              Ingrese sus credenciales para acceder a su cuenta
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Administrador</CardTitle>
              <CardDescription>
                Utilice las credenciales proporcionadas por el equipo técnico.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Usuario</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario_admin"
                  required
                  defaultValue="admin@emi.edu.bo"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  defaultValue="password"
                />
              </div>
              <Button asChild type="submit" className="w-full">
                <Link href="/dashboard">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            ¿Eres estudiante o miembro del personal?{' '}
            <Link href="#" className="underline">
              Inicia sesión o Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
