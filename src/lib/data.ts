import { User, Vehicle, Driver, Route, Alert, Trip } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Ana Pérez', ci: '1234567 LP', phone: '+591 71234567', status: 'Abonado', avatar: 'user1' },
  { id: '2', name: 'Luis Gutiérrez', ci: '2345678 CB', phone: '+591 72345678', status: 'No Abonado', avatar: 'user2' },
  { id: '3', name: 'María López', ci: '3456789 SC', phone: '+591 73456789', status: 'Abonado', avatar: 'user3' },
  { id: '4', name: 'Carlos Rojas', ci: '4567890 OR', phone: '+591 74567890', status: 'No Abonado', avatar: 'user4' },
  { id: '5', name: 'Sofía Fernandez', ci: '5678901 PT', phone: '+591 75678901', status: 'Abonado', avatar: 'user5' },
];

export const mockVehicles: Vehicle[] = [
  { id: '1', plate: '1234-TUB', brand: 'Toyota', model: 'Hiace', capacity: 18, status: 'Activo', image: 'vehicle1' },
  { id: '2', plate: '5678-EMI', brand: 'Nissan', model: 'Urvan', capacity: 15, status: 'En mantenimiento', image: 'vehicle2' },
  { id: '3', plate: '2345-CDE', brand: 'Mercedes-Benz', model: 'Sprinter', capacity: 20, status: 'Activo', image: 'vehicle3' },
  { id: '4', plate: '9876-FGH', brand: 'Ford', model: 'Transit', capacity: 16, status: 'Activo', image: 'vehicle4' },
];

export const mockDrivers: Driver[] = [
  { id: '1', name: 'Juan López', ci: '6543210 LP', phone: '+591 61234567', license: 'Cat C', status: 'Activo', avatar: 'driver1' },
  { id: '2', name: 'Carlos Fernández', ci: '7654321 CB', phone: '+591 62345678', license: 'Cat C', status: 'Inactivo', avatar: 'driver2' },
  { id: '3', name: 'Pedro Ramirez', ci: '8765432 SC', phone: '+591 63456789', license: 'Cat C', status: 'Activo', avatar: 'driver3' },
];

export const mockRoutes: Route[] = [
  { id: '1', name: 'Ruta Irpavi – EMI', type: 'Mixto', driverId: '1', vehicleId: '1', status: 'Publicada', schedule: '07:30 AM', stops: 12 },
  { id: '2', name: 'Ruta Centro – EMI', type: 'Abonados', driverId: '3', vehicleId: '3', status: 'Publicada', schedule: '08:00 AM', stops: 8 },
  { id: '3', name: 'Ruta Sopocachi – EMI', type: 'Mixto', driverId: '1', vehicleId: '4', status: 'En borrador', schedule: '18:00 PM', stops: 15 },
  { id: '4', name: 'Ruta Calacoto – EMI', type: 'Abonados', driverId: '3', vehicleId: '1', status: 'Inactiva', schedule: '18:30 PM', stops: 10 },
];

export const mockAlerts: Alert[] = [
  { id: '1', vehiclePlate: '5678-EMI', type: 'Detenido demasiado tiempo', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), details: 'Posible incidente: bus detenido 12 minutos fuera de parada.' },
  { id: '2', vehiclePlate: '1234-TUB', type: 'Sobrecupo', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), details: 'Alerta: 19 pasajeros con solo 18 asientos disponibles.' },
  { id a: '3', vehiclePlate: '9876-FGH', type: 'GPS sin señal', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), details: 'No hay actualización de GPS por más de 5 minutos.' },
];

export const mockTrips: Trip[] = [
    { 
      id: 'trip1', 
      routeId: '1', 
      driverId: '1', 
      vehicleId: '1', 
      startTime: new Date(Date.now() - 45 * 60000).toISOString(), 
      endTime: null, 
      passengers: { abonado: 10, noAbonado: 3 }, 
      status: 'En curso',
      location: { lat: -16.523, lng: -68.08 }
    },
    { 
      id: 'trip2', 
      routeId: '2', 
      driverId: '3', 
      vehicleId: '3', 
      startTime: new Date(Date.now() - 35 * 60000).toISOString(), 
      endTime: null, 
      passengers: { abonado: 8, noAbonado: 0 }, 
      status: 'En curso',
      location: { lat: -16.515, lng: -68.10 }
    },
     { 
      id: 'trip3', 
      routeId: '3', 
      driverId: '1', 
      vehicleId: '4', 
      startTime: new Date().toISOString(), 
      endTime: null, 
      passengers: { abonado: 0, noAbonado: 0 }, 
      status: 'Pendiente',
      location: { lat: -16.500, lng: -68.13 }
    },
];

export const getVehicleById = (id: string) => mockVehicles.find(v => v.id === id);
export const getDriverById = (id: string) => mockDrivers.find(d => d.id === id);
export const getRouteById = (id: string) => mockRoutes.find(r => r.id === id);
