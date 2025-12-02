"use server";
import { z } from "zod";
import { getDbPool } from "@/lib/db";
import {
  User,
  Vehicle,
  Driver,
  Route,
  Trip,
  DashboardStats,
  AuditLog,
} from "@/types";
import sql from "mssql";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  detectRouteIncident,
  DetectRouteIncidentInput,
} from "@/ai/flows/route-incident-detection";
import {
  suggestAlternativeTransport,
  SuggestAlternativeTransportInput,
} from "@/ai/flows/transportation-disruption-suggestions";
import { revalidatePath, unstable_noStore } from "next/cache";

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

// --- AUTENTICACIÓN (CORREGIDA) ---

// En src/lib/actions.ts

// --- HELPERS DE SEGURIDAD ---

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Acceso Denegado");
  }
  return session; // 👈 ¡ESTA LÍNEA FALTABA!
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
    // Admin Hardcodeado (para emergencias)
    if (
      ci === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      await createSession(0, "Administrador", "admin");
      return { success: true, role: "admin" };
    }

    const pool = await getDbPool();

    // 1. Buscar Conductor
    const driverRes = await pool
      .request()
      .input("ci", sql.NVarChar, ci)
      .query("SELECT * FROM Drivers WHERE ci = @ci");

    if (driverRes.recordset.length > 0) {
      const driver = driverRes.recordset[0];
      if (driver.password !== password)
        return { success: false, message: "Contraseña incorrecta" };
      if (driver.status !== "Activo")
        return { success: false, message: "Cuenta inactiva" };

      await createSession(driver.id, driver.name, "driver");
      return { success: true, role: "driver" };
    }

    // 2. Buscar Estudiante (Usuario)
    const userRes = await pool
      .request()
      .input("ci", sql.NVarChar, ci)
      .query("SELECT * FROM Users WHERE ci = @ci");

    if (userRes.recordset.length > 0) {
      const user = userRes.recordset[0];
      if (user.password !== password)
        return { success: false, message: "Contraseña incorrecta" };
      if (user.status !== "Activo")
        return { success: false, message: "Cuenta inactiva" };

      await createSession(user.id, user.name, "student");
      return { success: true, role: "student" };
    }

    return { success: false, message: "Usuario no encontrado" };
  } catch (e) {
    console.error("Auth Error:", e);
    return { success: false, message: "Error del servidor" };
  }
}

// --- RESTO DE FUNCIONES (REGISTRO, IA, CRUDS...) ---

export async function registerStudent(data: any) {
  try {
    const pool = await getDbPool();
    const check = await pool
      .request()
      .input("ci", sql.NVarChar, data.ci_numero)
      .query("SELECT id FROM Users WHERE ci LIKE @ci + '%'");
    if (check.recordset.length > 0)
      return { success: false, message: "CI ya registrado" };

    const fullName = `${data.nombres} ${data.paterno} ${
      data.materno || ""
    }`.trim();
    const fullCi = `${data.ci_numero} ${data.ci_extension}`;

    const res = await pool
      .request()
      .input("n", data.nombres)
      .input("p", data.paterno)
      .input("m", data.materno)
      .input("ce", data.ci_extension)
      .input("ph", data.phone)
      .input("em", data.email)
      .input("pass", data.password)
      .input("ci", fullCi)
      .input("name", fullName).query(`
        INSERT INTO Users (nombres, paterno, materno, ci_extension, phone, email, password, ci, name, status, avatar) 
        OUTPUT INSERTED.* VALUES (@n, @p, @m, @ce, @ph, @em, @pass, @ci, @name, 'Activo', 'user-placeholder')
      `);

    revalidatePath("/admin/users"); // Actualizar lista de usuarios
    return { success: true, user: res.recordset[0] };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al registrar" };
  }
}

// --- IA & UTILIDADES ---

export async function runIncidentDetection(input: DetectRouteIncidentInput) {
    return detectRouteIncident(input);
}

