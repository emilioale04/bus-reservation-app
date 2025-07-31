import { supabase } from './supabase';
import type { Route, Trip, Seat, SearchFilters, CityOption } from '../types';

/**
 * Servicio para obtener todas las rutas disponibles
 */
export const getRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .order('origin', { ascending: true });

  if (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }

  return data || [];
};

/**
 * Servicio para obtener las ciudades únicas como opciones para el selector
 */
export const getCityOptions = async (): Promise<CityOption[]> => {
  const routes = await getRoutes();
  const cities = new Set<string>();
  
  routes.forEach(route => {
    cities.add(route.origin);
    cities.add(route.destination);
  });

  return Array.from(cities).sort().map(city => ({
    value: city,
    label: city
  }));
};

/**
 * Servicio para buscar viajes basado en criterios de búsqueda
 */
export const searchTrips = async (filters: SearchFilters): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      schedule:schedules (
        *,
        route:routes (*)
      ),
      bus:buses (*)
    `)
    .eq('trip_date', filters.date)
    .eq('status', 'active')
    .gte('available_seats', 1);

  if (error) {
    console.error('Error searching trips:', error);
    throw error;
  }

  // Filtrar por origen y destino
  const filteredTrips = (data || []).filter((trip: any) => {
    const route = trip.schedule?.route;
    return route?.origin === filters.origin && route?.destination === filters.destination;
  });

  return filteredTrips;
};

/**
 * Servicio para obtener los detalles de un viaje específico
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      schedule:schedules (
        *,
        route:routes (*)
      ),
      bus:buses (*)
    `)
    .eq('id', tripId)
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }

  return data;
};

/**
 * Servicio para obtener los asientos ocupados de un viaje específico
 */
export const getOccupiedSeats = async (tripId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from('seats')
    .select('seat_number')
    .eq('trip_id', tripId)
    .eq('is_reserved', true);

  if (error) {
    console.error('Error fetching occupied seats:', error);
    throw error;
  }

  return (data || []).map((seat: any) => seat.seat_number);
};

/**
 * Servicio para obtener todos los asientos de un viaje (reservados y disponibles)
 */
export const getTripSeats = async (tripId: string): Promise<Seat[]> => {
  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('trip_id', tripId)
    .order('seat_number', { ascending: true });

  if (error) {
    console.error('Error fetching trip seats:', error);
    throw error;
  }

  return data || [];
};

/**
 * Función auxiliar para formatear la hora de salida
 */
export const formatDepartureTime = (departureTime: string): string => {
  const time = new Date(`2000-01-01T${departureTime}`);
  return time.toLocaleTimeString('es-EC', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Función auxiliar para formatear duración en minutos a horas y minutos
 */
export const formatDuration = (durationMinutes: number): string => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
};