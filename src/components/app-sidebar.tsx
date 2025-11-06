'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  SteeringWheel,
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
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/users',
    label: 'User Management',
    icon: Users,
  },
  {
    href: '/dashboard/drivers',
    label: 'Driver Registry',
    icon: SteeringWheel,
  },
  {
    href: '/dashboard/vehicles',
    label: 'Vehicle Information',
    icon: Bus,
  },
  {
    href: '/dashboard/routes',
    label: 'Route Management',
    icon: Map,
  },
  {
    href: '/dashboard/monitoring',
    label: 'Monitoring',
    icon: MapPin,
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: BarChart,
  },
];

const aiMenuItems = [
  {
    href: '/dashboard/student-view',
    label: 'Disruption Helper',
    icon: Bot,
    tooltip: 'AI Disruption Helper',
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
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
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
          <SidebarGroupLabel>Student Tools</SidebarGroupLabel>
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
