export type User = {
  id: number;
  name: string;
  ci: string;
  phone: string;
  status: 'Abonado' | 'No Abonado' | 'Activo' | 'Inactivo'; // Actualizado para soportar ambos
  avatar: string;
  email?: string;
  assignedRouteId?: number | null;
  codigo_SAGA?: string; 
  nombres?: string;
  paterno?: string;
  materno?: string;
  ci_numero?: string;
  ci_extension?: string;
}

export type Driver = {
  id: number;
  name: string;
  ci: string;
  phone: string;
  license: string;
  status: 'Activo' | 'Inactivo';
  avatar: string;
};

export type Vehicle = {
  id: number;
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  status: 'Activo' | 'En mantenimiento';
  image: string;
};

export type Route = {
  id: number;
  name: string;
  Categoria: string; // ANTES ERA: type
  driverId: number;
  vehicleId: number;
  status: 'Publicada' | 'En borrador' | 'Inactiva';
  schedule: string;
  stops: number;
  waypoints?: { lat: number; lng: number }[]; 
};

export type Alert = {
  id: string;
  vehiclePlate: string;
  type: 'GPS sin señal' | 'Detenido demasiado tiempo' | 'Sobrecupo' | 'Desvío de ruta';
  timestamp: string;
  details: string;
};

export type Trip = {
  id: number;
  routeId: number;
  driverId: number;
  vehicleId: number;
  startTime: Date;
  endTime: Date | null;
  status: 'En curso' | 'Finalizado' | 'Pendiente';
  // CAMBIO IMPORTANTE: Actualizamos a los nombres de la BD
  PasajerosRegistrados: number; // Antes passengersAbonado
  PasajerosInvitados: number;   // Antes passengersNoAbonado
  locationLat: number | null;
  locationLng: number | null;
};

export type LoginResult = {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    role: 'admin' | 'student' | 'driver';
    [key: string]: any; 
  };
};

export type CreateUserInput = {
  // --- AGREGAMOS ESTO TAMBIÉN ---
  codigo_SAGA: string; 
  // -----------------------------
  nombres: string;
  paterno: string;
  materno?: string; 
  ci_numero: string;
  ci_extension: string;
  phone: string;
  password?: string; 
};

export type AuditLog = {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  details: string;
  timestamp: Date;
  adminId?: number; 
  adminName?: string; 
};

export type DashboardStats = {
  totalUsers: number;
  abonados: number;
  totalTrips: number;
};