"use server";
import { z } from 'zod'; // Asegúrate de importar Zod


import {
  detectRouteIncident,
  DetectRouteIncidentInput,
  DetectRouteIncidentOutput,
} from "@/ai/flows/route-incident-detection";
import {
  suggestAlternativeTransport,
  SuggestAlternativeTransportInput,
  SuggestAlternativeTransportOutput,
} from "@/ai/flows/transportation-disruption-suggestions";
import { getDbPool } from "@/lib/db";
import { User, Vehicle, Driver, Route, Trip } from "@/types";
import sql from "mssql";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

// --- TIPOS AUXILIARES ---
type CreateUserInput = {
  nombres: string;
  paterno: string;
  materno: string;
  ci_numero: string;
  ci_extension: string;
  phone: string;
  email?: string;
  password?: string;
  assignedRouteId?: string;
};

export type AuditLog = {
  id: number;
  adminName: string;
  action: string;
  details: string;
  timestamp: Date;
};

export type DashboardStats = {
  totalUsers: number;
  abonados: number;
  noAbonados: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  totalTrips: number;
  tripsByDriver: { name: string; trips: number }[];
};

// --- AUTENTICACIÓN (CORREGIDA) ---

// En src/lib/actions.ts

// --- HELPERS DE SEGURIDAD ---

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Acceso Denegado: Se requiere ser Administrador.");
  }
  return session; // Retorna la sesión por si necesitamos el ID del admin
}

async function requireDriver() {
  const session = await getSession();
  if (!session || session.role !== "driver") {
    throw new Error("Acceso Denegado: Se requiere ser Conductor.");
  }
  return session;
}

async function requireStudent() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    throw new Error("Acceso Denegado: Se requiere ser Estudiante.");
  }
  return session;
}

export async function authenticate(ci: string, password: string = "123456") {
  try {
    // 1. ADMIN MAESTRO
    if (
      ci === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // ¡AQUÍ ESTÁ EL CAMBIO! Creamos la sesión segura
      await createSession(0, "Administrador", "admin");
      return { success: true, role: "admin" };
    }

    const pool = await getDbPool();

    // 2. BUSCAR CONDUCTOR
    // SOLUCIÓN: Quitamos 'sql.NVarChar' y dejamos solo ('ci', ci)
    const driverResult = await pool
      .request()
      .input("ci", ci) // <--- CAMBIO AQUÍ: Dejamos que mssql detecte el tipo solo
      .query(`SELECT * FROM Drivers WHERE ci = @ci OR ci LIKE @ci + ' %'`);

    if (driverResult.recordset.length > 0) {
      const driver = driverResult.recordset[0];
      const dbPass = driver.password || "123456";

      if (dbPass !== password)
        return { success: false, message: "Contraseña incorrecta." };
      if (driver.status === "Inactivo")
        return { success: false, message: "Cuenta inactiva." };

      await createSession(driver.id, driver.name, "driver");
      return { success: true, role: "driver" };
    }

    // 3. BUSCAR ESTUDIANTE
    console.log("5. Buscando estudiante...");

    // SOLUCIÓN: Quitamos 'sql.NVarChar' aquí también
    const userResult = await pool
      .request()
      .input("ci", ci) // <--- CAMBIO AQUÍ
      .query("SELECT * FROM Users WHERE ci = @ci OR ci_numero = @ci");

    console.log("6. Resultados estudiante:", userResult.recordset.length);

    if (userResult.recordset.length > 0) {
      const user = userResult.recordset[0];
      const dbPass = user.password || "123456";

      if (dbPass !== password)
        return { success: false, message: "Contraseña incorrecta." };
      if (user.status === "Inactivo")
        return { success: false, message: "Cuenta inactiva." };

      await createSession(user.id, user.name, "student");
      return { success: true, role: "student" };
    }

    return { success: false, message: "Usuario no encontrado." };
  } catch (e) {
    console.error("Error CRÍTICO:", e);
    return { success: false, message: "Error interno de base de datos." };
  }
}

