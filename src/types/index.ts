// ── Domain Types ──────────────────────────────────────────────────────────────

export type Role = 'user' | 'admin' | 'superadmin';

export type Gender         = 'male' | 'female' | 'other';
export type MaritalStatus  = 'single' | 'married' | 'divorced' | 'widowed';
export type AgeBracket     = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type HealthStatus   = 'excellent' | 'good' | 'fair' | 'with_disability' | 'medical_support';

/** PM § 4.1 — Foreigner / Nigerian-Resident split */
export type ResidencyStatus = 'foreigner' | 'nigerian_resident';

/** PM § 4.1 — Room category for residency-based filtering */
export type RoomCategory = 'foreigner' | 'nigerian_resident' | 'both';

export interface Profile {
  id:               string;
  full_name:        string;
  phone:            string;
  role:             Role;
  // PM § 3.2 — extended fields
  gender?:           Gender;
  marital_status?:   MaritalStatus;
  age_bracket?:      AgeBracket;
  nationality?:      string;
  residency_status?: ResidencyStatus;
  health_status?:    HealthStatus;
  health_notes?:     string;
  special_requests?: string;
  created_at:       string;
}

export interface Room {
  id:              string;
  name:            string;
  description:     string;
  price_per_night: number;
  capacity:        number;
  is_active:       boolean;
  amenities?:      string[];
  images?:         string[];
  category:        RoomCategory;
  created_at:      string;
}

// PM § 5.2 — 3-Day Review Window expanded status enum
export type BookingStatus =
  | 'PENDING_REVIEW'    // new: enters 72h review window
  | 'APPROVED'          // new: admin approved during window
  | 'REJECTED'          // new: admin rejected during window
  | 'PENDING_PAYMENT'   // approved → waiting for payment
  | 'PAYMENT_UPLOADED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Booking {
  id:                string;
  user_id:           string;
  room_id:           string;
  check_in_date:     string;
  check_out_date:    string;
  total_amount:      number;
  status:            BookingStatus;
  booking_reference: string;
  review_expires_at: string;   // 72h from creation
  expires_at:        string;   // payment deadline after approval
  admin_note?:       string;
  created_at:        string;
  // Joins
  room?:     Room;
  profile?:  Profile;
  payments?: Payment[];
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Payment {
  id:              string;
  booking_id:      string;
  transaction_ref: string;
  sender_name:     string;
  proof_url:       string;
  amount:          number;
  status:          PaymentStatus;
  created_at:      string;
  // Join
  booking?: Booking;
}

export interface Testimonial {
  id:         string;
  user_id?:   string;
  guest_name: string;
  rating:     number;
  message:    string;
  is_visible: boolean;
  created_at: string;
}

// ── Form Types ────────────────────────────────────────────────────────────────

export interface LoginForm {
  email:    string;
  password: string;
}

export interface RegisterForm {
  full_name:        string;
  email:            string;
  phone:            string;
  password:         string;
  // extended
  gender?:           string;
  marital_status?:   string;
  age_bracket?:      string;
  nationality?:      string;
  residency_status?: string;
  health_status?:    string;
  health_notes?:     string;
  special_requests?: string;
}

export interface BookingForm {
  room_id:        string;
  check_in_date:  string;
  check_out_date: string;
}

export interface PaymentForm {
  booking_id:      string;
  transaction_ref: string;
  sender_name:     string;
  proof_file:      File | null;
  amount:          number;
}

// ── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:  T | null;
  error: string | null;
}

// ── UI / Filters ──────────────────────────────────────────────────────────────

export type BookingFilter = BookingStatus | 'ALL';

export interface DateRange {
  checkIn:  string;
  checkOut: string;
}

export interface RoomAvailability {
  room:              Room;
  isAvailable:       boolean;
  conflictingDates?: DateRange[];
}
