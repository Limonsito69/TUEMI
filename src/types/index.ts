export type User = {
  id: string;
  name: string;
  ci: string;
  phone: string;
  status: 'Abonado' | 'No Abonado';
  avatar: string;
};

export type Driver = {
  id: string;
  name: string;
  ci: string;
  phone: string;
  license: string;
  status: 'Activo' | 'Inactivo';
  avatar: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  capacity: number;
  status: 'Activo' | 'En mantenimiento';
  image: string;
};

export type Route = {
  id: string;
  name: string;
  type: 'Abonados' | 'Mixto';
  driverId: string;
  vehicleId: string;
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
  id: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  startTime: string;
  endTime: string | null;
  passengers: {
    abonado: number;
    noAbonado: number;
  };
  status: 'En curso' | 'Finalizado' | 'Pendiente';
  location: {
    lat: number;
    lng: number;
  }
};