// --- RESTO DE FUNCIONES (REGISTRO, IA, CRUDS...) ---

export async function registerStudent(
  data: CreateUserInput & { password: string }
) {
  try {
    const pool = await getDbPool();
    // Validar lista blanca
    const allowed = await pool
      .request()
      .input("ci", sql.NVarChar, data.ci_numero)
      .query("SELECT * FROM AllowedRegistry WHERE ci = @ci");
    if (allowed.recordset.length === 0)
      return { success: false, message: "CI no habilitado para registro." };

    // Validar duplicados
    const dup = await pool
      .request()
      .input("ci", sql.NVarChar, data.ci_numero)
      .query("SELECT id FROM Users WHERE ci_numero = @ci");
    if (dup.recordset.length > 0)
      return { success: false, message: "Ya existe una cuenta con este CI." };

    const fullName = `${data.nombres} ${data.paterno} ${data.materno}`.trim();
    const fullCi = `${data.ci_numero} ${data.ci_extension}`;

    const res = await pool
      .request()
      .input("n", sql.NVarChar, data.nombres)
      .input("p", sql.NVarChar, data.paterno)
      .input("m", sql.NVarChar, data.materno)
      .input("cn", sql.NVarChar, data.ci_numero)
      .input("ce", sql.NVarChar, data.ci_extension)
      .input("ph", sql.NVarChar, data.phone)
      .input("em", sql.NVarChar, data.email)
      .input("pwd", sql.NVarChar, data.password)
      .input("fn", sql.NVarChar, fullName)
      .input("fc", sql.NVarChar, fullCi)
      .query(
        `INSERT INTO Users (nombres, paterno, materno, ci_numero, ci_extension, phone, email, password, name, ci, status, avatar) OUTPUT INSERTED.* VALUES (@n, @p, @m, @cn, @ce, @ph, @em, @pwd, @fn, @fc, 'No Abonado', 'user-placeholder')`
      );

    return { success: true, user: res.recordset[0] as User };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error registro" };
  }
}

// --- IA & UTILIDADES ---

export async function runIncidentDetection(
  input: DetectRouteIncidentInput
): Promise<DetectRouteIncidentOutput> {
  try {
    const result = await detectRouteIncident(input);
    return result;
  } catch (error) {
    console.error("Error en runIncidentDetection:", error);
    return {
      incidentDetected: true,
      incidentType: "Error",
      incidentDetails: "Error al procesar la solicitud.",
    };
  }
}

export async function getTransportSuggestions(
  input: SuggestAlternativeTransportInput
): Promise<SuggestAlternativeTransportOutput> {
  try {
    const result = await suggestAlternativeTransport(input);
    return result;
  } catch (error) {
    console.error("Error en getTransportSuggestions:", error);
    return {
      alternativeSuggestions:
        "Lo sentimos, no pudimos obtener sugerencias en este momento.",
    };
  }
}

async function logAudit(
  adminName: string,
  targetUserId: number | null,
  action: string,
  details: string
) {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("adminName", sql.NVarChar, adminName)
      .input("targetUserId", sql.Int, targetUserId)
      .input("action", sql.NVarChar, action)
      .input("details", sql.NVarChar, details)
      .query(
        "INSERT INTO AuditLogs (adminName, targetUserId, action, details) VALUES (@adminName, @targetUserId, @action, @details)"
      );
  } catch (error) {
    console.error("Error guardando log de auditoría:", error);
  }
}
// --- GESTIÓN DE USUARIOS ---

export async function getUsers(): Promise<User[]> {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query("SELECT * FROM Users ORDER BY id DESC");
    return result.recordset as User[];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

export async function getUserProfile(userId: number): Promise<User | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT * FROM Users WHERE id = @id");
    if (result.recordset.length > 0) return result.recordset[0] as User;
    return null;
  } catch {
    return null;
  }
}

