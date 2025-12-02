'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { getStops, createStop, deleteStop } from '@/lib/actions'; // 👈 IMPORTANTE: Usar las acciones reales

// Mapa dinámico
const Map = dynamic(() => import('@/components/ui/map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">Cargando Mapa...</div>
});

export default function StopsPage() {
  const { toast } = useToast();
  const [stops, setStops] = React.useState<any[]>([]);
  const [newStop, setNewStop] = React.useState<{name: string, lat: number, lng: number} | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  // 1. CARGA REAL DE DATOS (Aquí estaba el problema antes)
  React.useEffect(() => {
    const load = async () => {
        try {
            console.log("🔄 Cargando paradas desde BD...");
            const data = await getStops();
            console.log("✅ Paradas recibidas:", data);
            setStops(data);
        } catch (error) {
            console.error("Error cargando:", error);
            toast({ title: "Error de conexión", description: "No se pudieron cargar las paradas.", variant: "destructive" });
        } finally {
            setInitialLoading(false);
        }
    };
    load();
  }, [toast]); // Dependencia toast añadida para evitar warnings

  const handleMapClick = (e: {lat: number, lng: number}) => {
    setNewStop({ name: "", lat: e.lat, lng: e.lng });
  };

  const handleSaveStop = async () => {
    if (!newStop || !newStop.name) {
      toast({ title: "Falta nombre", description: "Ponle un nombre a la parada.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
        const created = await createStop(newStop);
        if (created) {
            setStops([created, ...stops]); // Agregamos al inicio de la lista local
            setNewStop(null);
            toast({ title: "Guardado", description: "Parada registrada en la base de datos." });
        } else {
            toast({ title: "Error", description: "El servidor no devolvió la parada creada.", variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "Error crítico", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      if(confirm("¿Estás seguro de eliminar esta parada?")) {
          const success = await deleteStop(id);
          if (success) {
            setStops(stops.filter(s => s.id !== id));
            toast({ title: "Eliminado", description: "La parada fue borrada." });
          } else {
            toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
          }
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      
      {/* PANEL IZQUIERDO */}
      <Card className="lg:col-span-1 flex flex-col h-full border-none shadow-md">
        <CardHeader className="bg-slate-50 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-blue-600"/> Inventario de Paradas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            
            {/* Formulario Flotante (Solo al hacer clic en mapa) */}
            {newStop ? (
                <div className="p-4 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-blue-800 uppercase mb-2">Nueva Parada</p>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs">Nombre del Lugar</Label>
                            <Input 
                                autoFocus
                                value={newStop.name} 
                                onChange={e => setNewStop({...newStop, name: e.target.value})} 
                                placeholder="Ej: Plaza del Estudiante"
                                className="bg-white"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setNewStop(null)}>Cancelar</Button>
                            <Button size="sm" onClick={handleSaveStop} disabled={loading}>
                                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <><Save className="w-3 h-3 mr-2"/> Guardar</>}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-3 text-xs text-center text-muted-foreground bg-slate-50 border-b">
                    Haz clic en el mapa para agregar una parada nueva.
                </div>
            )}

            {/* Tabla de Paradas */}
            <div className="flex-1 overflow-auto">
                {initialLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600"/>
                        <p className="text-xs">Cargando inventario...</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stops.map((stop) => (
                                <TableRow key={stop.id}>
                                    <TableCell className="text-sm font-medium">{stop.name}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleDelete(stop.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {stops.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground text-xs">
                                        No hay paradas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </CardContent>
      </Card>

      {/* PANEL DERECHO: MAPA */}
      <Card className="lg:col-span-2 h-full overflow-hidden border-2 border-slate-100 shadow-sm relative">
        <Map 
            stops={stops} 
            tempMarker={newStop} 
            onMapClick={handleMapClick} 
            interactive={true}
        />
      </Card>
    </div>
  );
}