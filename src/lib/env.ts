// src/lib/env.ts
const requiredEnvs = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'SESSION_SECRET'];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Faltante variable de entorno: ${key}`);
  }
});