export async function createUser(data: CreateUserInput): Promise<User | null> {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    const check = await pool
      .request()
      .input("ci_numero", sql.NVarChar, data.ci_numero)
      .query("SELECT id FROM Users WHERE ci_numero = @ci_numero");
    if (check.recordset.length > 0)
      throw new Error(`El CI ${data.ci_numero} ya existe.`);

    const fullName = `${data.nombres} ${data.paterno} ${data.materno}`.trim();
    const fullCi = `${data.ci_numero} ${data.ci_extension}`;
    const routeId = data.assignedRouteId
      ? parseInt(data.assignedRouteId)
      : null;

    const result = await pool
      .request()
      .input("nombres", sql.NVarChar, data.nombres)
      .input("paterno", sql.NVarChar, data.paterno)
      .input("materno", sql.NVarChar, data.materno)
      .input("ci_numero", sql.NVarChar, data.ci_numero)
      .input("ci_extension", sql.NVarChar, data.ci_extension)
      .input("phone", sql.NVarChar, data.phone)
      .input("name", sql.NVarChar, fullName)
      .input("ci", sql.NVarChar, fullCi)
      .input("routeId", sql.Int, routeId)
      .query(
        `INSERT INTO Users (nombres, paterno, materno, ci_numero, ci_extension, phone, name, ci, assignedRouteId, status, avatar, password) OUTPUT INSERTED.* VALUES (@nombres, @paterno, @materno, @ci_numero, @ci_extension, @phone, @name, @ci, @routeId, 'No Abonado', 'user-placeholder', '123456')`
      );

    const newUser = result.recordset[0] as User;
    await logAudit(
      "Admin",
      newUser.id,
      "CREAR",
      `Usuario creado: ${newUser.name}`
    );
    return newUser;
  } catch (error: any) {
    throw new Error(error.message || "Error en base de datos");
  }
}

export async function updateUser(user: User): Promise<User | null> {
  try {
    const pool = await getDbPool();
    const prev = await pool
      .request()
      .input("pid", sql.Int, user.id)
      .query("SELECT status FROM Users WHERE id=@pid");
    const prevStatus = prev.recordset[0]?.status;

    const result = await pool
      .request()
      .input("id", sql.Int, user.id)
      .input("name", sql.NVarChar, user.name)
      .input("ci", sql.NVarChar, user.ci)
      .input("phone", sql.NVarChar, user.phone)
      .input("status", sql.NVarChar, user.status)
      .input("routeId", sql.Int, user.assignedRouteId || null)
      .query(
        `UPDATE Users SET name=@name, ci=@ci, phone=@phone, status=@status, assignedRouteId=@routeId OUTPUT INSERTED.* WHERE id=@id`
      );

    if (result.recordset.length > 0) {
      const updatedUser = result.recordset[0] as User;
      if (prevStatus !== updatedUser.status)
        await logAudit(
          "Admin",
          user.id,
          "CAMBIO_ESTADO",
          `De ${prevStatus} a ${updatedUser.status}`
        );
      else await logAudit("Admin", user.id, "EDITAR", `Datos actualizados`);
      return updatedUser;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function deleteUser(userId: number): Promise<boolean> {
  const session = await requireAdmin(); // <--- 🔒 Guardamos la sesión para el log
  try {
    const pool = await getDbPool();
    // Usamos el nombre real del admin logueado en lugar de "Admin" genérico
    await logAudit(
      session.name,
      userId,
      "ELIMINAR",
      "Usuario eliminado permanentemente"
    );

    await pool
      .request()
      .input("id", sql.Int, userId)
      .query("DELETE FROM Users WHERE id = @id");
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserAuditLogs(userId: number): Promise<AuditLog[]> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("uid", sql.Int, userId)
      .query(
        "SELECT * FROM AuditLogs WHERE targetUserId = @uid ORDER BY timestamp DESC"
      );
    return result.recordset as AuditLog[];
  } catch {
    return [];
  }
}

export async function resetUserPassword(
  userId: number,
  pass: string
): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, userId)
      .input("p", sql.NVarChar, pass)
      .query("UPDATE Users SET password = @p WHERE id = @id");
    await logAudit(
      "Admin",
      userId,
      "PASSWORD_RESET",
      "Contraseña restablecida manualmente"
    );
    return true;
  } catch {
    return false;
  }
}

