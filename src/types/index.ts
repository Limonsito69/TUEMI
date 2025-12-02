export type User = {
  id: number;
  name: string;
  ci: string;
  phone: string;
  status: 'Activo' | 'Inactivo';
  avatar: string;
  email?: string;
  
  // --- AGREGAR ESTA LÍNEA QUE FALTA: ---
  assignedRouteId?: number | null; 
  // ------------------------------------
  
  codigo_SAGA?: string;
  nombres?: string;
  paterno?: string;
  materno?: string;
  ci_numero?: string;
  ci_extension?: string;
};

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
  // 'Categoria' eliminada o simplificada si solo hay un tipo de servicio
  status: 'Publicada' | 'En borrador' | 'Inactiva';
  schedule: string;
  stops: number; // Cantidad de paradas
  waypoints?: any[]; // Guardará la lista de paradas (JSON)
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
  PasajerosRegistrados: number; // Estudiantes con App (QR)
  PasajerosInvitados: number;   // Otros (Manual)
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
  adminName: string;
  action: string;
  details: string;
  timestamp: Date;
};

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number; // Reemplaza a abonados
  activeVehicles: number;
  maintenanceVehicles: number;
  totalTrips: number;
  tripsByDriver: { name: string; trips: number }[];
};