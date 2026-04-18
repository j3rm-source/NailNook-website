export interface Staff {
  id: string
  name: string
  pin_hash: string
  phone: string | null
  color: string
  photo_url: string | null
  role: 'staff' | 'admin'
  created_at: string
}

export interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  description: string | null
  active: boolean
  created_at: string
}

export interface Availability {
  id: string
  staff_id: string
  day_of_week: number | null
  specific_date: string | null
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

export interface Booking {
  id: string
  staff_id: string
  service_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  customer_note: string | null
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  // Joined fields
  staff?: Pick<Staff, 'id' | 'name' | 'color' | 'phone'>
  service?: Pick<Service, 'id' | 'name' | 'price' | 'duration_minutes'>
}

export interface Session {
  staffId: string
  name: string
  role: 'staff' | 'admin'
}

// Booking flow state
export interface BookingState {
  step: number
  selectedService: Service | null
  selectedStaff: Staff | null
  selectedDate: string | null
  selectedTime: string | null
  customerInfo: CustomerInfo | null
  completedBookingId: string | null
}

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  note: string
}

// API response shapes
export interface TimeSlot {
  time: string       // "09:00"
  available: boolean
}

export interface AvailableDate {
  date: string       // "2024-07-15"
  hasSlots: boolean
}

export interface BookingCreatePayload {
  staffId: string
  serviceId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerNote?: string
  bookingDate: string
  bookingTime: string
}
