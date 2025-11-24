'use client';

import * as React from 'react';
import { 
  MoreHorizontal, 
  PlusCircle, 
  Pencil, 
  Trash, 
  KeyRound, 
  Search, 
  IdCard, 
  Phone, 
  Car 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  ci: z.string().min(5, "El CI es requerido."),
  phone: z.string().min(8, "Teléfono inválido."),
  license: z.string().min(3, "Licencia requerida."),
  status: z.enum(["Activo", "Inactivo"]),
});

function ResetDriverPasswordDialog({ driver, isOpen, onClose }: { driver: Driver, isOpen: boolean, onClose: () => void }) {
    const [newPass, setNewPass] = React.useState("");
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    
    const handleReset = async () => {
        if (!newPass) {
          toast({ variant: "destructive", title: "Error", description: "Ingresa una contraseña válida." });
          return;
        }
        setIsLoading(true);
        const success = await resetDriverPassword(driver.id, newPass);
        setIsLoading(false);

        if (success) {
            toast({ title: "Contraseña Actualizada", description: `Clave asignada a ${driver.name}.` });
            setNewPass("");
            onClose();
        } else {
            toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la contraseña." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Credenciales de Acceso</DialogTitle>
                    <DialogDescription>Asigna una nueva contraseña para el conductor <strong>{driver.name}</strong>.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Nueva Contraseña</label>
                        <Input 
                            value={newPass} 
                            onChange={(e) => setNewPass(e.target.value)} 
                            placeholder="Escribe la nueva clave..." 
                            type="text" 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleReset} disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Contraseña"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DriverForm({ 
    driver, 
    setOpen, 
    onSuccess 
}: { 
    driver?: Driver, 
    setOpen: (open: boolean) => void, 
    onSuccess: (driver: Driver) => void 
}) {
  const { toast } = useToast();
  const isEditing = !!driver;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: driver?.name || "",
      ci: driver?.ci || "",
      phone: driver?.phone || "",
      license: driver?.license || "",
      status: (driver?.status as "Activo" | "Inactivo") || "Activo",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let result: Driver | null;
      
      if (isEditing && driver) {
          result = await updateDriver({ ...driver, ...values });
      } else {
          const driverData = { ...values, avatar: 'driver-placeholder' };
          result = await createDriver(driverData);
      }

      if (result) {
        onSuccess(result);
        toast({ title: isEditing ? "Actualizado" : "Registrado", description: `Datos de ${result.name} guardados correctamente.` });
        setOpen(false);
        if (!isEditing) form.reset();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Hubo un problema al guardar. Verifica si el CI ya existe." });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error Crítico", description: "Error de conexión con el servidor." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Conductor" : "Registrar Nuevo Conductor"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del personal." : "Ingresa la información para dar de alta a un conductor."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="ci" render={({ field }) => (
              <FormItem><FormLabel>Cédula (Usuario)</FormLabel><FormControl><Input placeholder="Ej: 1234567" {...field} disabled={isEditing} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="license" render={({ field }) => (
              <FormItem><FormLabel>Licencia</FormLabel><FormControl><Input placeholder="Categoría C" {...field} /></FormControl><FormMessage /></FormItem>
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
          <Button type="submit">{isEditing ? "Guardar Cambios" : "Registrar"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

const DriverActionsCell = ({ driver, setDrivers }: { driver: Driver, setDrivers: React.Dispatch<React.SetStateAction<Driver[]>> }) => {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isPassOpen, setIsPassOpen] = React.useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de eliminar a ${driver.name}? Esta acción no se puede deshacer.`)) {
      const success = await deleteDriver(driver.id);
      if (success) {
        setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
        toast({ title: "Eliminado", description: "El conductor ha sido eliminado del sistema." });
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar. Es posible que tenga viajes registrados." });
      }
    }
  };

  const handleUpdateList = (updatedDriver: Driver) => {
      setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar Datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPassOpen(true)}>
            <KeyRound className="mr-2 h-4 w-4" /> Cambiar Contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DriverForm driver={driver} setOpen={setIsEditOpen} onSuccess={handleUpdateList} />
        </DialogContent>
      </Dialog>

      <ResetDriverPasswordDialog driver={driver} isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} />
    </>
  );
};

export default function DriversPage() {
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = React.useState<Driver[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setFilteredDrivers(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  React.useEffect(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = drivers.filter(d => 
          d.name.toLowerCase().includes(lowerTerm) || 
          d.ci.toLowerCase().includes(lowerTerm) ||
          d.license.toLowerCase().includes(lowerTerm)
      );
      setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  const handleAddSuccess = (newDriver: Driver) => {
      setDrivers(prev => [newDriver, ...prev]);
  };

  return (
    <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Conductores</h2>
                <p className="text-muted-foreground">Administra el personal autorizado para la flota.</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <PlusCircle className="h-4 w-4" /> Registrar Conductor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DriverForm setOpen={setIsAddOpen} onSuccess={handleAddSuccess} />
                </DialogContent>
            </Dialog>
        </div>

        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nombre, CI o licencia..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <Card>
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden w-[80px] sm:table-cell text-center">Foto</TableHead>
                    <TableHead>Información Personal</TableHead>
                    <TableHead>Credenciales</TableHead>
                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Cargando lista de personal...</TableCell>
                    </TableRow>
                    ) : filteredDrivers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Car className="h-8 w-8 mb-2 opacity-20" />
                                <p>No se encontraron conductores.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredDrivers.map((driver) => {
                        const driverAvatar = PlaceHolderImages.find((img) => img.id === driver.avatar);
                        return (
                        <TableRow key={driver.id}>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex justify-center">
                                    <Avatar>
                                        <AvatarImage src={driverAvatar?.imageUrl} />
                                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{driver.name}</span>
                                    <span className="text-xs text-muted-foreground md:hidden">{driver.ci}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <IdCard className="h-3 w-3 text-muted-foreground" />
                                        <span>{driver.ci}</span>
                                    </div>
                                    <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 font-normal">
                                        Lic. {driver.license}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {driver.phone}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={driver.status === 'Activo' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}>
                                    {driver.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DriverActionsCell driver={driver} setDrivers={setDrivers} />
                            </TableCell>
                        </TableRow>
                        );
                    })
                    )}
                </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t px-6 py-4 text-xs text-muted-foreground flex justify-between">
                <span>Total: <strong>{filteredDrivers.length}</strong> conductores</span>
            </CardFooter>
        </Card>
    </div>
  );
}