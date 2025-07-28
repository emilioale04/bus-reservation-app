export interface Route {
  id: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  departure_time: string;
  days_of_week: number[];
  bus_capacity: number;
  route?: Route;
}

export interface Trip {
  id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  status: string;
  schedule?: Schedule;
}

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Reservation {
  id: string;
  trip_id: string;
  passenger_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_address: string;
  seat_numbers: number[];
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  confirmation_code: string;
  trip?: Trip;
}

export interface ReservationState {
  selectedTrip: Trip | null;
  selectedSeats: number[];
  passenger: Passenger | null;
  reservation: Reservation | null;
  step: number;
}