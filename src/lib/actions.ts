
'use server';

import { detectRouteIncident, DetectRouteIncidentInput, DetectRouteIncidentOutput } from "@/ai/flows/route-incident-detection";
import { suggestAlternativeTransport, SuggestAlternativeTransportInput, SuggestAlternativeTransportOutput } from "@/ai/flows/transportation-disruption-suggestions";
import { getDbPool } from '@/lib/db';
import { User, Vehicle, Driver, Route,Trip } from '@/types';  
import sql from 'mssql';


export async function runIncidentDetection(input: DetectRouteIncidentInput): Promise<DetectRouteIncidentOutput> {
    console.log('Ejecutando detección de incidentes con entrada:', input);
    try {
        const result = await detectRouteIncident(input);
        return result;
    } catch (error) {
        console.error("Error en runIncidentDetection:", error);
        return {
            incidentDetected: true,
            incidentType: 'Error',
            incidentDetails: 'Ocurrió un error al procesar la solicitud.'
        };
    }
}


export async function getTransportSuggestions(input: SuggestAlternativeTransportInput): Promise<SuggestAlternativeTransportOutput> {
    console.log('Obteniendo sugerencias de transporte con entrada:', input);
    try {
        const result = await suggestAlternativeTransport(input);
        return result;
    } catch (error) {
        console.error("Error en getTransportSuggestions:", error);
        return {
            alternativeSuggestions: 'Lo sentimos, no pudimos obtener sugerencias en este momento. Por favor, verifica los servicios de transporte público directamente.'
        };
    }
}

/**
 * Obtiene todos los usuarios de la base de datos.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT * FROM Users ORDER BY id DESC');
    return result.recordset as User[];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

export async function createUser(userData: { name: string; ci: string; phone: string }): Promise<User | null> {
  try {
    const pool = await getDbPool();
    
    // 1. VALIDACIÓN: Verificar si el CI ya existe
    const check = await pool.request()
      .input('ci', sql.NVarChar, userData.ci)
      .query("SELECT id FROM Users WHERE ci = @ci");
      
    if (check.recordset.length > 0) {
      throw new Error(`El CI ${userData.ci} ya está registrado.`);
    }

    // 2. INSERCIÓN
    const result = await pool.request()
      .input('name', sql.NVarChar, userData.name)
      .input('ci', sql.NVarChar, userData.ci)
      .input('phone', sql.NVarChar, userData.phone)
      .query(`
        INSERT INTO Users (name, ci, phone, status, avatar)
        OUTPUT INSERTED.*
        VALUES (@name, @ci, @phone, 'No Abonado', 'user-placeholder')
      `);

    const newUser = result.recordset[0] as User;

    // 3. AUDITORÍA
    await logAudit('Admin', newUser.id, 'CREAR', `Usuario creado: ${newUser.name} (${newUser.ci})`);

    return newUser;
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    throw new Error(error.message || 'No se pudo crear el usuario.');
  }
}

export async function updateUser(user: User): Promise<User | null> {
  try {
    const pool = await getDbPool();
    
    // Obtenemos el estado anterior para comparar (Auditoría y Lógica de Negocio)
    const previousDataResult = await pool.request()
        .input('id', sql.Int, user.id)
        .query("SELECT status FROM Users WHERE id = @id");
    const previousStatus = previousDataResult.recordset[0]?.status;

    // UPDATE
    const result = await pool.request()
      .input('id', sql.Int, user.id)
      .input('name', sql.NVarChar, user.name)
      .input('ci', sql.NVarChar, user.ci)
      .input('phone', sql.NVarChar, user.phone)
      .input('status', sql.NVarChar, user.status)
      .query(`
        UPDATE Users 
        SET name = @name, ci = @ci, phone = @phone, status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    const updatedUser = result.recordset[0] as User;

    // LOGICA DE NEGOCIO: Si cambió de Abonado a No Abonado
    if (previousStatus === 'Abonado' && updatedUser.status === 'No Abonado') {
        // Aquí iría la lógica para desactivar su parada
        // await deactivateUserStop(user.id); 
        console.log(`[Sistema] Desactivando parada para usuario ${user.id}...`);
        await logAudit('Sistema', user.id, 'DESVINCULACION', 'Se desactivó la parada por falta de pago.');
    }

    // AUDITORÍA GENÉRICA
    await logAudit('Admin', user.id, 'EDITAR', `Datos actualizados. Estado: ${previousStatus} -> ${updatedUser.status}`);

    return updatedUser;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('No se pudo actualizar el usuario.');
  }
}

export async function deleteUser(userId: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    
    await logAudit('Admin', userId, 'ELIMINAR', 'Usuario eliminado del sistema.');

    await pool.request()
      .input('id', sql.Int, userId)
      .query('DELETE FROM Users WHERE id = @id');

    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return false;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT * FROM Vehicles ORDER BY id DESC');
    return result.recordset as Vehicle[];
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return [];
  }
}

export async function createVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('plate', sql.NVarChar, data.plate)
      .input('brand', sql.NVarChar, data.brand)
      .input('model', sql.NVarChar, data.model)
      .input('capacity', sql.Int, data.capacity)
      .input('status', sql.NVarChar, data.status)
      .input('image', sql.NVarChar, data.image || 'vehicle-placeholder') // Imagen por defecto
      .query(`
        INSERT INTO Vehicles (plate, brand, model, capacity, status, image)
        OUTPUT INSERTED.*
        VALUES (@plate, @brand, @model, @capacity, @status, @image)
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Vehicle;
    }
    return null;
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    throw new Error('No se pudo crear el vehículo. Verifica que la placa no esté duplicada.');
  }
}

/**
 * Actualiza un vehículo existente.
 */
