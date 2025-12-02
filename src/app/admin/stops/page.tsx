'use client';

import * as React from 'react';
import dynamic from 'next/dynamic'; // Importante para mapas
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Save, Trash2, Plus } from 'lucide-react';
// Asumimos que tendrás acciones para guardar/cargar paradas en actions.ts
// import { getStops, createStop, deleteStop } from '@/lib/actions'; 

// Cargamos el mapa dinámicamente para evitar errores de servidor
const Map = dynamic(() => import('@/components/ui/map'), { ssr: false });

type Stop = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export default function StopsManagementPage() {
  const { toast } = useToast();
  const [stops, setStops] = React.useState<Stop[]>([]);
  const [newStop, setNewStop] = React.useState<{name: string, lat: number, lng: number} | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Simulación de carga inicial (Reemplazar con useEffect y getStops)
  React.useEffect(() => {
    // Aquí cargarías las paradas reales de la BD
    setStops([
        { id: 1, name: "Puerta EMI Irpavi", lat: -16.539, lng: -68.09 },
        { id: 2, name: "Calle 21 Calacoto", lat: -16.541, lng: -68.08 }
    ]);
  }, []);

  const handleMapClick = (e: any) => {
    // Al hacer clic en el mapa, preparamos una nueva parada
    setNewStop({
        name: "",
        lat: e.lat, // Asumiendo que tu componente Map devuelve esto
        lng: e.lng
    });
  };

  const handleSaveStop = async () => {
    if (!newStop || !newStop.name) {
      toast({ title: "Error", description: "Debes ponerle un nombre a la parada.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
        // AQUÍ LLAMAS A TU SERVER ACTION: await createStop(newStop);
        
        // Simulación de éxito:
        const simulatedId = Math.floor(Math.random() * 1000);
        setStops([...stops, { ...newStop, id: simulatedId }]);
        setNewStop(null);
        toast({ title: "¡Éxito!", description: "Parada guardada correctamente." });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo guardar la parada." });
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteStop = (id: number) => {
      // AQUÍ LLAMAS A TU SERVER ACTION: await deleteStop(id);
      setStops(stops.filter(s => s.id !== id));
      toast({ title: "Eliminado", description: "Parada eliminada." });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      
      {/* PANEL IZQUIERDO: LISTA Y FORMULARIO */}
      <Card className="lg:col-span-1 flex flex-col h-full border-none shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600"/> Inventario de Paradas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            {/* Formulario de Nueva Parada (Solo aparece si haces clic en el mapa) */}
            {newStop ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-semibold text-blue-800 text-sm">📍 Nueva Parada Seleccionada</h4>
                    <div className="grid gap-1">
                        <Label htmlFor="stopName">Nombre del lugar</Label>
                        <Input 
                            id="stopName" 
                            placeholder="Ej: Plaza del Estudiante" 
                            value={newStop.name}
                            onChange={(e) => setNewStop({...newStop, name: e.target.value})}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setNewStop(null)}>Cancelar</Button>
                        <Button size="sm" onClick={handleSaveStop} disabled={loading}>
                            {loading ? "Guardando..." : <><Save className="w-4 h-4 mr-1"/> Guardar</>}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-slate-500 bg-slate-100 p-3 rounded-md flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Haz clic en el mapa para añadir una parada.
                </div>
            )}

            {/* Lista de Paradas Existentes */}
            <div className="flex-1 overflow-auto border rounded-md">
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
                                <TableCell className="font-medium">{stop.name}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteStop(stop.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {stops.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                    No hay paradas registradas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {/* PANEL DERECHO: MAPA */}
      <Card className="lg:col-span-2 h-full overflow-hidden border-none shadow-lg relative">
        {/* Aquí pasamos una prop especial 'onClick' a tu componente Map */}
        {/* Nota: Necesitarás adaptar tu componente Map.tsx para que acepte onClick y devuelva lat/lng */}
        <Map 
            stops={stops} // Puntos existentes (Azules)
            tempMarker={newStop} // Punto nuevo temporal (Rojo/Verde)
            onMapClick={handleMapClick} // Función que captura el clic
            interactive={true}
        />
        
        <div className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow text-xs">
            Haz <b>Clic Derecho</b> o <b>Clic</b> para marcar.
        </div>
      </Card>
    </div>
  );
}