// src/lib/data.ts
import { User, Vehicle, Driver, Route, Alert, Trip } from '@/types';

export const mockUsers: User[] = [
  { id: 1, name: 'Ana Pérez', ci: '1234567 LP', phone: '+591 71234567', status: 'Abonado', avatar: 'user1' },
  { id: 2, name: 'Luis Gutiérrez', ci: '2345678 CB', phone: '+591 72345678', status: 'No Abonado', avatar: 'user2' },
];

export const mockVehicles: Vehicle[] = [
  { id: 1, plate: '1234-TUB', brand: 'Toyota', model: 'Hiace', capacity: 18, status: 'Activo', image: 'vehicle1' },
  { id: 2, plate: '5678-EMI', brand: 'Nissan', model: 'Urvan', capacity: 15, status: 'En mantenimiento', image: 'vehicle2' },
  { id: 3, plate: '2345-CDE', brand: 'Mercedes-Benz', model: 'Sprinter', capacity: 20, status: 'Activo', image: 'vehicle3' },
  { id: 4, plate: '9876-FGH', brand: 'Ford', model: 'Transit', capacity: 16, status: 'Activo', image: 'vehicle4' },
];

export const mockDrivers: Driver[] = [
  { id: 1, name: 'Juan López', ci: '6543210 LP', phone: '+591 61234567', license: 'Cat C', status: 'Activo', avatar: 'driver1' },
  { id: 2, name: 'Carlos Fernández', ci: '7654321 CB', phone: '+591 62345678', license: 'Cat C', status: 'Inactivo', avatar: 'driver2' },
  { id: 3, name: 'Pedro Ramirez', ci: '8765432 SC', phone: '+591 63456789', license: 'Cat C', status: 'Activo', avatar: 'driver3' },
];

export const mockRoutes: Route[] = [
  { id: 1, name: 'Ruta Irpavi – EMI', type: 'Mixto', driverId: 1, vehicleId: 1, status: 'Publicada', schedule: '07:30 AM', stops: 12 },
  { id: 2, name: 'Ruta Centro – EMI', type: 'Abonados', driverId: 3, vehicleId: 3, status: 'Publicada', schedule: '08:00 AM', stops: 8 },
  { id: 3, name: 'Ruta Sopocachi – EMI', type: 'Mixto', driverId: 1, vehicleId: 4, status: 'En borrador', schedule: '18:00 PM', stops: 15 },
];

// --- IMPORTANTE: Definimos mockTrips con la ubicación correcta ---
export const mockTrips: Trip[] = [
    { 
      id: 1, 
      routeId: 1, 
      driverId: 1, 
      vehicleId: 1, 
      startTime: new Date('2024-07-28T12:30:00Z'), 
      endTime: null, 
      passengersAbonado: 10,
      passengersNoAbonado: 3, 
      status: 'En curso',
      locationLat: -16.523, 
      locationLng: -68.08
    },
    { 
      id: 2, 
      routeId: 2, 
      driverId: 3, 
      vehicleId: 3, 
      startTime: new Date('2024-07-28T12:40:00Z'), 
      endTime: null, 
      passengersAbonado: 8,
      passengersNoAbonado: 0, 
      status: 'En curso',
      locationLat: -16.515, 
      locationLng: -68.10
    }
];

// Helpers
export const getVehicleById = (id: number) => mockVehicles.find(v => v.id === id);
export const getDriverById = (id: number) => mockDrivers.find(d => d.id === id);
export const getRouteById = (id: number) => mockRoutes.find(r => r.id === id);