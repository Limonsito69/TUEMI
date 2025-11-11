
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


type Role = 'admin' | 'driver' | 'student';

const registerFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  ci: z.string().min(7, "El CI debe tener al menos 7 caracteres."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
});


function LoginForm() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>('admin');

  const handleLogin = () => {
    // En una aplicación real, aquí se autenticaría y se guardaría la sesión del usuario.
    // Para esta demo, simplemente guardamos el rol.
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('loggedInUser', JSON.stringify({ role }));
      // Limpiamos datos de un posible usuario registrado para no mezclarlos.
      sessionStorage.removeItem('registeredUser');
    }
    
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
    <div className="grid gap-4">
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
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      ci: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerFormSchema>) {
    // Simulamos guardar el nuevo usuario en la sesión del navegador.
    const newUser = {
      ...values,
      id: 'new-user',
      status: 'No Abonado',
      avatar: 'user-placeholder',
      role: 'student',
    };
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('registeredUser', JSON.stringify(newUser));
    }
    
    alert('¡Registro exitoso! Serás redirigido a tu portal.');
    router.push('/student');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ana Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ci"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula de Identidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 1234567 LP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Ej: +591 71234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Registrarse
        </Button>
      </form>
    </Form>
  );
}


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
            <h1 className="text-3xl font-bold font-headline">Bienvenido</h1>
            <p className="text-balance text-muted-foreground">
              Accede a tu portal o regístrate para empezar
            </p>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Acceso</CardTitle>
                  <CardDescription>
                    Elija su tipo de usuario para continuar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                  <CardDescription>
                    Completa tus datos para registrarte en el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
