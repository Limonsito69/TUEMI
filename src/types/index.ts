export type User = {
  id: number;
  name: string;
  ci: string;
  phone: string;
  status: 'Abonado' | 'No Abonado';
  avatar: string;
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
  type: 'Abonados' | 'Mixto';
  driverId: number; 
  vehicleId: number; 
  status: 'Publicada' | 'En borrador' | 'Inactiva';
  schedule: string;
  stops: number;
};

export type Alert = {
  id: string;
  vehiclePlate: string;
  type: 'GPS sin señal' | 'Detenido demasiado tiempo' | 'Sobrecupo' | 'Desvío de ruta';
  timestamp: string;
  details: string;
};

export type Trip = {
  id: number; // <-- number
  routeId: number;
  driverId: number;
  vehicleId: number;
  startTime: Date; // <-- Date en lugar de string
  endTime: Date | null;
  // Aplanamos los pasajeros para coincidir con SQL
  passengersAbonado: number;
  passengersNoAbonado: number;
  status: 'En curso' | 'Finalizado' | 'Pendiente';
  // Aplanamos la ubicación
  locationLat: number | null;
  locationLng: number | null;
};
