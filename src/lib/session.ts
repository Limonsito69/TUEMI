import 'server-only'; // Asegura que esto solo se ejecute en el servidor
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  id: number;
  name: string;
  role: 'admin' | 'student' | 'driver';
  expiresAt: Date;
};

// 1. Crear la sesión (Encriptar)
export async function createSession(userId: number, name: string, role: 'admin' | 'student' | 'driver') {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días de validez
  const payload: SessionPayload = { id: userId, name, role, expiresAt };

  const session = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const cookieStore = await cookies();
  
  cookieStore.set('session', session, {
    httpOnly: true, // ¡Importante! El JS del navegador no puede leer esto
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// 2. Obtener la sesión (Desencriptar y Verificar)
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.log('Error verificando sesión:', error);
    return null;
  }
}

// 3. Cerrar sesión (Borrar cookie)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}