export async function getRoutePassengers(routeId: number): Promise<User[]> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("routeId", sql.Int, routeId)
      .query(
        "SELECT * FROM Users WHERE assignedRouteId = @routeId AND status = 'Abonado'"
      );
    return result.recordset as User[];
  } catch (error) {
    return [];
  }
}

// --- GESTIÓN DE VEHÍCULOS ---

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query("SELECT * FROM Vehicles ORDER BY id DESC");
    return result.recordset as Vehicle[];
  } catch (error) {
    return [];
  }
}

export async function createVehicle(data: any): Promise<Vehicle | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("plate", sql.NVarChar, data.plate)
      .input("brand", sql.NVarChar, data.brand)
      .input("model", sql.NVarChar, data.model)
      .input("capacity", sql.Int, data.capacity)
      .input("status", sql.NVarChar, data.status)
      .input("image", sql.NVarChar, data.image || "vehicle-placeholder")
      .query(
        `INSERT INTO Vehicles (plate, brand, model, capacity, status, image) OUTPUT INSERTED.* VALUES (@plate, @brand, @model, @capacity, @status, @image)`
      );
    return result.recordset[0] as Vehicle;
  } catch (error) {
    return null;
  }
}

export async function updateVehicle(vehicle: any): Promise<Vehicle | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("id", sql.Int, vehicle.id)
      .input("plate", sql.NVarChar, vehicle.plate)
      .input("brand", sql.NVarChar, vehicle.brand)
      .input("model", sql.NVarChar, vehicle.model)
      .input("capacity", sql.Int, vehicle.capacity)
      .input("status", sql.NVarChar, vehicle.status)
      .query(
        `UPDATE Vehicles SET plate=@plate, brand=@brand, model=@model, capacity=@capacity, status=@status OUTPUT INSERTED.* WHERE id=@id`
      );
    return result.recordset[0] as Vehicle;
  } catch (error) {
    return null;
  }
}

export async function deleteVehicle(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Vehicles WHERE id = @id");
    return true;
  } catch (error) {
    return false;
  }
}

// --- GESTIÓN DE CONDUCTORES ---

export async function getDrivers(): Promise<Driver[]> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query("SELECT * FROM Drivers ORDER BY id DESC");
    return result.recordset as Driver[];
  } catch (error) {
    return [];
  }
}

export async function createDriver(data: any): Promise<Driver | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("name", sql.NVarChar, data.name)
      .input("ci", sql.NVarChar, data.ci)
      .input("phone", sql.NVarChar, data.phone)
      .input("license", sql.NVarChar, data.license)
      .input("status", sql.NVarChar, data.status)
      .input("avatar", sql.NVarChar, data.avatar || "driver-placeholder")
      .query(
        `INSERT INTO Drivers (name, ci, phone, license, status, avatar, password) OUTPUT INSERTED.* VALUES (@name, @ci, @phone, @license, @status, @avatar, '123456')`
      );
    return result.recordset[0] as Driver;
  } catch (error) {
    return null;
  }
}

export async function updateDriver(driver: any): Promise<Driver | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("id", sql.Int, driver.id)
      .input("name", sql.NVarChar, driver.name)
      .input("ci", sql.NVarChar, driver.ci)
      .input("phone", sql.NVarChar, driver.phone)
      .input("license", sql.NVarChar, driver.license)
      .input("status", sql.NVarChar, driver.status)
      .query(
        `UPDATE Drivers SET name=@name, ci=@ci, phone=@phone, license=@license, status=@status OUTPUT INSERTED.* WHERE id=@id`
      );
    return result.recordset[0] as Driver;
  } catch (error) {
    return null;
  }
}

