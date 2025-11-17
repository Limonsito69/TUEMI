import sql from 'mssql';

// Configuración de la conexión usando las variables de entorno
const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Usar 'true' si te conectas a Azure SQL
    trustServerCertificate: true, // Necesario para conexiones locales (localhost)
  },
};

// Creamos un "pool" de conexiones global.
// Esto evita tener que crear una nueva conexión en cada petición,
// lo cual es mucho más eficiente.
let pool: sql.ConnectionPool | undefined;

/**
 * Obtiene el pool de conexiones a SQL Server,
 * creando uno nuevo si aún no existe.
 * @returns Una promesa que resuelve con el pool de conexiones.
 */
export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      console.log('Creando nuevo pool de conexiones a SQL Server...');
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('Pool de conexiones conectado.');
    } catch (err) {
      console.error('Error al conectar con la base de datos:', err);
      // Si la conexión falla, reseteamos el pool para que se intente de nuevo
      // en la siguiente petición.
      pool = undefined;
      throw err;
    }
  }
  return pool;
}

/**
 * Una función simple para ejecutar una consulta rápida.
 * Útil para probar la conexión.
 */
export async function quickQuery(query: string) {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(query);
    return result;
  } catch (err) {
    console.error('Error en quickQuery:', err);
    throw err;
  }
}