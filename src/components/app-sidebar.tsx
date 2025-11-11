'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Bus,
  Map,
  MapPin,
  BarChart,
  Bot,
  UserCircle,
  History,
  Route,
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const adminMenuItems = [
  { href: '/admin', label: 'Principal', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Gestión de Usuarios', icon: Users },
  { href: '/admin/drivers', label: 'Registro de Conductores', icon: Car },
  { href: '/admin/vehicles', label: 'Información de Vehículos', icon: Bus },
  { href: '/admin/routes', label: 'Gestión de Rutas', icon: Map },
  { href: '/admin/monitoring', label: 'Monitoreo', icon: MapPin },
  { href: '/admin/reports', label: 'Reportes', icon: BarChart },
];

const studentMenuItems = [
  { href: '/student/profile', label: 'Mi Perfil', icon: UserCircle },
  { href: '/student/route-map', label: 'Mapa de Rutas', icon: Map },
  { href: '/student/history', label: 'Historial de Viajes', icon: History },
  { href: '/student/assistant', label: 'Asistente IA', icon: Bot, tooltip: 'Asistente de Interrupciones IA' },
];

const driverMenuItems = [
    { href: '/driver/active-route', label: 'Ruta Activa', icon: Route },
];


export function AppSidebar() {
  const pathname = usePathname();
  const [role] = React.useState(() => {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/student')) return 'student';
    if (pathname.startsWith('/driver')) return 'driver';
    return 'admin';
  });

  const isActive = (href: string) => {
    return pathname === href;
  };

  let menuItems: any[] = [];
  let menuLabel = '';

  switch (role) {
    case 'admin':
      menuItems = adminMenuItems;
      menuLabel = 'Menú Administrador';
      break;
    case 'student':
      menuItems = studentMenuItems;
      menuLabel = 'Portal Estudiante';
      break;
    case 'driver':
        menuItems = driverMenuItems;
        menuLabel = 'Portal Conductor';
        break;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
        <Logo className="size-8 shrink-0"/>
        <h1 className="text-lg font-bold font-headline truncate group-data-[collapsible=icon]:hidden">
          T.U.E.M.I.
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>{menuLabel}</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.tooltip || item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>
    </div>
  );
}