export async function deleteDriver(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Drivers WHERE id = @id");
    return true;
  } catch (error) {
    return false;
  }
}

export async function resetDriverPassword(
  id: number,
  p: string
): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("p", sql.NVarChar, p)
      .query("UPDATE Drivers SET password = @p WHERE id = @id");
    return true;
  } catch {
    return false;
  }
}

export async function changeDriverPassword(
  driverId: number,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  try {
    const pool = await getDbPool();
    const check = await pool
      .request()
      .input("id", sql.Int, driverId)
      .query("SELECT password FROM Drivers WHERE id = @id");
    if (check.recordset.length === 0)
      return { success: false, message: "Conductor no encontrado." };
    if (check.recordset[0].password !== currentPass)
      return { success: false, message: "Contraseña incorrecta." };

    await pool
      .request()
      .input("id", sql.Int, driverId)
      .input("p", sql.NVarChar, newPass)
      .query("UPDATE Drivers SET password = @p WHERE id = @id");
    return { success: true, message: "Contraseña actualizada." };
  } catch (error) {
    return { success: false, message: "Error servidor." };
  }
}

// --- GESTIÓN DE RUTAS ---

const RouteSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  // IMPORTANTE: Agregamos 'Regular' porque la base de datos ahora usa ese valor
  Categoria: z.enum(["Abonados", "Mixto", "Regular"]), 
  driverId: z.number().nullable().optional(), 
  vehicleId: z.number().nullable().optional(),
  status: z.enum(["Publicada", "En borrador", "Inactiva"]),
  schedule: z.string().min(1, "Horario requerido"),
  stops: z.number().min(1, "Debe tener al menos 1 parada"),
  waypoints: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
});

export async function getRoutes(): Promise<Route[]> {
  try {
    const pool = await getDbPool();
    // La consulta SQL traerá automáticamente la columna 'Categoria' si existe en la BD
    const result = await pool.request().query("SELECT * FROM Routes ORDER BY id DESC");
    
    return result.recordset.map((r: any) => ({
      ...r,
      waypoints: r.waypoints ? JSON.parse(r.waypoints) : []
    })) as Route[];
  } catch (error) {
    console.error("Error obteniendo rutas:", error);
    return [];
  }
}

export async function createRoute(rawData: unknown): Promise<Route | null> {
  await requireAdmin();
  try {
    const data = RouteSchema.parse(rawData);
    const pool = await getDbPool();
    const waypointsJson = data.waypoints ? JSON.stringify(data.waypoints) : '[]';

    // CORRECCIÓN: Usamos @cat y la columna Categoria
    const result = await pool.request()
      .input("name", sql.NVarChar, data.name)
      .input("cat", sql.NVarChar, data.Categoria) 
      .input("driverId", sql.Int, data.driverId || null)
      .input("vehicleId", sql.Int, data.vehicleId || null)
      .input("status", sql.NVarChar, data.status)
      .input("schedule", sql.NVarChar, data.schedule)
      .input("stops", sql.Int, data.stops)
      .input("waypoints", sql.NVarChar, waypointsJson)
      .query(`
        INSERT INTO Routes (name, Categoria, driverId, vehicleId, status, schedule, stops, waypoints) 
        OUTPUT INSERTED.* VALUES (@name, @cat, @driverId, @vehicleId, @status, @schedule, @stops, @waypoints)
      `);

    if (result.recordset.length > 0) {
        const newRoute = result.recordset[0];
        return { ...newRoute, waypoints: JSON.parse(newRoute.waypoints || '[]') };
    }
    return null;
  } catch (error) {
    console.error("Error creando ruta:", error);
    return null;
  }
}

