import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DriversPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Conductores</CardTitle>
        <CardDescription>
          Este módulo se utiliza para registrar, editar y gestionar la información de los conductores que operan los vehículos de transporte de la universidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>La funcionalidad de gestión de conductores se implementará aquí.</p>
      </CardContent>
    </Card>
  );
}
