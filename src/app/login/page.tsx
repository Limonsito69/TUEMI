"use client";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authenticate, registerStudent } from "@/lib/actions";
import { BusFront } from "lucide-react";

const EXTENSIONES = ["LP", "SC", "CB", "OR", "PT", "TJ", "CH", "BE", "PD"];

const loginSchema = z.object({
  ci: z.string().min(3, "Ingresa tu CI."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

const registerSchema = z.object({
  ci_numero: z.string().min(5, "CI requerido"),
  ci_extension: z.string().min(2, "Extensión requerida"),
  nombres: z.string().min(2, "Nombre requerido"),
  paterno: z.string().min(2, "Ap. Paterno requerido"),
  materno: z.string().optional(),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(8, "Celular requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  terms: z
    .boolean()
    .refine((val) => val === true, { message: "Acepta los términos" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { ci: "", password: "" },
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const result = await authenticate(values.ci, values.password);

      if (result.success) {
        if (result.role === "admin") {
          window.location.href = "/admin";
        } else if (result.role === "driver") {
          window.location.href = "/driver/active-route";
        } else {
          window.location.href = "/student/profile";
        }
      } else {
        toast({
          title: "Acceso denegado",
          description: result.message || "Credenciales incorrectas.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error de conexión",
        description: "No se pudo contactar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      ci_numero: "",
      ci_extension: "LP",
      nombres: "",
      paterno: "",
      materno: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    },
  });

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      // @ts-ignore
      const result = await registerStudent({
        ...values,
        materno: values.materno || "",
      });
      if (result.success) {
        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify({ role: "student", ...result.user })
        );
        alert("¡Bienvenido! Registro exitoso.");
        router.push("/student");
      } else {
        alert(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        <div className="hidden lg:flex flex-1 bg-blue-600 relative flex-col justify-center items-center text-white p-12 bg-[url('https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-blue-900/70"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-6 shadow-lg">
              <BusFront className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              T.U.E.M.I.
            </h1>
            <p className="text-lg text-blue-100 max-w-md leading-relaxed">
              Sistema de Transporte Universitario Inteligente. <br />
              Gestiona tus rutas, monitorea tu bus y viaja seguro.
            </p>
          </div>
          <div className="relative z-10 mt-12 text-sm text-blue-200/60">
            © {new Date().getFullYear()} Escuela Militar de Ingeniería
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <BusFront className="w-10 h-10 text-blue-600 mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">T.U.E.M.I.</h2>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Bienvenido</h2>
                <p className="text-gray-500 mt-2">
                  Ingresa tus credenciales para acceder.
                </p>
              </div>

              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-5"
                >
                  <FormField
                    control={loginForm.control}
                    name="ci"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carnet de Identidad</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 1234567"
                            className="h-12 bg-gray-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Contraseña</FormLabel>
                          <a
                            href="#"
                            className="text-xs text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              alert("Contacta a soporte.");
                            }}
                          >
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-gray-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verificando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Registro Estudiantil
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Solo para estudiantes vigentes en lista oficial.
                </p>
              </div>

              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={registerForm.control}
                      name="ci_numero"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>CI</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1234567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="ci_extension"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ext</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXTENSIONES.map((e) => (
                                <SelectItem key={e} value={e}>
                                  {e}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="nombres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombres</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={registerForm.control}
                      name="paterno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paterno</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="materno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Materno</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-xs font-normal">
                            Acepto los términos y condiciones del servicio de
                            transporte.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : "Crear Cuenta"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}