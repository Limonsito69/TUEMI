import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RoutesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Rutas</CardTitle>
        <CardDescription>
          Este módulo es para crear, editar, publicar y gestionar las rutas de transporte de la universidad.
        </CardDescription>      
      </CardHeader>
      <CardContent>
        <p>La funcionalidad de gestión de rutas se implementará aquí.</p>
      </CardContent>
    </Card>
  );
}
