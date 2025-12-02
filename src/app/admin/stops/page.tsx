'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, Trash2, Plus } from 'lucide-react';
import { getStops, createStop, deleteStop } from '@/lib/actions'; // Importamos las acciones reales

const Map = dynamic(() => import('@/components/ui/map'), { ssr: false });

export default function StopsPage() {
  const { toast } = useToast();
  const [stops, setStops] = React.useState<any[]>([]);
  const [newStop, setNewStop] = React.useState<{name: string, lat: number, lng: number} | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 1. Cargar paradas al inicio
  React.useEffect(() => {
    const load = async () => {
        const data = await getStops();
        setStops(data);
    };
    load();
  }, []);

  const handleMapClick = (e: {lat: number, lng: number}) => {
    setNewStop({ name: "", lat: e.lat, lng: e.lng });
  };

  const handleSaveStop = async () => {
    if (!newStop || !newStop.name) {
      toast({ title: "Falta nombre", description: "Ingresa un nombre para la parada.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
        const created = await createStop(newStop);
        if (created) {
            setStops([...stops, created]);
            setNewStop(null);
            toast({ title: "Guardado", description: "Parada registrada correctamente." });
        }
    } catch (e) {
        toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      if(confirm("¿Eliminar parada?")) {
          await deleteStop(id);
          setStops(stops.filter(s => s.id !== id));
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      <Card className="lg:col-span-1 flex flex-col h-full border-none shadow-md">
        <CardHeader className="bg-slate-50 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-blue-600"/> Inventario de Paradas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
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
                                {loading ? "..." : <><Save className="w-3 h-3 mr-2"/> Guardar</>}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-3 text-xs text-center text-muted-foreground bg-slate-50 border-b">
                    Haz clic en el mapa para agregar una parada.
                </div>
            )}

            <div className="flex-1 overflow-auto">
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
                                <TableCell className="text-sm">{stop.name}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600" onClick={() => handleDelete(stop.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

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