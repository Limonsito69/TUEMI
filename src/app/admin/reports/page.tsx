'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemStats, DashboardStats } from '@/lib/actions';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Users, Bus, Route as RouteIcon, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Colores para los gráficos (Azul, Verde, Amarillo, Naranja)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
    )
  }

  if (!stats) return <div className="p-8 text-center">No se pudieron cargar los datos.</div>;

  // Preparar datos para los gráficos
  const userPieData = [
    { name: 'Abonados', value: stats.abonados },
    { name: 'No Abonados', value: stats.noAbonados },
  ];

  const vehiclePieData = [
    { name: 'Activos', value: stats.activeVehicles },
    { name: 'Mantenimiento', value: stats.maintenanceVehicles },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Reportes y Analíticas</h2>

      {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Estudiantes y personal registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonados Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.abonados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? ((stats.abonados / stats.totalUsers) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flota Operativa</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">Vehículos listos para ruta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
            <RouteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">Histórico de viajes realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* --- GRÁFICOS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfico 1: Rendimiento de Conductores (Barras) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Conductores</CardTitle>
            <CardDescription>Conductores con mayor cantidad de viajes realizados.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tripsByDriver}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <YAxis className="text-xs" allowDecimals={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Bar dataKey="trips" name="Viajes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Distribución de Usuarios (Pastel) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <CardDescription>Proporción Abonados vs. No Abonados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex justify-center relative">
                {stats.totalUsers === 0 ? (
                    <div className="flex items-center justify-center text-muted-foreground text-sm">No hay datos suficientes</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={userPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {userPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )}
                {/* Leyenda Central */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                </div>
            </div>
            <div className="flex justify-center gap-4 text-sm mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" /> Abonados
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" /> No Abonados
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}