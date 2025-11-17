
'use server';

import { detectRouteIncident, DetectRouteIncidentInput, DetectRouteIncidentOutput } from "@/ai/flows/route-incident-detection";
import { suggestAlternativeTransport, SuggestAlternativeTransportInput, SuggestAlternativeTransportOutput } from "@/ai/flows/transportation-disruption-suggestions";
import { getDbPool } from '@/lib/db';
import { User, Vehicle } from '@/types';  
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