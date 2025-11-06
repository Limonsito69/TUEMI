'use client';

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
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Principal',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/users',
    label: 'Gestión de Usuarios',
    icon: Users,
  },
  {
    href: '/dashboard/drivers',
    label: 'Registro de Conductores',
    icon: Car,
  },
  {
    href: '/dashboard/vehicles',
    label: 'Información de Vehículos',
    icon: Bus,
  },
  {
    href: '/dashboard/routes',
    label: 'Gestión de Rutas',
    icon: Map,
  },
  {
    href: '/dashboard/monitoring',
    label: 'Monitoreo',
    icon: MapPin,
  },
  {
    href: '/dashboard/reports',
    label: 'Reportes',
    icon: BarChart,
  },
];

const aiMenuItems = [
  {
    href: '/dashboard/student-view',
    label: 'Asistente IA',
    icon: Bot,
    tooltip: 'Asistente de Interrupciones IA',
  },
]

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

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
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.label}
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
         <SidebarGroup>
          <SidebarGroupLabel>Herramientas Estudiante</SidebarGroupLabel>
          <SidebarMenu>
            {aiMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.tooltip}
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
