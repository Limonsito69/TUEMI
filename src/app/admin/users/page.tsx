'use client';

import * as React from 'react';
import { PlusCircle, File } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { mockUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Switch } from '@/components/ui/switch';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  ci: z.string().min(7, "El CI debe tener al menos 7 caracteres."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
});

function AddUserForm({ setOpen, setUsers }: { setOpen: (open: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<User[]>> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ci: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newUser: User = {
      id: (Math.random() * 10000).toString(),
      ...values,
      status: 'No Abonado',
      avatar: 'user-placeholder'
    };
    setUsers(currentUsers => [newUser, ...currentUsers]);
    alert('¡Usuario añadido con éxito!');
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Registra un nuevo estudiante o miembro del personal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juan Pérez" {...field} />
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
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit">Guardar Usuario</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const user = row.original;
      const avatar = PlaceHolderImages.find((img) => img.id === user.avatar);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
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
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'Abonado' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Teléfono',
  },
  {
    id: 'actions',
    header: 'Alternar Abonado',
    cell: ({ row }) => {
      const user = row.original;
      const [isAbonado, setIsAbonado] = React.useState(user.status === 'Abonado');

      const handleToggle = () => {
        setIsAbonado(!isAbonado);
        // Aquí normalmente también actualizarías el backend
      };

      return (
        <div className="flex items-center space-x-2">
            <Switch
                id={`abonado-switch-${user.id}`}
                checked={isAbonado}
                onCheckedChange={handleToggle}
                aria-label="Alternar estado de abonado"
            />
            <Label htmlFor={`abonado-switch-${user.id}`} className="sr-only">
                Estado de Abonado
            </Label>
        </div>
      );
    },
  },
];

export default function UsersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = React.useState('all');
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [isAddUserOpen, setAddUserOpen] = React.useState(false);


  const filteredData = React.useMemo(() => {
    if (activeTab === 'all') return users;
    const statusToFilter = activeTab === 'noabonado' ? 'No Abonado' : 'Abonado';
    return users.filter(user => user.status === statusToFilter);
  }, [activeTab, users]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="abonado">Abonados</TabsTrigger>
          <TabsTrigger value="noabonado">No Abonados</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Añadir Usuario
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <AddUserForm setOpen={setAddUserOpen} setUsers={setUsers} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <TabsContent value={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Gestiona los estudiantes y personal de la universidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="mb-4">
              <Input
                placeholder="Filtrar por nombre..."
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
