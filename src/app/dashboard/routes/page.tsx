import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RoutesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Management</CardTitle>
        <CardDescription>
          This module is for creating, editing, publishing, and managing the university transport routes.
        </CardDescription>      
      </CardHeader>
      <CardContent>
        <p>Route management functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
