-- ============================================================
-- Booking App — Initial Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  phone TEXT,
  color TEXT NOT NULL DEFAULT '#E94560',
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff (id) ON DELETE CASCADE,
  -- recurring: day_of_week 0=Sun … 6=Sat (NULL when specific_date is set)
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  -- override: exact date (NULL when day_of_week is set)
  specific_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_type CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL)
    OR (day_of_week IS NULL AND specific_date IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_availability_staff ON availability (staff_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability (specific_date);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff (id),
  service_id UUID NOT NULL REFERENCES services (id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_note TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings (staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
