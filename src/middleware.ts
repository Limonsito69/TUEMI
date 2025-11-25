import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// 1. Define qué rutas quieres proteger
const protectedRoutes = ['/admin', '/student', '/driver'];

export default async function middleware(req: NextRequest) {
  // 2. Leer la ruta a la que intentan entrar
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // 3. Obtener la sesión (verifica la cookie automáticamente)
  const session = await getSession();

  // CASO A: Usuario NO logueado intenta entrar a ruta protegida
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // CASO B: Usuario YA logueado intenta ir al login ('/')
  // Lo mandamos a su panel correspondiente
  if (path === '/' && session) {
    if (session.role === 'admin') return NextResponse.redirect(new URL('/admin', req.nextUrl));
    if (session.role === 'driver') return NextResponse.redirect(new URL('/driver/active-route', req.nextUrl)); // Ajusta la ruta según tu estructura
    if (session.role === 'student') return NextResponse.redirect(new URL('/student/profile', req.nextUrl));
  }

  // CASO C: Protección de Roles (Ej: Estudiante intentando entrar a Admin)
  if (isProtectedRoute && session) {
    if (path.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.nextUrl)); // O a una página de "Acceso Denegado"
    }
    if (path.startsWith('/driver') && session.role !== 'driver') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/student') && session.role !== 'student') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Configuración para que no se ejecute en archivos estáticos (imágenes, css, etc.)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};  