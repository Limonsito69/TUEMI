import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* LOGOS */}
        <div className="flex items-center gap-4">
           {/* Logo 1: Institucional (Simulado con texto o imagen si tienes) */}
           <div className="font-bold text-xl tracking-tighter text-slate-900 border-r pr-4 mr-1">
              EMI
           </div>
           
           {/* Logo 2: Del Sistema */}
           <Link href="/" className="flex items-center gap-2">
             <Logo className="h-6 w-6 text-blue-700" />
             <span className="hidden font-bold sm:inline-block text-blue-800">
               T.U.E.M.I.
             </span>
           </Link>
        </div>

        {/* MENÚ DE ESCRITORIO */}
        <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
          <Link href="#inicio" className="text-slate-600 hover:text-blue-700 transition">Inicio</Link>
          <Link href="#rutas" className="text-slate-600 hover:text-blue-700 transition">Rutas</Link>
          <Link href="#info" className="text-slate-600 hover:text-blue-700 transition">Información</Link>
          <Link href="#contacto" className="text-slate-600 hover:text-blue-700 transition">Contacto</Link>
          
          <Button asChild>
             <Link href="/login">Acceder al Sistema</Link>
          </Button>
        </nav>

        {/* MENÚ MÓVIL (Hamburguesa) */}
        <div className="md:hidden">
           <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SheetTrigger>
              <SheetContent>
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="#inicio" className="text-lg font-medium">Inicio</Link>
                    <Link href="#rutas" className="text-lg font-medium">Rutas</Link>
                    <Link href="#info" className="text-lg font-medium">Información</Link>
                    <Button asChild className="mt-4"><Link href="/login">Iniciar Sesión</Link></Button>
                  </div>
              </SheetContent>
           </Sheet>
        </div>

      </div>
    </header>
  );
}