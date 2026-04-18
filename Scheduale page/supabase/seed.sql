-- ============================================================
-- Seed Data
-- Run AFTER applying 001_initial.sql
--
-- PIN hashes (bcryptjs, 10 rounds):
--   Admin  PIN: 0000  →  $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--   Sarah  PIN: 1234  →  $2a$10$XFE/qUcLfqhRF.EbWI7RDe4nfSEbxaZFxCcUxW0vT4bGqjzyvPKZa
--   Mike   PIN: 5678  →  $2a$10$hQEzGc3Rm.pSqFe7TymgSOmWVjW5.vwq.NflbY5jcFBPkjTnAdRiq
--
-- To regenerate hashes for new PINs run:
--   node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR_PIN', 10))"
-- ============================================================

-- Staff
INSERT INTO staff (id, name, pin_hash, phone, color, role) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '+15550000000',
    '#E94560',
    'admin'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Sarah Johnson',
    '$2a$10$XFE/qUcLfqhRF.EbWI7RDe4nfSEbxaZFxCcUxW0vT4bGqjzyvPKZa',
    '+15551234567',
    '#4ECDC4',
    'staff'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Mike Davis',
    '$2a$10$hQEzGc3Rm.pSqFe7TymgSOmWVjW5.vwq.NflbY5jcFBPkjTnAdRiq',
    '+15559876543',
    '#45B7D1',
    'staff'
  );

-- Services
INSERT INTO services (id, name, price, duration_minutes, description) VALUES
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Haircut',
    45.00,
    45,
    'Professional haircut and styling tailored to your look.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Color',
    120.00,
    90,
    'Full color treatment with premium products.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'Blowout',
    35.00,
    30,
    'Blowout and styling for a polished finish.'
  );

-- Availability: Sarah & Mike — Mon–Fri 9am–5pm (recurring, day_of_week 1-5)
INSERT INTO availability (staff_id, day_of_week, start_time, end_time, is_available) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000002', 1, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 2, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 3, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 4, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 5, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 1, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 2, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 3, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 4, '09:00', '17:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 5, '09:00', '17:00', true);
