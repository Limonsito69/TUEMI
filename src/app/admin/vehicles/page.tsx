'use client';

import * as React from 'react';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, File, Pencil, Trash } from 'lucide-react';
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
  DropdownMenuLabel,
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
  DialogDescription,
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
import { Vehicle } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/actions';

// --- Esquema de Validación ---
const formSchema = z.object({
  plate: z.string().min(6, "La placa debe tener al menos 6 caracteres."),
  brand: z.string().min(2, "La marca es requerida."),
  model: z.string().min(1, "El modelo es requerido."),
  capacity: z.coerce.number().min(1, "La capacidad debe ser al menos 1."),
  status: z.enum(["Activo", "En mantenimiento"]),
});

// --- Componente: Formulario para Añadir Vehículo ---
function AddVehicleForm({ setOpen, setVehicles }: { setOpen: (open: boolean) => void, setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      capacity: 15,
      status: "Activo",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // CORRECCIÓN: Añadimos la propiedad 'image' que falta
      const vehicleData = {
        ...values,
        image: 'vehicle-placeholder', // Usamos un placeholder por defecto
      };

      const newVehicle = await createVehicle(vehicleData);
      
      if (newVehicle) {
        setVehicles((prev) => [newVehicle, ...prev]);
        alert('¡Vehículo creado exitosamente!');
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear vehículo. Verifica que la placa no exista.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Vehículo</DialogTitle>
          <DialogDescription>Registra un nuevo minibús para la flota.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField control={form.control} name="plate" render={({ field }) => (
            <FormItem><FormLabel>Placa</FormLabel><FormControl><Input placeholder="1234-ABC" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="brand" render={({ field }) => (
              <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Toyota" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Hiace" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecciona estado" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="En mantenimiento">En mantenimiento</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit">Guardar Vehículo</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Componente: Formulario para Editar Vehículo ---
function EditVehicleForm({ vehicle, setOpen, setVehicles }: { vehicle: Vehicle, setOpen: (open: boolean) => void, setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      capacity: vehicle.capacity,
      status: vehicle.status as "Activo" | "En mantenimiento",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedData = { ...vehicle, ...values };
      const result = await updateVehicle(updatedData);
      if (result) {
        setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? result : v)));
        alert('¡Vehículo actualizado!');
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar vehículo.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField control={form.control} name="plate" render={({ field }) => (
            <FormItem><FormLabel>Placa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="brand" render={({ field }) => (
              <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="En mantenimiento">En mantenimiento</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit">Guardar Cambios</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Componente: Celda de Acciones ---
const VehicleActionsCell = ({ vehicle, setVehicles }: { vehicle: Vehicle, setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>> }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar el vehículo ${vehicle.plate}?`)) {
      const success = await deleteVehicle(vehicle.id);
      if (success) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
        alert('Vehículo eliminado.');
      } else {
        alert('Error al eliminar. Puede que esté asignado a una ruta o viaje.');
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Alternar menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <EditVehicleForm vehicle={vehicle} setOpen={setIsEditOpen} setVehicles={setVehicles} />
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- Página Principal ---
export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getVehicles();
      setVehicles(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehículos</CardTitle>
        <CardDescription>Gestiona la flota de transporte de la universidad.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Imagen</span></TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Capacidad</TableHead>
              <TableHead className="hidden md:table-cell">Marca/Modelo</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Cargando vehículos...</TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No hay vehículos registrados.</TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => {
                const vehicleImage = PlaceHolderImages.find((img) => img.id === vehicle.image);
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={vehicle.model}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={vehicleImage?.imageUrl || 'https://placehold.co/600x400?text=Van'}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.plate}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === 'Activo' ? 'default' : 'destructive'}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.capacity} asientos</TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle.brand} {vehicle.model}</TableCell>
                    <TableCell>
                      <VehicleActionsCell vehicle={vehicle} setVehicles={setVehicles} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong>{vehicles.length}</strong> vehículos
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir Vehículo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <AddVehicleForm setOpen={setOpen} setVehicles={setVehicles} />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}