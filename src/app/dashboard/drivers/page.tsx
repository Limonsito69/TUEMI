import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DriversPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Registry</CardTitle>
        <CardDescription>
          This module is used to register, edit, and manage the information of the drivers who operate the university transport vehicles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Driver management functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
