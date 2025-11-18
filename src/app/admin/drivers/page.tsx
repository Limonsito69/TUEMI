'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Pencil, Trash, File, KeyRound } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Driver } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  getDrivers, 
  createDriver, 
  updateDriver, 
  deleteDriver, 
  resetDriverPassword 
} from '@/lib/actions';

// --- Esquema de Validación ---
const formSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  ci: z.string().min(5, "El CI es requerido."),
  phone: z.string().min(8, "Teléfono inválido."),
  license: z.string().min(3, "Licencia requerida."),
  status: z.enum(["Activo", "Inactivo"]),
});

// --- Componente: Diálogo para Cambiar Contraseña ---
function ResetDriverPasswordDialog({ driver, isOpen, onClose }: { driver: Driver, isOpen: boolean, onClose: () => void }) {
    const [newPass, setNewPass] = React.useState("");
    
    const handleReset = async () => {
        if (!newPass) return alert("Ingresa una contraseña");
        const success = await resetDriverPassword(driver.id, newPass);
        if (success) {
            alert(`Clave de ${driver.name} actualizada.`);
            setNewPass("");
            onClose();
        } else {
            alert("Error al actualizar.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Contraseña</DialogTitle>
                    <DialogDescription>Define la clave de acceso para {driver.name}.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        value={newPass} 
                        onChange={(e) => setNewPass(e.target.value)} 
                        placeholder="Nueva contraseña" 
                        type="text" // Visible para que el admin sepa qué clave está poniendo
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleReset}>Guardar Contraseña</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Componente: Formulario Añadir ---
function AddDriverForm({ setOpen, setDrivers }: { setOpen: (open: boolean) => void, setDrivers: React.Dispatch<React.SetStateAction<Driver[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ci: "",
      phone: "",
      license: "",
      status: "Activo",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const driverData = {
        ...values,
        avatar: 'driver-placeholder', // Avatar por defecto
      };
      const newDriver = await createDriver(driverData);
      
      if (newDriver) {
        setDrivers((prev) => [newDriver, ...prev]);
        alert('¡Conductor registrado! La contraseña por defecto es 123456.');
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error(error);
      alert('Error al registrar conductor.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Registrar Conductor</DialogTitle>
          <DialogDescription>Añade un nuevo conductor a la base de datos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="ci" render={({ field }) => (
              <FormItem><FormLabel>CI</FormLabel><FormControl><Input placeholder="1234567 LP" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="license" render={({ field }) => (
              <FormItem><FormLabel>Licencia</FormLabel><FormControl><Input placeholder="Cat C" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+591..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Inactivo">Inactivo</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Componente: Formulario Editar ---
function EditDriverForm({ driver, setOpen, setDrivers }: { driver: Driver, setOpen: (open: boolean) => void, setDrivers: React.Dispatch<React.SetStateAction<Driver[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: driver.name,
      ci: driver.ci,
      phone: driver.phone,
      license: driver.license,
      status: driver.status as "Activo" | "Inactivo",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedData = { ...driver, ...values };
      const result = await updateDriver(updatedData);
      if (result) {
        setDrivers((prev) => prev.map((d) => (d.id === driver.id ? result : d)));
        alert('¡Conductor actualizado!');
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar conductor.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Editar Conductor</DialogTitle>
        </DialogHeader>
         <div className="grid gap-4 py-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="ci" render={({ field }) => (
              <FormItem><FormLabel>CI</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="license" render={({ field }) => (
              <FormItem><FormLabel>Licencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Inactivo">Inactivo</SelectItem></SelectContent>
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

// --- Componente: Acciones ---
const DriverActionsCell = ({ driver, setDrivers }: { driver: Driver, setDrivers: React.Dispatch<React.SetStateAction<Driver[]>> }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPassOpen, setIsPassOpen] = React.useState(false);

  const handleDelete = async () => {
    if (confirm(`¿Eliminar a ${driver.name}?`)) {
      const success = await deleteDriver(driver.id);
      if (success) {
        setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
        alert('Conductor eliminado.');
      } else {
        alert('Error al eliminar.');
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar Datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPassOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" /> Asignar Contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Editar */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <EditDriverForm driver={driver} setOpen={setIsEditOpen} setDrivers={setDrivers} />
        </DialogContent>
      </Dialog>

      {/* Modal Contraseña */}
      <ResetDriverPasswordDialog driver={driver} isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} />
    </>
  );
};

// --- Página Principal ---
export default function DriversPage() {
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Conductores</CardTitle>
        <CardDescription>Gestiona la información de los conductores.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Licencia</TableHead>
              <TableHead className="hidden md:table-cell">Teléfono</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Cargando conductores...</TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No hay conductores registrados.</TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => {
                 const driverAvatar = PlaceHolderImages.find((img) => img.id === driver.avatar);
                 return (
                  <TableRow key={driver.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Avatar>
                        <AvatarImage src={driverAvatar?.imageUrl} />
                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                        <div>{driver.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{driver.ci}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.status === 'Activo' ? 'default' : 'secondary'}>
                        {driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{driver.license}</TableCell>
                    <TableCell className="hidden md:table-cell">{driver.phone}</TableCell>
                    <TableCell>
                      <DriverActionsCell driver={driver} setDrivers={setDrivers} />
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
          Mostrando <strong>{drivers.length}</strong> conductores
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Añadir Conductor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <AddDriverForm setOpen={setOpen} setDrivers={setDrivers} />
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}