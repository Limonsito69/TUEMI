'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Pencil, Trash2, ArrowLeft, Search, Map as MapIcon } from 'lucide-react';
import { getStops, createRoute, getRoutes, updateRoute, deleteRoute } from '@/lib/actions';

// Cargamos el mapa dinámicamente
const Map = dynamic(() => import('@/components/ui/map'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 flex items-center justify-center">Cargando Mapa...</div>
});

// --- COMPONENTE 1: EL EDITOR (Formulario + Mapa) ---
function RouteEditor({ initialData, onCancel, onSave }: { initialData?: any, onCancel: () => void, onSave: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    
    // Estados del formulario
    const [name, setName] = React.useState(initialData?.name || "");
    const [schedule, setSchedule] = React.useState(initialData?.schedule || "");
    const [status, setStatus] = React.useState(initialData?.status || "En borrador");
    const [category, setCategory] = React.useState(initialData?.Categoria || "Regular");

    // Estados del Mapa
    const [allStops, setAllStops] = React.useState<any[]>([]);
    const [selectedStops, setSelectedStops] = React.useState<any[]>(initialData?.waypoints || []);

    React.useEffect(() => {
        getStops().then(setAllStops);
    }, []);

    const handleStopClick = (stop: any) => {
        if (selectedStops.find(s => s.stopId === stop.id)) {
            toast({ title: "Ya existe", description: "Esta parada ya está en la ruta." });
            return;
        }
        setSelectedStops([...selectedStops, {
            stopId: stop.id,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            order: selectedStops.length + 1
        }]);
    };

    const handleRemoveStop = (index: number) => {
        const newStops = [...selectedStops];
        newStops.splice(index, 1);
        setSelectedStops(newStops.map((s, i) => ({ ...s, order: i + 1 })));
    };

    const handleSubmit = async () => {
        if (!name || !schedule || selectedStops.length < 2) {
            toast({ title: "Datos incompletos", description: "Nombre, horario y mínimo 2 paradas requeridos.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const payload = {
                name, schedule, status, Categoria: category,
                stops: selectedStops.length,
                waypoints: selectedStops
            };

            if (initialData?.id) {
                await updateRoute({ ...payload, id: initialData.id }); // Asumimos que existe updateRoute
                toast({ title: "Actualizado", description: "Ruta modificada correctamente." });
            } else {
                await createRoute(payload);
                toast({ title: "Creado", description: "Nueva ruta registrada." });
            }
            onSave();
        } catch (e) {
            toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2 pb-2 border-b">
                <Button variant="ghost" size="sm" onClick={onCancel}><ArrowLeft className="w-4 h-4 mr-2"/> Volver a la lista</Button>
                <h2 className="text-lg font-bold ml-2">{initialData ? "Editar Ruta" : "Nueva Ruta"}</h2>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Panel Izquierdo: Datos */}
                <Card className="w-1/3 flex flex-col border-none shadow-lg overflow-hidden">
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        <div className="space-y-3 bg-slate-50 p-3 rounded border">
                            <div className="grid gap-1">
                                <Label>Nombre</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Ruta Sur" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Horario</Label><Input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="07:00" /></div>
                                <div>
                                    <Label>Tipo</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Regular">Regular</SelectItem>
                                            <SelectItem value="Abonados">Abonados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Estado</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="En borrador">Borrador</SelectItem>
                                        <SelectItem value="Publicada">Publicada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Lista de Paradas */}
                        <div>
                            <Label className="mb-2 block text-xs font-bold text-slate-500 uppercase">Secuencia ({selectedStops.length})</Label>
                            <div className="space-y-2">
                                {selectedStops.map((stop, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white border rounded shadow-sm text-sm">
                                        <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                        <span className="flex-1 truncate">{stop.name}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={() => handleRemoveStop(i)}><X className="w-3 h-3"/></Button>
                                    </div>
                                ))}
                                {selectedStops.length === 0 && <div className="text-center p-4 border-2 border-dashed text-muted-foreground text-xs">Selecciona pines en el mapa</div>}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t">
                        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Guardando..." : <><Save className="w-4 h-4 mr-2"/> Guardar Ruta</>}
                        </Button>
                    </div>
                </Card>

                {/* Panel Derecho: Mapa */}
                <Card className="flex-1 overflow-hidden border shadow-sm relative">
                    <Map stops={allStops} routePath={selectedStops} onStopClick={handleStopClick} interactive={true} />
                </Card>
            </div>
        </div>
    );
}

// --- COMPONENTE 2: LA LISTA (Tu Excel) ---
export default function RoutesManagerPage() {
    const { toast } = useToast();
    const [view, setView] = React.useState<'list' | 'editor'>('list');
    const [routes, setRoutes] = React.useState<any[]>([]);
    const [editingRoute, setEditingRoute] = React.useState<any>(null);
    const [filter, setFilter] = React.useState("");

    const loadRoutes = async () => {
        const data = await getRoutes();
        setRoutes(data);
    };

    React.useEffect(() => {
        loadRoutes();
    }, []);

    const handleCreate = () => {
        setEditingRoute(null);
        setView('editor');
    };

    const handleEdit = (route: any) => {
        setEditingRoute(route);
        setView('editor');
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Eliminar esta ruta?")) {
            await deleteRoute(id);
            loadRoutes();
            toast({ title: "Eliminado", description: "Ruta eliminada." });
        }
    };

    const handleSaveSuccess = () => {
        setView('list');
        loadRoutes();
    };

    const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));

    if (view === 'editor') {
        return <RouteEditor initialData={editingRoute} onCancel={() => setView('list')} onSave={handleSaveSuccess} />;
    }

    return (
        <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Rutas</h1>
                    <p className="text-muted-foreground">Administra los recorridos y horarios del transporte.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Nueva Ruta
                </Button>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b flex gap-4 items-center bg-slate-50/50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar ruta..." 
                            className="pl-9 bg-white" 
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground ml-auto">
                        Total: <strong>{filteredRoutes.length}</strong> rutas
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de la Ruta</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Paradas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRoutes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No hay rutas registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRoutes.map((route) => (
                                    <TableRow key={route.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded text-blue-600"><MapIcon className="w-4 h-4"/></div>
                                            {route.name}
                                        </TableCell>
                                        <TableCell>{route.schedule}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-slate-300 text-slate-600">
                                                {route.Categoria}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{route.waypoints?.length || 0} puntos</TableCell>
                                        <TableCell>
                                            <Badge className={route.status === 'Publicada' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}>
                                                {route.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(route)}>
                                                <Pencil className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(route.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}