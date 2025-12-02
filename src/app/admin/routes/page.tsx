"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { getStops, createRoute } from "@/lib/actions"; // Usamos acciones reales

const Map = dynamic(() => import("@/components/ui/map"), { ssr: false });

export default function RoutesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Datos de la Ruta
  const [name, setName] = React.useState("");
  const [schedule, setSchedule] = React.useState("");
  const [status, setStatus] = React.useState("En borrador");
  const [category, setCategory] = React.useState("Regular");
  const [sense, setSense] = React.useState("Subida");

  // Lógica de Paradas
  const [allStops, setAllStops] = React.useState<any[]>([]);
  const [selectedStops, setSelectedStops] = React.useState<any[]>([]);

  // Cargar inventario de paradas
  React.useEffect(() => {
        const fetchStops = async () => {
            try {
                // Truco: Añadimos un timestamp para engañar al navegador y evitar caché
                // Aunque getStops() en el servidor ya tiene noStore(), esto asegura el cliente.
                const data = await getStops();
                console.log("Rutas: Paradas frescas cargadas:", data);
                setAllStops(data);
            } catch (error) {
                console.error("Error cargando paradas en rutas:", error);
                toast({ title: "Error", description: "No se pudieron cargar las paradas.", variant: "destructive" });
            }
        };
        
        fetchStops();
    }, [toast]);

  const handleStopClick = (stop: any) => {
    if (selectedStops.find((s) => s.stopId === stop.id)) {
      toast({
        title: "Ya existe",
        description: "Esta parada ya está en la ruta.",
      });
      return;
    }
    setSelectedStops([
      ...selectedStops,
      {
        stopId: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        order: selectedStops.length + 1,
      },
    ]);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...selectedStops];
    newStops.splice(index, 1);
    setSelectedStops(newStops.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleSave = async () => {
    if (!name || !schedule || selectedStops.length < 2) {
      toast({
        title: "Faltan datos",
        description:
          "Verifica el nombre, horario y selecciona al menos 2 paradas.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await createRoute({
        name,
        schedule,
        status,
        Categoria: category,
        // Sentido: sense, (Si agregas el campo a actions.ts)
        stops: selectedStops.length,
        waypoints: selectedStops,
      });
      toast({
        title: "¡Ruta Creada!",
        description: "Disponible para asignación.",
      });
      // Reset form
      setName("");
      setSelectedStops([]);
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo guardar la ruta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* CONFIGURADOR */}
      <Card className="w-1/3 flex flex-col border-none shadow-lg bg-white">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold">Diseñador de Rutas</h2>
            <div className="text-xs bg-yellow-100 text-yellow-800 p-2 rounded mb-4 border border-yellow-300 overflow-auto max-h-40">
              DEBUG: Paradas cargadas: <strong>{allStops.length}</strong>
              <pre>{JSON.stringify(allStops, null, 2)}</pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Une los puntos para crear el recorrido.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded border">
            <div className="grid gap-1">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Ruta Sur"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Horario</Label>
                <Input
                  placeholder="07:00"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs font-bold text-slate-500 uppercase">
              Secuencia ({selectedStops.length})
            </Label>
            <div className="space-y-2">
              {selectedStops.map((stop, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-white border rounded shadow-sm text-sm"
                >
                  <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{stop.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveStop(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {selectedStops.length === 0 && (
                <p className="text-xs text-center py-4 text-muted-foreground border-2 border-dashed rounded">
                  Selecciona pines en el mapa.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Guardar Ruta
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* MAPA */}
      <Card className="flex-1 overflow-hidden border shadow-sm relative">
        <Map
          stops={allStops}
          routePath={selectedStops}
          onStopClick={handleStopClick}
          interactive={true}
        />
      </Card>
    </div>
  );
}
