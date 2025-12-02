'use client';

import * as React from 'react';
import { 
  PlusCircle, 
  File, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Eye, 
  History, 
  User as UserIcon,
  KeyRound
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, AuditLog } from '@/types'; 
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserAuditLogs, 
  resetUserPassword
} from '@/lib/actions';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- Constantes ---

const EXTENSIONES = ["LP", "SC", "CB", "OR", "PT", "TJ", "CH", "BE", "PD"];

const formSchema = z.object({
  codigo_SAGA: z.string().min(2, "SAGA requerido"),
  nombres: z.string().min(2, "Nombre requerido"),
  paterno: z.string().min(2, "Ap. Paterno requerido"),
  materno: z.string().optional(),
  ci_numero: z.string().min(5, "CI requerido"),
  ci_extension: z.string().min(2, "Extensión requerida"),
  phone: z.string().min(8, "Celular requerido"),
});

// --- Componentes Auxiliares ---

function UserDetailSheet({ 
  user, 
  isOpen, 
  onClose 
}: { 
  user: User | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  React.useEffect(() => {
    if (user && isOpen) {
      setLoadingLogs(true);
      getUserAuditLogs(user.id)
        .then(setLogs)
        .finally(() => setLoadingLogs(false));
    }
  }, [user, isOpen]);

  if (!user) return null;

  const avatar = PlaceHolderImages.find((img) => img.id === user.avatar);
  const isActivo = user.status === 'Activo';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Perfil del Usuario</SheetTitle>
          <SheetDescription>Detalles completos e historial de actividad.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4 border-4 border-muted">
            <AvatarImage src={avatar?.imageUrl} />
            <AvatarFallback className="text-2xl">{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-center">{user.name}</h2>
          
          <Badge className="mt-2" variant={isActivo ? 'default' : 'secondary'}>
            {isActivo ? 'Activo' : 'Desactivado'}
          </Badge>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> Datos Personales
          </h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg border">
            <div>
              <p className="text-xs text-muted-foreground">Cédula de Identidad</p>
              <p className="font-medium font-mono">{user.ci}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Código SAGA</p>
              <p className="font-medium font-mono text-primary">{user.codigo_SAGA || "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="font-medium">Estudiante</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" /> Historial de Cambios
          </h3>
          
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {loadingLogs ? (
              <p className="text-center text-sm text-muted-foreground py-4">Cargando historial...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">No hay registros de actividad.</p>
            ) : (
              <div className="space-y-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-6 border-l-2 border-muted pb-1 last:pb-0">
                    <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                            {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        {log.details.replace(/Inactivo/g, "Desactivado").replace(/Activo/g, "Activo")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Por: {log.adminName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

      </SheetContent>
    </Sheet>
  );
}

function ResetPasswordDialog({ user, isOpen, onClose }: { user: User, isOpen: boolean, onClose: () => void }) {
    const [newPass, setNewPass] = React.useState("");
    
    const handleReset = async () => {
        if (!newPass) return alert("Ingresa una contraseña");
        const success = await resetUserPassword(user.id, newPass);
        if (success) {
            alert(`Contraseña de ${user.name} actualizada.`);
            onClose();
            setNewPass("");
        } else {
            alert("Error al actualizar.");
        }
    };

    const generatePass = () => {
        const pass = Math.random().toString(36).slice(-8);
        setNewPass(pass);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Restablecer Contraseña</DialogTitle>
                    <DialogDescription>Define una nueva contraseña para {user.name}.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 items-end py-4">
                    <div className="grid w-full gap-1.5">
                        <Label>Nueva Contraseña</Label>
                        <Input value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Escribe la nueva clave" />
                    </div>
                    <Button variant="outline" onClick={generatePass}>Generar</Button>
                </div>
                <DialogFooter>
                    <Button onClick={handleReset}>Guardar Contraseña</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddUserForm({ setOpen, setUsers }: { setOpen: (open: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombres: "", paterno: "", materno: "", ci_numero: "", codigo_SAGA: "", ci_extension: "LP", phone: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userData = { ...values, materno: values.materno || "" };
      const newUser = await createUser(userData);
      
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
        toast({
          title: "¡Usuario creado!",
          description: `${newUser.name} ha sido registrado exitosamente.`,
          variant: "default", 
        });
        setOpen(false);
        form.reset();
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al crear",
        description: error.message || 'Hubo un problema al guardar los datos.',
        variant: "destructive", 
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
          <DialogDescription>Registra manualmente a un estudiante o personal.</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="codigo_SAGA"
                render={({ field }) => (
                    <FormItem className="col-span-3">
                        <FormLabel>Código SAGA</FormLabel>
                        <FormControl>
                            <Input type="text" {...field} placeholder="Ej: A27123-4" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="ci_numero" render={({ field }) => (
                <FormItem className="col-span-2"><FormLabel>CI (Número)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="ci_extension" render={({ field }) => (
                <FormItem><FormLabel>Ext.</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{EXTENSIONES.map(ext => <SelectItem key={ext} value={ext}>{ext}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
            )} />
        </div>

        <FormField control={form.control} name="nombres" render={({ field }) => (
            <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="paterno" render={({ field }) => (
                <FormItem><FormLabel>Ap. Paterno</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="materno" render={({ field }) => (
                <FormItem><FormLabel>Ap. Materno</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <DialogFooter>
          <Button type="submit">Registrar Usuario</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EditUserForm({ user, setOpen, setUsers }: { user: User, setOpen: (open: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const { toast } = useToast();
  
  const editSchema = z.object({
      name: z.string().min(3, "Nombre requerido"),
      phone: z.string().min(8, "Celular requerido"),
      ci: z.string().min(5, "CI requerido"),
      codigo_SAGA: z.string().optional(),
  });

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { 
        // PROTECCIÓN CONTRA VALORES NULOS
        name: user.name || "", 
        phone: user.phone || "",
        ci: user.ci || "",
        codigo_SAGA: user.codigo_SAGA || ""
    },
  });

  async function onSubmit(values: z.infer<typeof editSchema>) {
    try {
      // Convertimos valores undefined o null a string vacío
      const safeValues = {
        ...values,
        codigo_SAGA: values.codigo_SAGA || ""
      };

      const updatedUser = await updateUser({ ...user, ...safeValues });
      
      if (updatedUser) {
        setUsers((prev) => prev.map(u => u.id === user.id ? updatedUser : u));
        toast({
          title: "Datos actualizados",
          description: `La información de ${updatedUser.name} se guardó correctamente.`,
        });
        setOpen(false);
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar." });
      }
    } catch (error: any) {
      toast({
        title: "Error de actualización",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
            <DialogTitle>Editar Datos del Usuario</DialogTitle>
            <DialogDescription>Como administrador, puedes corregir cualquier dato erróneo.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
           
           <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
           )} />
           
           <div className="grid grid-cols-2 gap-4 mt-2">
               <FormField control={form.control} name="ci" render={({ field }) => (
                <FormItem>
                    <FormLabel>Cédula de Identidad</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Ej: 1234567 LP" /> 
                    </FormControl>
                    <FormMessage />
                </FormItem>
               )} />

               <FormField control={form.control} name="codigo_SAGA" render={({ field }) => (
                <FormItem>
                    <FormLabel>Código SAGA</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Ej: A24500-X" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
               )} />
           </div>
        </div>

        <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">Guardar Correcciones</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

const UserActionsCell = ({ 
  user, 
  setUsers, 
  onViewDetail 
}: { 
  user: User, 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>, 
  onViewDetail: (user: User) => void 
}) => {
   const [isEditOpen, setIsEditOpen] = React.useState(false);
   const [isPassOpen, setIsPassOpen] = React.useState(false);
   
   const handleToggleStatus = async () => {
      const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      const updated = await updateUser({ ...user, status: newStatus });
      if (updated) setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
   };

   const handleDelete = async () => {
      if (confirm(`¿Eliminar a ${user.name}?`)) {
         await deleteUser(user.id);
         setUsers(prev => prev.filter(u => u.id !== user.id));
      }
   }

   return (
     <div className="flex items-center gap-2">
        <Switch checked={user.status === 'Activo'} onCheckedChange={handleToggleStatus} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetail(user)}>
               <Eye className="mr-2 h-4 w-4"/> Ver Perfil Completo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
               <Pencil className="mr-2 h-4 w-4"/> Editar Datos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsPassOpen(true)}>
               <KeyRound className="mr-2 h-4 w-4"/> Restablecer Clave
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
               <Trash className="mr-2 h-4 w-4"/> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
           <DialogContent><EditUserForm user={user} setOpen={setIsEditOpen} setUsers={setUsers}/></DialogContent>
        </Dialog>

        <ResetPasswordDialog user={user} isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} />
     </div>
   )
}

const getColumns = (
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  onViewDetail: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name', 
    header: 'Usuario',
    filterFn: (row, columnId, filterValue) => {
       const cellValue = row.getValue(columnId);
       return String(cellValue ?? "").toLowerCase().includes(String(filterValue).toLowerCase());
    },
    cell: ({ row }) => {
      const user = row.original;
      const avatar = PlaceHolderImages.find((img) => img.id === user.avatar);
      const displayName = user.name ? String(user.name) : "Usuario"; 

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={avatar?.imageUrl} alt="Avatar" />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <div className="font-medium">{displayName}</div>
            <div className="text-xs text-muted-foreground">{user.ci}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    filterFn: 'equalsString', 
    cell: ({ row }) => {
      const rawStatus = row.getValue('status') as string;
      const isActive = rawStatus === 'Activo';
      const displayLabel = isActive ? 'Activo' : 'Desactivado'; 

      return (
        <Badge 
          variant="outline" 
          className={`${
            isActive 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {displayLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Contacto',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <UserActionsCell 
         user={row.original} 
         setUsers={setUsers} 
         onViewDetail={onViewDetail} 
      />
    )
  },
];

export default function UsersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleViewDetail = React.useCallback((user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(setUsers, handleViewDetail), [setUsers, handleViewDetail]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
  });

  React.useEffect(() => {
     if (statusFilter === 'all') {
        table.getColumn('status')?.setFilterValue('');
     } else {
        table.getColumn('status')?.setFilterValue(statusFilter);
     }
  }, [statusFilter, table]);

  const handleExport = async () => {
    if (users.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Usuarios');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre Completo', key: 'name', width: 35 },
      { header: 'Cédula (CI)', key: 'ci', width: 15 },
      { header: 'Celular', key: 'phone', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Código SAGA', key: 'saga', width: 15 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        name: user.name,
        ci: user.ci,
        phone: user.phone,
        status: user.status === 'Activo' ? 'Activo' : 'Desactivado',
        saga: user.codigo_SAGA || "S/N",
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { 
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        const statusCell = row.getCell('status');
        if (statusCell.value === 'Activo') {
          statusCell.font = { color: { argb: '166534' }, bold: true };
        } else {
          statusCell.font = { color: { argb: '991B1B' }, bold: true };
        }
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Reporte_Usuarios_TUEMI_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                className="pl-8"
              />
           </div>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                 <Filter className="mr-2 h-4 w-4" />
                 <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 <SelectItem value="Activo">Activos</SelectItem>
                 <SelectItem value="Inactivo">Desactivados</SelectItem>
              </SelectContent>
           </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
              <File className="h-4 w-4" /> Exportar
          </Button>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Nuevo Usuario</Button>
              </DialogTrigger>
              <DialogContent><AddUserForm setOpen={setIsAddOpen} setUsers={setUsers}/></DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Cargando...</TableCell></TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Sin resultados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-end space-x-2">
         <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
         </div>
         <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
         <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
      </div>

      <UserDetailSheet 
        user={selectedUser} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />
    </div>
  );
}