export async function updateRoute(rawData: unknown): Promise<Route | null> {
  await requireAdmin();
  try {
    const UpdateRouteSchema = RouteSchema.extend({ id: z.number() });
    const data = UpdateRouteSchema.parse(rawData);
    const pool = await getDbPool();
    const waypointsJson = data.waypoints ? JSON.stringify(data.waypoints) : '[]';

    // CORRECCIÓN: UPDATE apuntando a la columna Categoria
    const result = await pool.request()
      .input("id", sql.Int, data.id)
      .input("name", sql.NVarChar, data.name)
      .input("cat", sql.NVarChar, data.Categoria) 
      .input("driverId", sql.Int, data.driverId || null)
      .input("vehicleId", sql.Int, data.vehicleId || null)
      .input("status", sql.NVarChar, data.status)
      .input("schedule", sql.NVarChar, data.schedule)
      .input("stops", sql.Int, data.stops)
      .input("waypoints", sql.NVarChar, waypointsJson)
      .query(`
        UPDATE Routes 
        SET name=@name, Categoria=@cat, driverId=@driverId, vehicleId=@vehicleId, status=@status, schedule=@schedule, stops=@stops, waypoints=@waypoints
        OUTPUT INSERTED.* WHERE id=@id
      `);

    if (result.recordset.length > 0) {
        const updated = result.recordset[0];
        return { ...updated, waypoints: JSON.parse(updated.waypoints || '[]') };
    }
    return null;
  } catch (error) {
    console.error("Error actualizando ruta:", error);
    return null;
  }
}

export async function deleteRoute(id: number): Promise<boolean> {
  try {
    await requireAdmin();
    const pool = await getDbPool();
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Routes WHERE id = @id");
    return true;
  } catch {
    return false;
  }
}

// --- VIAJES Y MONITOREO ---

export async function getActiveTrips(): Promise<Trip[]> {
  try {
    const pool = await getDbPool();
    return (
      await pool
        .request()
        .query("SELECT * FROM Trips WHERE status = 'En curso'")
    ).recordset as Trip[];
  } catch {
    return [];
  }
}

export async function startTrip(data: any): Promise<Trip | null> {
  try {
    const pool = await getDbPool();
    const startTime = new Date();
    const result = await pool
      .request()
      .input("rid", sql.Int, data.routeId)
      .input("did", sql.Int, data.driverId)
      .input("vid", sql.Int, data.vehicleId)
      .input("start", sql.DateTime2, startTime)
      .input("lat", sql.Decimal(9, 6), data.startLat)
      .input("lng", sql.Decimal(9, 6), data.startLng)
      .query(
        `INSERT INTO Trips (routeId, driverId, vehicleId, startTime, status, passengersAbonado, passengersNoAbonado, locationLat, locationLng) OUTPUT INSERTED.* VALUES (@rid, @did, @vid, @start, 'En curso', 0, 0, @lat, @lng)`
      );
    return result.recordset[0] as Trip;
  } catch {
    return null;
  }
}

export async function endTrip(id: number): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("end", sql.DateTime2, new Date())
      .query(
        "UPDATE Trips SET status = 'Finalizado', endTime = @end WHERE id = @id"
      );
    return true;
  } catch {
    return false;
  }
}

export async function updateTripLocation(
  id: number,
  lat: number,
  lng: number
): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("lat", sql.Decimal(9, 6), lat)
      .input("lng", sql.Decimal(9, 6), lng)
      .query(
        "UPDATE Trips SET locationLat = @lat, locationLng = @lng WHERE id = @id"
      );
    return true;
  } catch {
    return false;
  }
}

export async function getDriverActiveTrip(
  driverId: number
): Promise<Trip | null> {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input("did", sql.Int, driverId)
      .query(
        "SELECT * FROM Trips WHERE driverId = @did AND status = 'En curso'"
      );
    if (result.recordset.length > 0) return result.recordset[0] as Trip;
    return null;
  } catch {
    return null;
  }
}

