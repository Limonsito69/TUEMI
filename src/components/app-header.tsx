'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUser, Search } from 'lucide-react';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

function getPathSegments(pathname: string) {
  return pathname.split('/').filter(Boolean);
}

function formatSegment(segment: string) {
  const segmentMap: { [key: string]: string } = {
    admin: 'Principal',
    users: 'Usuarios',
    drivers: 'Conductores',
    vehicles: 'Vehículos',
    routes: 'Rutas',
    monitoring: 'Monitoreo',
    reports: 'Reportes',
    student: 'Estudiante',
    driver: 'Conductor',
    assistant: 'Asistente IA',
    profile: 'Perfil',
    'route-map': 'Mapa de Rutas',
    history: 'Historial',
    'active-route': 'Ruta Activa',
  };
  return segmentMap[segment] || segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AppHeader() {
  const pathname = usePathname();
  const segments = getPathSegments(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {segments.map((segment, index) => (
            <React.Fragment key={segment}>
              <BreadcrumbItem>
                {index < segments.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={`/${segments.slice(0, index + 1).join('/')}`}>
                      {formatSegment(segment)}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < segments.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Alternar menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Cerrar Sesión</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
