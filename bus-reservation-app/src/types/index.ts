export interface Route {
  id: string;
  origin: string;
  destination: string;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export interface Bus {
  id: string;
  capacity: number;
  bus_number: string;
  route_id: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  departure_time: string;
  days_of_week: number[];
  created_at: string;
  route?: Route;
}

export interface Trip {
  id: string;
  schedule_id: string;
  bus_id: string;
  trip_date: string;
  available_seats: number;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  schedule?: Schedule;
  bus?: Bus;
}

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  identification: string;
  created_at: string;
}

export interface Seat {
  id: string;
  trip_id: string;
  seat_number: number;
  is_reserved: boolean;
  reservation_id?: string;
  created_at: string;
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
  created_at: string;
  trip?: Trip;
  passenger?: Passenger;
}

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'transfer';
  card_last_four?: string;
  receipt_url?: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string;
  created_at: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'transfer';
}

export interface ReservationState {
  selectedTrip: Trip | null;
  selectedSeats: number[];
  passenger: Passenger | null;
  reservation: Reservation | null;
  step: number;
}

// Interfaces para formularios de búsqueda
export interface SearchFilters {
  origin: string;
  destination: string;
  date: string;
}

// Interface para representar una opción de ciudad en los selectores
export interface CityOption {
  value: string;
  label: string;
}