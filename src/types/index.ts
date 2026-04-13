// ── Domain Types ──────────────────────────────────────────────────────────────

export type Role = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: Role;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  is_active: boolean;
  amenities?: string[];
  images?: string[];
  created_at: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_UPLOADED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: BookingStatus;
  booking_reference: string;
  expires_at: string;
  created_at: string;
  // Joins
  room?: Room;
  profile?: Profile;
  payments?: Payment[];
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id: string;
  booking_id: string;
  transaction_ref: string;
  sender_name: string;
  proof_url: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  // Join
  booking?: Booking;
}

// ── Form Types ────────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface BookingForm {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
}

export interface PaymentForm {
  booking_id: string;
  transaction_ref: string;
  sender_name: string;
  proof_file: File | null;
  amount: number;
}

// ── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ── UI / Filters ──────────────────────────────────────────────────────────────

export type BookingFilter = BookingStatus | 'ALL';

export interface DateRange {
  checkIn: string;
  checkOut: string;
}

export interface RoomAvailability {
  room: Room;
  isAvailable: boolean;
  conflictingDates?: DateRange[];
}