export async function getTransportSuggestions(input: SuggestAlternativeTransportInput) {
    return suggestAlternativeTransport(input);
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
  unstable_noStore(); // No cachear perfil
  try {
    const pool = await getDbPool();
    const res = await pool
      .request()
      .input("id", userId)
      .query("SELECT * FROM Users WHERE id = @id");
    return res.recordset[0] as User;
  } catch {
    return null;
  }
}
export async function createUser(data: CreateUserInput): Promise<User | null> {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    // Ajuste: usar 'ci' en lugar de 'ci_numero' para unicidad en nueva estructura
    const fullCi = `${data.ci_numero} ${data.ci_extension}`.trim();

    const check = await pool
      .request()
      .input("ci", sql.NVarChar, fullCi)
      .query("SELECT id FROM Users WHERE ci = @ci");
    if (check.recordset.length > 0)
      throw new Error(`El CI ${fullCi} ya existe.`);

    const result = await pool
      .request()
      .input("nombres", sql.NVarChar, data.nombres)
      .input("paterno", sql.NVarChar, data.paterno)
      .input("materno", sql.NVarChar, data.materno)
      .input("ci_extension", sql.NVarChar, data.ci_extension)
      .input("phone", sql.NVarChar, data.phone)
      .input("ci", sql.NVarChar, fullCi)
      .query(
        `INSERT INTO Users (nombres, paterno, materno, ci_extension, phone, ci, status, avatar, password) OUTPUT INSERTED.* VALUES (@nombres, @paterno, @materno, @ci_extension, @phone, @ci, 'No Abonado', 'user-placeholder', '123456')`
      );

    const newUser = result.recordset[0] as User;
    await logAudit(
      "Admin",
      newUser.id,
      "CREAR",
      `Usuario creado: ${newUser.nombres}`
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
      // Ojo: en la nueva BD es 'nombres' y 'paterno', no 'name'. Ajusta si el frontend envía 'name'
      .input("phone", sql.NVarChar, user.phone)
      .input("status", sql.NVarChar, user.status)
      .query(
        `UPDATE Users SET phone=@phone, status=@status OUTPUT INSERTED.* WHERE id=@id`
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
  const session = await requireAdmin();
  try {
    const pool = await getDbPool();
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
    // JOIN para traer Marca y Modelo ya que ahora están normalizados
    const result = await pool.request().query(`
      SELECT v.id, v.plate, v.capacity, v.status, v.image, m.Nombre as brand, mo.Nombre as model
      FROM Vehicles v
      JOIN Flota.Modelos mo ON v.ModeloId = mo.Id
      JOIN Flota.Marcas m ON mo.MarcaId = m.Id
      ORDER BY v.id DESC
    `);
    return result.recordset as Vehicle[];
  } catch (error) {
    return [];
  }
}

export async function createVehicle(data: any): Promise<Vehicle | null> {
  try {
    const pool = await getDbPool();
    // NOTA: Aquí deberías buscar los IDs de Marca/Modelo. Por simplicidad, hardcodeamos o asumimos que vienen.
    // En un sistema real, usarías selects dependientes en el frontend.
    // Asumimos IDs fijos para ejemplo rápido tras normalización:
    const result = await pool
      .request()
      .input("plate", sql.NVarChar, data.plate)
      .input("capacity", sql.Int, data.capacity)
      .input("status", sql.NVarChar, data.status)
      .input("image", sql.NVarChar, data.image || "vehicle-placeholder")
      // Valores por defecto para cumplir FKs (Ajustar según tu tabla real)
      .query(
        `INSERT INTO Vehicles (plate, capacity, status, image, ModeloId, TipoVehiculoId) OUTPUT INSERTED.* VALUES (@plate, @capacity, @status, @image, 1, 1)`
      );
    return result.recordset[0] as Vehicle;
  } catch (error) {
    console.error(error);
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
      .input("capacity", sql.Int, vehicle.capacity)
      .input("status", sql.NVarChar, vehicle.status)
      .query(
        `UPDATE Vehicles SET plate=@plate, capacity=@capacity, status=@status OUTPUT INSERTED.* WHERE id=@id`
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
  Categoria: z.enum(["Abonados", "Mixto", "Regular"]),
  status: z.enum(["Publicada", "En borrador", "Inactiva"]),
  schedule: z.string().min(1, "Horario requerido"),
  stops: z.number().min(1, "Debe tener al menos 1 parada"),
  waypoints: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
});

export async function getRoutes(): Promise<Route[]> {
  unstable_noStore();
  try {
    const pool = await getDbPool();
    // Traemos todas, no solo las publicadas, para que el admin las vea
    const res = await pool
      .request()
      .query("SELECT * FROM Routes ORDER BY id DESC");
    return res.recordset.map((r: any) => ({
      ...r,
      waypoints: r.waypoints ? JSON.parse(r.waypoints) : [],
    }));
  } catch {
    return [];
  }
}

export async function createRoute(data: any) {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    const waypointsJson = JSON.stringify(data.waypoints || []);

    await pool
      .request()
      .input("name", sql.NVarChar, data.name)
      .input("cat", sql.NVarChar, data.Categoria || "Regular")
      .input("status", sql.NVarChar, data.status)
      .input("schedule", sql.NVarChar, data.schedule)
      .input("stops", sql.Int, data.stops)
      .input("waypoints", sql.NVarChar, waypointsJson).query(`
        INSERT INTO Routes (name, Categoria, status, schedule, stops, waypoints) 
        VALUES (@name, @cat, @status, @schedule, @stops, @waypoints)
      `);

    revalidatePath("/admin/routes"); // Actualizar lista de rutas
    return true;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function updateRoute(rawData: unknown): Promise<Route | null> {
  await requireAdmin();
  try {
    const UpdateRouteSchema = RouteSchema.extend({ id: z.number() });
    const data = UpdateRouteSchema.parse(rawData);
    const pool = await getDbPool();
    const waypointsJson = data.waypoints
      ? JSON.stringify(data.waypoints)
      : "[]";

    // CORREGIDO: Eliminados driverId y vehicleId
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.NVarChar, data.name)
      .input("cat", sql.NVarChar, data.Categoria)
      .input("status", sql.NVarChar, data.status)
      .input("schedule", sql.NVarChar, data.schedule)
      .input("stops", sql.Int, data.stops)
      .input("waypoints", sql.NVarChar, waypointsJson).query(`
        UPDATE Routes 
        SET name=@name, Categoria=@cat, status=@status, schedule=@schedule, stops=@stops, waypoints=@waypoints
        OUTPUT INSERTED.* WHERE id=@id
      `);

    if (result.recordset.length > 0) {
      const updated = result.recordset[0];
      return {
        ...updated,
        waypoints: JSON.parse(updated.waypoints || "[]"),
        driverId: null,
        vehicleId: null,
      };
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
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Routes WHERE id = @id");
    return true;
  } catch {
    return false;
  }
}

// --- VIAJES Y MONITOREO ---

export async function getActiveTrips(): Promise<Trip[]> {
  unstable_noStore(); // Datos en tiempo real no deben cachearse
  try {
    const pool = await getDbPool();
    const res = await pool
      .request()
      .query("SELECT * FROM Trips WHERE status = 'En curso'");
    return res.recordset as Trip[];
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
        `INSERT INTO Trips (routeId, driverId, vehicleId, startTime, status, PasajerosRegistrados, PasajerosInvitados, locationLat, locationLng) OUTPUT INSERTED.* VALUES (@rid, @did, @vid, @start, 'En curso', 0, 0, @lat, @lng)`
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
  unstable_noStore();
  try {
    const pool = await getDbPool();

    const users = await pool
      .request()
      .query(
        `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Activo' THEN 1 ELSE 0 END) as active FROM Users`
      );
    const vehicles = await pool
      .request()
      .query(
        `SELECT SUM(CASE WHEN status = 'Activo' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'En mantenimiento' THEN 1 ELSE 0 END) as maint FROM Vehicles`
      );
    const trips = await pool.request().query("SELECT COUNT(*) as t FROM Trips");
    const topDrivers = await pool
      .request()
      .query(
        `SELECT TOP 5 d.name, COUNT(t.id) as trips FROM Trips t JOIN Drivers d ON t.driverId = d.id GROUP BY d.name ORDER BY trips DESC`
      );

    return {
      totalUsers: users.recordset[0]?.total || 0,
      activeUsers: users.recordset[0]?.active || 0,
      activeVehicles: vehicles.recordset[0]?.active || 0,
      maintenanceVehicles: vehicles.recordset[0]?.maint || 0,
      totalTrips: trips.recordset[0]?.t || 0,
      tripsByDriver: topDrivers.recordset || [],
    };
  } catch {
    return {
      totalUsers: 0,
      activeUsers: 0,
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

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return { id: session.id, name: session.name, role: session.role };
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

// --- GESTIÓN DE PARADAS (NUEVO) ---

export async function getStops() {
  unstable_noStore(); // <--- OBLIGATORIO: Evita que guarde datos viejos en caché
  try {
    const pool = await getDbPool();
    
    // TRUCO CLAVE: Usamos CAST para convertir Decimal a Float
    // Si no haces esto, el mapa recibe "basura" en vez de coordenadas
    const result = await pool.request().query(`
      SELECT 
        Id as id, 
        Nombre as name, 
        CAST(Latitud as float) as lat, 
        CAST(Longitud as float) as lng 
      FROM Operaciones.Paradas 
      ORDER BY Id DESC
    `);
    
    console.log("✅ Paradas leídas de BD:", result.recordset.length); 
    return result.recordset;
  } catch (error) {
    console.error("❌ Error obteniendo paradas:", error);
    return [];
  }
}

export async function createStop(data: { name: string; lat: number; lng: number }) {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    
    // Usamos sql.Float para coincidir con la nueva tabla
    const result = await pool.request()
      .input("name", sql.NVarChar, data.name)
      .input("lat", sql.Float, data.lat) // <--- IMPORTANTE: sql.Float
      .input("lng", sql.Float, data.lng) // <--- IMPORTANTE: sql.Float
      .query("INSERT INTO Operaciones.Paradas (Nombre, Latitud, Longitud, EsPrincipal) OUTPUT INSERTED.Id as id, INSERTED.Nombre as name, INSERTED.Latitud as lat, INSERTED.Longitud as lng VALUES (@name, @lat, @lng, 1)");
    
    // Actualizar caché
    revalidatePath('/admin/stops');
    revalidatePath('/admin/routes');
    
    if (result.recordset.length > 0) {
        console.log("✅ Parada creada:", result.recordset[0]);
        return result.recordset[0];
    } else {
        console.error("❌ La base de datos no devolvió el registro insertado.");
        return null;
    }
  } catch (error) {
    // Si falla, verás el error exacto en tu terminal de VS Code
    console.error("❌ ERROR CRÍTICO AL CREAR PARADA:", error);
    return null;
  }
}

export async function deleteStop(id: number) {
  await requireAdmin();
  try {
    const pool = await getDbPool();
    await pool.request().input("id", sql.Int, id).query("DELETE FROM Operaciones.Paradas WHERE Id = @id");
    
    revalidatePath('/admin/stops');
    revalidatePath('/admin/routes');
    
    return true;
  } catch (error) {
    return false;
  }
}
