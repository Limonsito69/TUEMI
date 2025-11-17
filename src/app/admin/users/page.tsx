'use client';

import * as React from 'react';
import { PlusCircle, File, Search, Filter, MoreHorizontal, Pencil, Trash } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox'; // Necesitarás asegurarte de tener este componente o usar el nativo
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions';

// --- Esquema de Validación ---
const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  ci: z.string().min(5, "El CI debe tener al menos 5 caracteres."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
});

// --- Formulario Añadir ---
function AddUserForm({ setOpen, setUsers }: { setOpen: (open: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", ci: "", phone: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newUser = await createUser(values);
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
        alert('¡Usuario creado correctamente!');
        setOpen(false);
        form.reset();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
          <DialogDescription>Ingresa los datos del estudiante o personal.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Ana Torres" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="ci" render={({ field }) => (
                <FormItem><FormLabel>CI</FormLabel><FormControl><Input placeholder="1234567" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Celular</FormLabel><FormControl><Input placeholder="70123456" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Registrar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// --- Formulario Editar ---
function EditUserForm({ user, setOpen, setUsers }: { user: User, setOpen: (open: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: user.name, ci: user.ci, phone: user.phone },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedUser = await updateUser({ ...user, ...values });
      if (updatedUser) {
        setUsers((prev) => prev.map(u => u.id === user.id ? updatedUser : u));
        alert('¡Usuario actualizado!');
        setOpen(false);
      }
    } catch (error: any) {
      alert('Error al actualizar.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader><DialogTitle>Editar Usuario</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
           <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="ci" render={({ field }) => (
                <FormItem><FormLabel>CI</FormLabel><FormControl><Input {...field} disabled className="bg-muted" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
           </div>
        </div>
        <DialogFooter><Button type="submit">Guardar Cambios</Button></DialogFooter>
      </form>
    </Form>
  );
}

// --- Definición de Columnas ---
const getColumns = (setUsers: React.Dispatch<React.SetStateAction<User[]>>): ColumnDef<User>[] => [
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
    cell: ({ row }) => {
      const user = row.original;
      const avatar = PlaceHolderImages.find((img) => img.id === user.avatar);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={avatar?.imageUrl} alt="Avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.ci}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Tipo',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isAbonado = status === 'Abonado';
      return (
        <Badge variant="outline" className={`${isAbonado ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {status}
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
    cell: ({ row }) => {
       const user = row.original;
       const [isEditOpen, setIsEditOpen] = React.useState(false);
       
       const handleToggleStatus = async () => {
          const newStatus = user.status === 'Abonado' ? 'No Abonado' : 'Abonado';
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
            <Switch checked={user.status === 'Abonado'} onCheckedChange={handleToggleStatus} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4"/> Editar Datos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}><Trash className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
               <DialogContent><EditUserForm user={user} setOpen={setIsEditOpen} setUsers={setUsers}/></DialogContent>
            </Dialog>
         </div>
       )
    }
  },
];

export default function UsersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Estado para el filtro de "Tipo" (Abonado/No Abonado)
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

  const columns = React.useMemo(() => getColumns(setUsers), [setUsers]);

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

  // Efecto para aplicar el filtro de estado manualmente a la columna 'status'
  React.useEffect(() => {
     if (statusFilter === 'all') {
        table.getColumn('status')?.setFilterValue('');
     } else {
        table.getColumn('status')?.setFilterValue(statusFilter);
     }
  }, [statusFilter, table]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           {/* BUSCADOR */}
           <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                className="pl-8"
              />
           </div>
           {/* FILTRO POR TIPO */}
           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                 <Filter className="mr-2 h-4 w-4" />
                 <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 <SelectItem value="Abonado">Abonados</SelectItem>
                 <SelectItem value="No Abonado">No Abonados</SelectItem>
              </SelectContent>
           </Select>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2">
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
    </div>
  );
}