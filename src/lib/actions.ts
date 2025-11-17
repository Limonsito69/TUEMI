
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
    
    // El driver mssql devuelve los datos en 'recordset'
    return result.recordset as User[];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

export async function createUser(userData: { name: string; ci: string; phone: string }): Promise<User | null> {
  try {
    const pool = await getDbPool();
    
    // Usamos parámetros (@name, @ci...) para prevenir inyección SQL.
    // OUTPUT INSERTED.* nos devuelve los datos recién creados (incluyendo el ID automático).
    const result = await pool.request()
      .input('name', sql.NVarChar, userData.name)
      .input('ci', sql.NVarChar, userData.ci)
      .input('phone', sql.NVarChar, userData.phone)
      .query(`
        INSERT INTO Users (name, ci, phone, status, avatar)
        OUTPUT INSERTED.*
        VALUES (@name, @ci, @phone, 'No Abonado', 'user-placeholder')
      `);

    if (result.recordset.length > 0) {
      return result.recordset[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw new Error('No se pudo crear el usuario. Verifica que el CI no esté duplicado.');
  }
}

export async function updateUser(user: User): Promise<User | null> {
  try {
    const pool = await getDbPool();
    
    // IMPORTANTE: Usamos el ID para saber a quién actualizar (WHERE id = @id)
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

    if (result.recordset.length > 0) {
      return result.recordset[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('No se pudo actualizar el usuario.');
  }
}

/**
 * Elimina un usuario por su ID.
 */
export async function deleteUser(userId: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    
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