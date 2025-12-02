'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Bus,
  Map as MapIcon,
  MapPin,
  BarChart,
  Bot,
  UserCircle,
  History,
  Route as RouteIcon,
  Settings,
  ChevronRight,
} from 'lucide-react';

// 1. MANTÉN ESTO (Pero quita los Collapsible de aquí si estaban)
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

// 2. AGREGA ESTA IMPORTACIÓN NUEVA 👇
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

import { Logo } from '@/components/logo';

export function AppSidebar() {
  const pathname = usePathname();
  
  // Detectar Rol (Simple)
  const role = pathname.startsWith('/admin') ? 'admin' : 
               pathname.startsWith('/driver') ? 'driver' : 'student';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b bg-sidebar-accent/10">
        <Logo className="h-6 w-6 text-primary"/>
        <span className="font-bold text-lg tracking-tight">T.U.E.M.I.</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        
        {/* --- MENÚ ADMINISTRADOR --- */}
        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin"><LayoutDashboard /> <span>Principal</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* GRUPO GESTIÓN DE RUTAS (DESPLEGABLE) */}
              <Collapsible asChild defaultOpen={pathname.startsWith('/admin/routes') || pathname.startsWith('/admin/stops')} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Gestión de Rutas">
                      <MapIcon />
                      <span>Gestión de Rutas</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/admin/stops'}>
                          <Link href="/admin/stops">
                            <MapPin className="w-4 h-4 mr-2"/> <span>Paradas</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/admin/routes'}>
                          <Link href="/admin/routes">
                            <RouteIcon className="w-4 h-4 mr-2"/> <span>Rutas</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/users'}>
                  <Link href="/admin/users"><Users /> <span>Usuarios</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/drivers'}>
                  <Link href="/admin/drivers"><Car /> <span>Conductores</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/vehicles'}>
                  <Link href="/admin/vehicles"><Bus /> <span>Vehículos</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/monitoring'}>
                  <Link href="/admin/monitoring"><MapPin /> <span>Monitoreo En Vivo</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/reports'}>
                  <Link href="/admin/reports"><BarChart /> <span>Reportes</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* --- MENÚ ESTUDIANTE --- */}
        {role === 'student' && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal Estudiante</SidebarGroupLabel>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/student/profile'}>
                  <Link href="/student/profile"><UserCircle /> <span>Mi Credencial</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/student/route-map'}>
                  <Link href="/student/route-map"><MapIcon /> <span>Ver Buses</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/student/assistant'}>
                  <Link href="/student/assistant"><Bot /> <span>Asistente IA</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/student/history'}>
                  <Link href="/student/history"><History /> <span>Historial</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* --- MENÚ CONDUCTOR --- */}
        {role === 'driver' && (
          <SidebarGroup>
            <SidebarGroupLabel>Portal Conductor</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/driver/active-route'}>
                  <Link href="/driver/active-route"><RouteIcon /> <span>Mi Ruta</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/driver/settings'}>
                  <Link href="/driver/settings"><Settings /> <span>Ajustes</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

      </div>
    </div>
  );
}