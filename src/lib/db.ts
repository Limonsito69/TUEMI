import sql from 'mssql';
import './env';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', 
    trustServerCertificate: true, 
  },
};

declare global {
  var _pool: sql.ConnectionPool | undefined;
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
  // Si ya existe una conexión global, la usamos (Evita reconectar en Hot Reload)
  if (global._pool) return global._pool;

  try {
    const pool = await new sql.ConnectionPool(config).connect();
    console.log('✅ Conectado a la Base de Datos');
    
    // Guardamos la conexión en global solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      global._pool = pool;
    }
    return pool;
  } catch (err) {
    console.error('❌ Error de conexión BD:', err);
    throw err;
  }
}

export async function quickQuery(query: string) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(query);
    return result;
  } catch (err) {
    console.error('Error en query:', err);
    throw err;
  }
}