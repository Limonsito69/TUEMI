// src/lib/env.ts

const requiredEnvs = [
  'DB_USER', 
  'DB_PASSWORD', 
  'DB_HOST', 
  'DB_NAME',        // <-- Agregado
  'SESSION_SECRET',
  'ADMIN_USER',     // <-- Credenciales Admin
  'ADMIN_PASSWORD'  // <-- Credenciales Admin
];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    // Esto detendrá la app inmediatamente si falta algo en el .env
    throw new Error(`❌ ERROR FATAL: Falta la variable de entorno: ${key}`);
  }
});

// Exportamos algo (aunque sea vacío) para asegurar que el archivo se ejecute al importarlo
export {};