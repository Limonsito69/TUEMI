'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  // --- PROTECCIÓN DE RUTA ---
  React.useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const storedUser = sessionStorage.getItem('loggedInUser');
      
      if (!storedUser) {
        // Si no hay sesión, mandar al login
        router.replace('/');
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        // Verificar que el rol sea ADMIN
        if (user.role !== 'admin') {
          alert('Acceso denegado. No tienes permisos de administrador.');
          // Si es conductor o estudiante, mandar a su portal correspondiente o al home
          if (user.role === 'driver') router.replace('/driver');
          else if (user.role === 'student') router.replace('/student');
          else router.replace('/');
          return;
        }
        
        // Si pasa todas las pruebas, autorizamos la vista
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error de sesión:", error);
        sessionStorage.removeItem('loggedInUser');
        router.replace('/');
      }
    }
  }, [router]);

  // Mientras verificamos, no mostramos nada o un spinner simple
  if (!isAuthorized) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
          {/* El trigger abre/cierra el menú en escritorio */}
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        
        <SidebarContent>
          {/* Menú lateral dinámico */}
          <AppSidebar />
        </SidebarContent>
        
        <SidebarFooter>
          {/* Aquí podrías poner info del usuario logueado si quisieras */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        {/* Encabezado superior con migas de pan y perfil */}
        <AppHeader />
        
        {/* Contenido principal de la página */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}