export async function updateVehicle(vehicle: Vehicle): Promise<Vehicle | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', sql.Int, vehicle.id)
      .input('plate', sql.NVarChar, vehicle.plate)
      .input('brand', sql.NVarChar, vehicle.brand)
      .input('model', sql.NVarChar, vehicle.model)
      .input('capacity', sql.Int, vehicle.capacity)
      .input('status', sql.NVarChar, vehicle.status)
      .query(`
        UPDATE Vehicles 
        SET plate = @plate, brand = @brand, model = @model, capacity = @capacity, status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Vehicle;
    }
    return null;
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    throw new Error('No se pudo actualizar el vehículo.');
  }
}

/**
 * Elimina un vehículo.
 */
export async function deleteVehicle(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Vehicles WHERE id = @id');
    return true;
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return false;
  }
}

export async function getDrivers(): Promise<Driver[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT * FROM Drivers ORDER BY id DESC');
    return result.recordset as Driver[];
  } catch (error) {
    console.error('Error al obtener conductores:', error);
    return [];
  }
}

/**
 * Crea un nuevo conductor.
 */
export async function createDriver(data: Omit<Driver, 'id'>): Promise<Driver | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('name', sql.NVarChar, data.name)
      .input('ci', sql.NVarChar, data.ci)
      .input('phone', sql.NVarChar, data.phone)
      .input('license', sql.NVarChar, data.license)
      .input('status', sql.NVarChar, data.status)
      .input('avatar', sql.NVarChar, data.avatar || 'driver-placeholder')
      .query(`
        INSERT INTO Drivers (name, ci, phone, license, status, avatar)
        OUTPUT INSERTED.*
        VALUES (@name, @ci, @phone, @license, @status, @avatar)
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Driver;
    }
    return null;
  } catch (error) {
    console.error('Error al crear conductor:', error);
    throw new Error('No se pudo crear el conductor. Verifica el CI.');
  }
}

/**
 * Actualiza un conductor existente.
 */
export async function updateDriver(driver: Driver): Promise<Driver | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', sql.Int, driver.id)
      .input('name', sql.NVarChar, driver.name)
      .input('ci', sql.NVarChar, driver.ci)
      .input('phone', sql.NVarChar, driver.phone)
      .input('license', sql.NVarChar, driver.license)
      .input('status', sql.NVarChar, driver.status)
      .query(`
        UPDATE Drivers 
        SET name = @name, ci = @ci, phone = @phone, license = @license, status = @status
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Driver;
    }
    return null;
  } catch (error) {
    console.error('Error al actualizar conductor:', error);
    throw new Error('No se pudo actualizar el conductor.');
  }
}

/**
 * Elimina un conductor.
 */
export async function deleteDriver(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Drivers WHERE id = @id');
    return true;
  } catch (error) {
    console.error('Error al eliminar conductor:', error);
    return false;
  }
}

export async function getRoutes(): Promise<Route[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT * FROM Routes ORDER BY id DESC');
    return result.recordset as Route[];
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    return [];
  }
}

/**
 * Crea una nueva ruta.
 */
export async function createRoute(data: Omit<Route, 'id'>): Promise<Route | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('name', sql.NVarChar, data.name)
      .input('type', sql.NVarChar, data.type)
      .input('driverId', sql.Int, data.driverId)
      .input('vehicleId', sql.Int, data.vehicleId)
      .input('status', sql.NVarChar, data.status)
      .input('schedule', sql.NVarChar, data.schedule)
      .input('stops', sql.Int, data.stops)
      .query(`
        INSERT INTO Routes (name, type, driverId, vehicleId, status, schedule, stops)
        OUTPUT INSERTED.*
        VALUES (@name, @type, @driverId, @vehicleId, @status, @schedule, @stops)
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Route;
    }
    return null;
  } catch (error) {
    console.error('Error al crear ruta:', error);
    throw new Error('No se pudo crear la ruta.');
  }
}

