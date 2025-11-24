export type User = {
  id: number;
  name: string;
  ci: string;
  phone: string;
  status: 'Abonado' | 'No Abonado';
  avatar: string;
  email?: string;
  assignedRouteId?: number | null;
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
  type: 'Abonados' | 'Mixto';
  driverId: number;
  vehicleId: number;
  status: 'Publicada' | 'En borrador' | 'Inactiva';
  schedule: string;
  stops: number;
  waypoints?: { lat: number; lng: number; name: string }[]; // Nuevo campo opcional
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
  // Columnas planas (como vienen de SQL)
  passengersAbonado: number;
  passengersNoAbonado: number;
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
    [key: string]: any; // Para permitir otros datos del usuario
  };
};

export type CreateUserInput = {
  nombres: string;
  paterno: string;
  materno?: string; // Opcional
  ci_numero: string;
  ci_extension: string;
  phone: string;
  password?: string; // Para el registro público, podrían setear su clave
};

export type AuditLog = {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  details: string;
  timestamp: Date;
  adminId?: number; // Puede ser null si el propio usuario hace la acción
  adminName?: string; // Nombre del admin o "Usuario"
};

export type DashboardStats = {
  totalUsers: number;
  abonados: number;
  totalTrips: number;
};
