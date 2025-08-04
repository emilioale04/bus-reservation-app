import type { CityOption, Route, SearchFilters, Seat, Trip } from '../types';
import { supabase } from './supabase';

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

/**
 * Servicio para crear o actualizar un pasajero
 * Si el pasajero existe (por identification), actualiza phone y address si han cambiado
 */
export const createOrUpdatePassenger = async (passengerData: {
  name: string;
  email: string;
  phone: string;
  address: string;
  identification: string;
}): Promise<string> => {
  try {
    console.log('🔄 Verificando si el pasajero existe...', passengerData.identification);

    // Buscar pasajero existente por identification
    const { data: existingPassenger, error: searchError } = await supabase
      .from('passengers')
      .select('*')
      .eq('identification', passengerData.identification)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingPassenger) {
      console.log('👤 Pasajero existente encontrado, verificando actualizaciones...');
      
      // Verificar si phone o address han cambiado
      const needsUpdate = 
        existingPassenger.phone !== passengerData.phone ||
        existingPassenger.address !== passengerData.address;

      if (needsUpdate) {
        console.log('🔄 Actualizando información del pasajero...');
        const { error: updateError } = await supabase
          .from('passengers')
          .update({
            phone: passengerData.phone,
            address: passengerData.address
          })
          .eq('id', existingPassenger.id);

        if (updateError) {
          throw updateError;
        }
        console.log('✅ Pasajero actualizado exitosamente');
      } else {
        console.log('ℹ️ No se requieren actualizaciones para el pasajero');
      }

      return existingPassenger.id;
    } else {
      console.log('👤 Creando nuevo pasajero...');
      
      // Crear nuevo pasajero
      const { data: newPassenger, error: insertError } = await supabase
        .from('passengers')
        .insert({
          name: passengerData.name,
          email: passengerData.email,
          phone: passengerData.phone,
          address: passengerData.address,
          identification: passengerData.identification
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Pasajero creado exitosamente:', newPassenger.id);
      return newPassenger.id;
    }
  } catch (error) {
    console.error('❌ Error en createOrUpdatePassenger:', error);
    throw error;
  }
};

/**
 * Servicio para crear una nueva reserva
 */
export const createReservation = async (reservationData: {
  trip_id: string;
  passenger_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_address: string;
  seat_numbers: number[];
  total_amount: number;
  payment_status: string;
  payment_method: string;
  confirmation_code: string;
  notes?: string;
}): Promise<string> => {
  try {
    console.log('🔄 Creando nueva reserva...', reservationData.confirmation_code);

    const { data: newReservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Reserva creada exitosamente:', newReservation.id);
    return newReservation.id;
  } catch (error) {
    console.error('❌ Error en createReservation:', error);
    throw error;
  }
};

/**
 * Servicio para crear un nuevo pago
 */
export const createPayment = async (paymentData: {
  reservation_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  receipt_url: string;
  status: string;
}): Promise<string> => {
  try {
    console.log('🔄 Creando registro de pago...', paymentData.transaction_id);

    const { data: newPayment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Pago registrado exitosamente:', newPayment.id);
    return newPayment.id;
  } catch (error) {
    console.error('❌ Error en createPayment:', error);
    throw error;
  }
};

/**
 * Función para generar un ID de transacción único
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

/**
 * Servicio completo para procesar una reserva con pago
 * Incluye: crear/actualizar pasajero, crear reserva y registrar pago
 */
export const processCompleteReservation = async (data: {
  tripId: string;
  passengerInfo: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    celular: string;
    direccion: string;
  };
  selectedSeats: number[];
  total: number;
  paymentMethod: string;
  confirmationCode: string;
  receiptUrl: string;
}): Promise<{
  passengerId: string;
  reservationId: string;
  paymentId: string;
}> => {
  try {
    console.log('🔄 Iniciando procesamiento completo de reserva...');

    // Paso 1: Crear o actualizar pasajero
    const passengerId = await createOrUpdatePassenger({
      name: `${data.passengerInfo.nombre} ${data.passengerInfo.apellido}`,
      email: data.passengerInfo.email,
      phone: data.passengerInfo.celular,
      address: data.passengerInfo.direccion,
      identification: data.passengerInfo.cedula
    });

    // Paso 2: Crear reserva
    const reservationId = await createReservation({
      trip_id: data.tripId,
      passenger_id: passengerId,
      passenger_name: `${data.passengerInfo.nombre} ${data.passengerInfo.apellido}`,
      passenger_email: data.passengerInfo.email,
      passenger_phone: data.passengerInfo.celular,
      passenger_address: data.passengerInfo.direccion,
      seat_numbers: data.selectedSeats,
      total_amount: data.total,
      payment_status: 'completed',
      payment_method: data.paymentMethod,
      confirmation_code: data.confirmationCode
    });

    // Paso 3: Crear registro de pago
    const transactionId = generateTransactionId();
    const paymentId = await createPayment({
      reservation_id: reservationId,
      amount: data.total,
      payment_method: data.paymentMethod,
      transaction_id: transactionId,
      receipt_url: data.receiptUrl,
      status: 'completed'
    });

    console.log('✅ Reserva procesada completamente:', {
      passengerId,
      reservationId,
      paymentId
    });

    return {
      passengerId,
      reservationId,
      paymentId
    };
  } catch (error) {
    console.error('❌ Error en processCompleteReservation:', error);
    throw error;
  }
};