/**
 * Actualiza una ruta existente.
 */
export async function updateRoute(route: Route): Promise<Route | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', sql.Int, route.id)
      .input('name', sql.NVarChar, route.name)
      .input('type', sql.NVarChar, route.type)
      .input('driverId', sql.Int, route.driverId)
      .input('vehicleId', sql.Int, route.vehicleId)
      .input('status', sql.NVarChar, route.status)
      .input('schedule', sql.NVarChar, route.schedule)
      .input('stops', sql.Int, route.stops)
      .query(`
        UPDATE Routes
        SET name = @name, type = @type, driverId = @driverId, vehicleId = @vehicleId,
            status = @status, schedule = @schedule, stops = @stops
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Route;
    }
    return null;
  } catch (error) {
    console.error('Error al actualizar ruta:', error);
    throw new Error('No se pudo actualizar la ruta.');
  }
}

/**
 * Elimina una ruta.
 */
export async function deleteRoute(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Routes WHERE id = @id');
    return true;
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    return false;
  }
}

export async function getActiveTrips(): Promise<Trip[]> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .query("SELECT * FROM Trips WHERE status = 'En curso'");
    return result.recordset as Trip[];
  } catch (error) {
    console.error('Error al obtener viajes activos:', error);
    return [];
  }
}

/**
 * Crea (Inicia) un nuevo viaje.
 */
export async function startTrip(tripData: { routeId: number, driverId: number, vehicleId: number, startLat: number, startLng: number }): Promise<Trip | null> {
  try {
    const pool = await getDbPool();
    // La fecha actual se genera automáticamente o la pasamos
    const startTime = new Date();
    
    const result = await pool.request()
      .input('routeId', sql.Int, tripData.routeId)
      .input('driverId', sql.Int, tripData.driverId)
      .input('vehicleId', sql.Int, tripData.vehicleId)
      .input('startTime', sql.DateTime2, startTime)
      .input('lat', sql.Decimal(9,6), tripData.startLat)
      .input('lng', sql.Decimal(9,6), tripData.startLng)
      .query(`
        INSERT INTO Trips (routeId, driverId, vehicleId, startTime, status, passengersAbonado, passengersNoAbonado, locationLat, locationLng)
        OUTPUT INSERTED.*
        VALUES (@routeId, @driverId, @vehicleId, @startTime, 'En curso', 0, 0, @lat, @lng)
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as Trip;
    }
    return null;
  } catch (error) {
    console.error('Error al iniciar viaje:', error);
    throw error;
  }
}

/**
 * Simula el movimiento de los vehículos (Solo para DEMO).
 * En producción, esto lo haría el celular del conductor enviando coordenadas reales.
 */
export async function simulateVehicleMovement(): Promise<void> {
  try {
    const pool = await getDbPool();
    // Esta query mueve ligeramente la latitud/longitud de todos los viajes activos
    // para simular que están avanzando en el mapa.
    await pool.request().query(`
      UPDATE Trips
      SET locationLat = locationLat + 0.0001, -- Pequeño movimiento al norte
          locationLng = locationLng + (0.0001 * CASE WHEN id % 2 = 0 THEN 1 ELSE -1 END) -- Movimiento este/oeste
      WHERE status = 'En curso'
    `);
  } catch (error) {
    console.error('Error en simulación de movimiento:', error);
  }
}

export async function getDriverActiveTrip(driverId: number): Promise<Trip | null> {
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('driverId', sql.Int, driverId)
      .query("SELECT * FROM Trips WHERE driverId = @driverId AND status = 'En curso'");
    
    if (result.recordset.length > 0) {
      return result.recordset[0] as Trip;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar viaje activo del conductor:', error);
    return null;
  }
}

