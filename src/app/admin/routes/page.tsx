'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Pencil, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Route, Driver, Vehicle } from '@/types';
import { getRoutes, getDrivers, getVehicles, createRoute, updateRoute, deleteRoute } from '@/lib/actions';

// --- Esquema de Validación (Frontend) ---
const formSchema = z.object({
  name: z.string().min(3, "Nombre requerido."),
  type: z.enum(["Abonados", "Mixto"]),
  // Opcionales para el formulario
  driverId: z.string().optional(), 
  vehicleId: z.string().optional(),
  status: z.enum(["Publicada", "En borrador", "Inactiva"]),
  schedule: z.string().min(1, "Horario requerido."),
  stops: z.coerce.number().min(1, "Mínimo 1 parada."),
});

type RouteFormProps = {
  drivers: Driver[];
  vehicles: Vehicle[];
  setOpen: (open: boolean) => void;
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
};

// --- Componente: Añadir Ruta ---
function AddRouteForm({ drivers, vehicles, setOpen, setRoutes }: RouteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Mixto",
      driverId: "",
      vehicleId: "",
      status: "En borrador",
      schedule: "",
      stops: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Convertimos cadena vacía a NULL
      const driverId = values.driverId && values.driverId !== "" ? parseInt(values.driverId) : null;
      const vehicleId = values.vehicleId && values.vehicleId !== "" ? parseInt(values.vehicleId) : null;

      const newRoute = await createRoute({
        ...values,
        driverId,
        vehicleId,
      });

      if (newRoute) {
        setRoutes((prev) => [newRoute, ...prev]);
        alert('¡Ruta creada!');
        setOpen(false);
      } else {
        alert('Error: No se pudo crear la ruta (Validación fallida)');
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear ruta.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader><DialogTitle>Nueva Ruta</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Ej: Ruta Irpavi" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="schedule" render={({ field }) => (
              <FormItem><FormLabel>Horario</FormLabel><FormControl><Input placeholder="07:30 AM" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stops" render={({ field }) => (
              <FormItem><FormLabel>Paradas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="driverId" render={({ field }) => (
              <FormItem>
                <FormLabel>Conductor (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {drivers.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="vehicleId" render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.plate}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

           <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Abonados">Abonados</SelectItem><SelectItem value="Mixto">Mixto</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Publicada">Publicada</SelectItem><SelectItem value="En borrador">En borrador</SelectItem><SelectItem value="Inactiva">Inactiva</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
      </form>
    </Form>
  );
}

// --- Componente: Editar Ruta ---
function EditRouteForm({ route, drivers, vehicles, setOpen, setRoutes }: { route: Route } & RouteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: route.name,
      type: route.type,
      driverId: route.driverId?.toString() || "",
      vehicleId: route.vehicleId?.toString() || "",
      status: route.status,
      schedule: route.schedule,
      stops: route.stops,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const driverId = values.driverId && values.driverId !== "" ? parseInt(values.driverId) : null;
      const vehicleId = values.vehicleId && values.vehicleId !== "" ? parseInt(values.vehicleId) : null;

      const updatedRoute = await updateRoute({
        ...route,
        ...values,
        driverId,
        vehicleId,
      });

      if (updatedRoute) {
        setRoutes((prev) => prev.map((r) => (r.id === route.id ? updatedRoute : r)));
        alert('¡Ruta actualizada!');
        setOpen(false);
      } else {
        alert('Error al actualizar (Verifique conexión o datos)');
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar.');
    }
  }

  return (
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader><DialogTitle>Editar Ruta</DialogTitle></DialogHeader>
         <div className="grid gap-4 py-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="schedule" render={({ field }) => (
              <FormItem><FormLabel>Horario</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stops" render={({ field }) => (
              <FormItem><FormLabel>Paradas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="driverId" render={({ field }) => (
              <FormItem>
                <FormLabel>Conductor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {drivers.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="vehicleId" render={({ field }) => (
              <FormItem>
                <FormLabel>Vehículo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.plate}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

           <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Abonados">Abonados</SelectItem><SelectItem value="Mixto">Mixto</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Publicada">Publicada</SelectItem><SelectItem value="En borrador">En borrador</SelectItem><SelectItem value="Inactiva">Inactiva</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter><Button type="submit">Guardar Cambios</Button></DialogFooter>
      </form>
    </Form>
  );
}

const RouteActionsCell = ({ route, drivers, vehicles, setRoutes }: { route: Route } & RouteFormProps) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleDelete = async () => {
    if (confirm(`¿Eliminar la ruta ${route.name}?`)) {
      const success = await deleteRoute(route.id);
      if (success) setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600"><Trash className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <EditRouteForm route={route} drivers={drivers} vehicles={vehicles} setOpen={setIsEditOpen} setRoutes={setRoutes} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function RoutesPage() {
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [r, d, v] = await Promise.all([getRoutes(), getDrivers(), getVehicles()]);
      setRoutes(r);
      setDrivers(d);
      setVehicles(v);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Rutas</CardTitle>
        <CardDescription>Crea y administra las rutas de transporte.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Cargando rutas...</TableCell></TableRow>
            ) : routes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">No hay rutas.</TableCell></TableRow>
            ) : (
              routes.map((route) => {
                const driver = drivers.find(d => d.id === route.driverId);
                const vehicle = vehicles.find(v => v.id === route.vehicleId);
                return (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>{route.schedule}</TableCell>
                    <TableCell>{driver?.name || 'Desconocido'}</TableCell>
                    <TableCell>{vehicle?.plate || 'Desconocido'}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === 'Publicada' ? 'default' : 'secondary'}>{route.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <RouteActionsCell route={route} drivers={drivers} vehicles={vehicles} setRoutes={setRoutes} setOpen={() => {}} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">Mostrando <strong>{routes.length}</strong> rutas</div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1"><PlusCircle className="h-3.5 w-3.5" /> Nueva Ruta</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <AddRouteForm drivers={drivers} vehicles={vehicles} setOpen={setOpen} setRoutes={setRoutes} />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}