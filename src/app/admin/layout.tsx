import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ¡YA NO NECESITAMOS VERIFICAR LA SESIÓN AQUÍ!
  // El Middleware se encargará de proteger esta ruta antes de que cargue la página.

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent>
          <AppSidebar />
        </SidebarContent>
        <SidebarFooter>
          {/* Footer vacío por ahora */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}