/**
 * Finaliza un viaje (marca la hora de fin y cambia el estado).
 */
export async function endTrip(tripId: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    const endTime = new Date();
    
    await pool.request()
      .input('id', sql.Int, tripId)
      .input('endTime', sql.DateTime2, endTime)
      .query("UPDATE Trips SET status = 'Finalizado', endTime = @endTime WHERE id = @id");
      
    return true;
  } catch (error) {
    console.error('Error al finalizar viaje:', error);
    return false;
  }
}

/**
 * Actualiza la ubicación de un viaje (Simula el GPS enviando datos).
 */
export async function updateTripLocation(tripId: number, lat: number, lng: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', sql.Int, tripId)
      .input('lat', sql.Decimal(9, 6), lat)
      .input('lng', sql.Decimal(9, 6), lng)
      .query("UPDATE Trips SET locationLat = @lat, locationLng = @lng WHERE id = @id");
    return true;
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    return false;
  }
}

export async function authenticate(ci: string, role: 'student' | 'driver' | 'admin') {
  try {
    const pool = await getDbPool();
    
    if (role === 'driver') {
      // Buscar en tabla Drivers
      const result = await pool.request()
        .input('ci', sql.NVarChar, ci)
        .query("SELECT * FROM Drivers WHERE ci = @ci");
        
      if (result.recordset.length > 0) {
        // Retornamos el conductor encontrado
        const driver = result.recordset[0] as Driver;
        // Verificamos que esté activo (opcional)
        if (driver.status === 'Inactivo') return { success: false, message: 'Conductor inactivo.' };
        return { success: true, user: driver, role: 'driver' };
      }
    } 
    else if (role === 'student') {
      // Buscar en tabla Users
      const result = await pool.request()
        .input('ci', sql.NVarChar, ci)
        .query("SELECT * FROM Users WHERE ci = @ci");
        
      if (result.recordset.length > 0) {
        return { success: true, user: result.recordset[0] as User, role: 'student' };
      }
    }
    else if (role === 'admin') {
      // Para ADMIN, por simplicidad en esta demo, usaremos un CI "maestro"
      // o podrías buscar en una tabla de Admins si la tuvieras.
      if (ci === 'admin123') {
         return { success: true, user: { name: 'Administrador' }, role: 'admin' };
      }
    }

    return { success: false, message: 'Credenciales no encontradas.' };

  } catch (error) {
    console.error('Error en autenticación:', error);
    return { success: false, message: 'Error del servidor.' };
  }
}

/**
 * Registra un nuevo estudiante desde la página pública.
 */
export async function registerStudent(data: { name: string; ci: string; phone: string }) {
  // Reutilizamos la lógica de crear usuario, pero forzamos el rol de estudiante/no abonado
  // y manejamos errores de duplicados específicamente para el frontend público.
  try {
    const pool = await getDbPool();
    
    // Verificar si ya existe
    const check = await pool.request()
        .input('ci', sql.NVarChar, data.ci)
        .query("SELECT id FROM Users WHERE ci = @ci");
        
    if (check.recordset.length > 0) {
        return { success: false, message: 'Este CI ya está registrado.' };
    }

    // Insertar
    const result = await pool.request()
      .input('name', sql.NVarChar, data.name)
      .input('ci', sql.NVarChar, data.ci)
      .input('phone', sql.NVarChar, data.phone)
      .query(`
        INSERT INTO Users (name, ci, phone, status, avatar)
        OUTPUT INSERTED.*
        VALUES (@name, @ci, @phone, 'No Abonado', 'user-placeholder')
      `);

    if (result.recordset.length > 0) {
       return { success: true, user: result.recordset[0] as User };
    }
    return { success: false, message: 'No se pudo registrar.' };

  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, message: 'Error del servidor.' };
  }
}
async function logAudit(adminName: string, targetUserId: number, action: string, details: string) {
  try {
    const pool = await getDbPool();
    await pool.request()
      .input('adminName', sql.NVarChar, adminName)
      .input('targetUserId', sql.Int, targetUserId)
      .input('action', sql.NVarChar, action)
      .input('details', sql.NVarChar, details)
      .query("INSERT INTO AuditLogs (adminName, targetUserId, action, details) VALUES (@adminName, @targetUserId, @action, @details)");
  } catch (error) {
    console.error("Error guardando log de auditoría:", error);
    // No lanzamos error para no interrumpir la acción principal
  }
}