export async function simulateVehicleMovement(): Promise<void> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .query(
        `UPDATE Trips SET locationLat = locationLat + 0.0001, locationLng = locationLng + (0.0001 * CASE WHEN id % 2 = 0 THEN 1 ELSE -1 END) WHERE status = 'En curso'`
      );
  } catch {}
}

// --- REPORTES ---

export async function getSystemStats(): Promise<DashboardStats> {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    const u = (
      await pool
        .request()
        .query(
          `SELECT COUNT(*) as t, SUM(CASE WHEN status='Abonado' THEN 1 ELSE 0 END) as a, SUM(CASE WHEN status='No Abonado' THEN 1 ELSE 0 END) as n FROM Users`
        )
    ).recordset[0];
    const v = (
      await pool
        .request()
        .query(
          `SELECT SUM(CASE WHEN status='Activo' THEN 1 ELSE 0 END) as a, SUM(CASE WHEN status='En mantenimiento' THEN 1 ELSE 0 END) as m FROM Vehicles`
        )
    ).recordset[0];
    const t = (await pool.request().query("SELECT COUNT(*) as t FROM Trips"))
      .recordset[0];
    const top = (
      await pool
        .request()
        .query(
          "SELECT TOP 5 d.name, COUNT(t.id) as trips FROM Trips t JOIN Drivers d ON t.driverId=d.id GROUP BY d.name ORDER BY trips DESC"
        )
    ).recordset;

    return {
      totalUsers: u.t || 0,
      abonados: u.a || 0,
      noAbonados: u.n || 0,
      activeVehicles: v.a || 0,
      maintenanceVehicles: v.m || 0,
      totalTrips: t.t || 0,
      tripsByDriver: top as { name: string; trips: number }[],
    };
  } catch {
    return {
      totalUsers: 0,
      abonados: 0,
      noAbonados: 0,
      activeVehicles: 0,
      maintenanceVehicles: 0,
      totalTrips: 0,
      tripsByDriver: [],
    };
  }
}

// --- SOPORTE Y AJUSTES ESTUDIANTE ---

export async function changeStudentPassword(
  userId: number,
  currentPass: string,
  newPass: string
): Promise<{ success: boolean; message: string }> {
  try {
    const pool = await getDbPool();
    const check = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT password FROM Users WHERE id = @id");
    if (check.recordset.length === 0)
      return { success: false, message: "Usuario no encontrado." };
    if (check.recordset[0].password !== currentPass)
      return { success: false, message: "Contraseña incorrecta." };

    await pool
      .request()
      .input("id", sql.Int, userId)
      .input("p", sql.NVarChar, newPass)
      .query("UPDATE Users SET password = @p WHERE id = @id");
    await logAudit(
      "Estudiante",
      userId,
      "CHANGE_PASSWORD",
      "Cambio de contraseña propio"
    );
    return { success: true, message: "Contraseña actualizada." };
  } catch (error) {
    return { success: false, message: "Error servidor." };
  }
}

export async function reportLostItem(
  userId: number,
  description: string,
  route: string
): Promise<boolean> {
  try {
    const pool = await getDbPool();
    await pool
      .request()
      .input("uid", sql.Int, userId)
      .input("d", sql.NVarChar, description)
      .input("r", sql.NVarChar, route)
      .query(
        "INSERT INTO LostAndFound (userId, description, route) VALUES (@uid, @d, @r)"
      );
    return true;
  } catch {
    return false;
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function getCurrentUser() {
  const session = await getSession();
  // Si no hay sesión, retornamos null
  if (!session) return null;

  // Retornamos los datos básicos de la sesión (id, nombre, rol)
  return {
    id: session.id,
    name: session.name,
    role: session.role,
  };
}
