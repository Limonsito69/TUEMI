import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    // EN LA NUBE (Azure) debe ser true. EN LOCAL debe ser false.
    // Si DB_ENCRYPT existe en las variables de entorno, lo usa. Si no, asume false (local).
    encrypt: process.env.DB_ENCRYPT === 'true', 
    trustServerCertificate: true, 
  },
};

let pool: sql.ConnectionPool | undefined;

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('✅ Conectado a la Base de Datos');
    } catch (err) {
      console.error('❌ Error de conexión BD:', err);
      pool = undefined;
      throw err;
    }
  }
  return pool;
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