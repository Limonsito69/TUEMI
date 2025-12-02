'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Save, GripVertical, X } from 'lucide-react';

const Map = dynamic(() => import('@/components/ui/map'), { ssr: false });

type RouteStop = {
    stopId: number;
    name: string;
    lat: number;
    lng: number;
    order: number;
};

export default function RoutesBuilderPage() {
    const { toast } = useToast();
    // Estado del Formulario
    const [routeName, setRouteName] = React.useState("");
    const [schedule, setSchedule] = React.useState("");
    const [status, setStatus] = React.useState("En borrador");
    
    // Estado de la Ruta en Construcción
    const [selectedStops, setSelectedStops] = React.useState<RouteStop[]>([]);
    
    // Todas las paradas disponibles (Cargar de BD)
    const [allStops, setAllStops] = React.useState<any[]>([
        { id: 1, name: "Puerta EMI", lat: -16.539, lng: -68.09 },
        { id: 2, name: "Calle 21", lat: -16.541, lng: -68.08 },
        { id: 3, name: "Plaza Estudiante", lat: -16.500, lng: -68.12 },
        { id: 4, name: "Estadio", lat: -16.510, lng: -68.11 },
    ]);

    // Función: Cuando haces clic en un pin del mapa
    const handleStopClick = (stop: any) => {
        // Verificar si ya está seleccionado
        if (selectedStops.find(s => s.stopId === stop.id)) {
            toast({ title: "Ya añadida", description: "Esta parada ya es parte de la ruta." });
            return;
        }

        const newSequenceNumber = selectedStops.length + 1;
        const newStop: RouteStop = {
            stopId: stop.id,
            name: stop.name,
            lat: stop.lat,
            lng: stop.lng,
            order: newSequenceNumber
        };

        setSelectedStops([...selectedStops, newStop]);
    };

    const removeStopFromRoute = (index: number) => {
        const newStops = [...selectedStops];
        newStops.splice(index, 1);
        // Recalcular orden
        const reordered = newStops.map((s, i) => ({ ...s, order: i + 1 }));
        setSelectedStops(reordered);
    };

    const handleSaveRoute = async () => {
        if (!routeName || selectedStops.length < 2) {
            toast({ title: "Falta información", description: "Pon un nombre y selecciona al menos 2 paradas.", variant: "destructive" });
            return;
        }

        const routeData = {
            name: routeName,
            schedule,
            status,
            waypoints: selectedStops // Esto se guardará como JSON
        };

        console.log("Guardando Ruta:", routeData);
        // AWAIT createRoute(routeData)...
        toast({ title: "¡Ruta Creada!", description: "La ruta se ha guardado exitosamente." });
    };

    return (
        <div className="flex h-[calc(100vh-80px)] gap-4 p-4">
            
            {/* PANEL IZQUIERDO: CONFIGURADOR */}
            <Card className="w-1/3 flex flex-col border-none shadow-xl bg-white/95 backdrop-blur">
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Diseñador de Rutas</h2>
                        <p className="text-sm text-muted-foreground">Une los puntos en el mapa para crear el recorrido.</p>
                    </div>

                    {/* Datos Básicos */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                        <div className="grid gap-2">
                            <Label>Nombre de la Ruta</Label>
                            <Input placeholder="Ej: Ruta Sur - Mañana" value={routeName} onChange={e => setRouteName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Horario</Label>
                                <Input placeholder="07:00 AM" value={schedule} onChange={e => setSchedule(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
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
                    </div>

                    {/* Lista de Secuencia */}
                    <div>
                        <Label className="mb-2 block text-xs uppercase text-slate-500 font-bold">Secuencia de Paradas ({selectedStops.length})</Label>
                        <div className="space-y-2">
                            {selectedStops.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg text-slate-400 text-sm">
                                    Haz clic en los pines del mapa<br/>para añadir paradas en orden.
                                </div>
                            ) : (
                                selectedStops.map((stop, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm group hover:border-blue-400 transition-colors">
                                        <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 text-sm font-medium truncate">{stop.name}</div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100" onClick={() => removeStopFromRoute(index)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50">
                    <Button className="w-full" size="lg" onClick={handleSaveRoute}>
                        <Save className="w-4 h-4 mr-2"/> Guardar Ruta
                    </Button>
                </div>
            </Card>

            {/* PANEL DERECHO: MAPA SELECTOR */}
            <Card className="flex-1 overflow-hidden border-2 border-slate-200 shadow-none relative">
                <Map 
                    stops={allStops} // Muestra TODOS los puntos grises
                    routePath={selectedStops} // Muestra la línea uniendo los seleccionados
                    onStopClick={handleStopClick} // Acción al hacer clic en un pin
                    readonly={false}
                />
                
                {/* Leyenda */}
                <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-md text-xs space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span> Parada Disponible
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow"></span> Seleccionada
                    </div>
                </div>
            </Card>
        </div>
    );
}