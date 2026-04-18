-- ============================================================
-- Nail Nook Seed Data
-- Run AFTER applying 001_initial.sql
--
-- PIN hashes (bcryptjs, 10 rounds):
--   Admin     PIN: 0000
--   Stephanie PIN: 1111
--   Katie     PIN: 2222
--   Rita      PIN: 3333
--
-- To regenerate hashes for new PINs run:
--   node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR_PIN', 10))"
-- ============================================================

-- Staff
INSERT INTO staff (id, name, pin_hash, phone, color, role) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Admin',
    '$2a$10$RsvJPARXOy5sxFvSwY9LT./rbq0ZlQvwM3LexbILT8GF/AR5l6vbO',
    '+19288556425',
    '#e91e8c',
    'admin'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'Stephanie',
    '$2a$10$AXOCaRVx6wZbPv2JzmzenucJNEf1MGCDwEiNZ1J2bV.XQhT/wCG3C',
    NULL,
    '#f06292',
    'staff'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'Katie',
    '$2a$10$d6yc895fHDqhiBOm2/sEe.XGMWpudVfywxs/L1SkF.XNYalJqeH3W',
    NULL,
    '#ba68c8',
    'staff'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'Rita',
    '$2a$10$PTYbSqnubslJE2JNuf3Ieu6m/CNbFDCrhbNRQi97jCxFhOLnCc1bi',
    NULL,
    '#4db6ac',
    'staff'
  );

-- Services (from Nail Nook services.html)
INSERT INTO services (id, name, price, duration_minutes, description) VALUES
  -- MANICURE
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Classic Manicure',
    25.00,
    35,
    'Nail shaping, cuticle care, hand massage, and your choice of polish.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Gel Manicure',
    40.00,
    45,
    'Long-lasting gel polish with a glossy, chip-free finish — lasts 2–3 weeks.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000011',
    'Spa Manicure',
    45.00,
    50,
    'Everything in our classic mani plus exfoliation, mask, and extended massage.'
  ),
  -- PEDICURE
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'Classic Pedicure',
    35.00,
    45,
    'Relaxing foot soak, nail shaping, cuticle care, and polish.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000012',
    'Gel Pedicure',
    50.00,
    55,
    'Pedicure with long-lasting gel polish for chip-free toes.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    'Spa Pedicure',
    55.00,
    60,
    'Luxurious pedicure with exfoliation scrub, hydrating mask, hot towel, and extended massage.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000013',
    'Deluxe Pedicure',
    65.00,
    75,
    'Our most indulgent pedicure — everything in the spa pedi plus paraffin wax and callus peel.'
  ),
  -- ACRYLIC
  (
    'bbbbbbbb-0000-0000-0000-000000000005',
    'Acrylic Full Set',
    55.00,
    90,
    'Full acrylic nail set sculpted to your preferred length and shape.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000006',
    'Acrylic Fill-In',
    35.00,
    60,
    'Maintenance fill to keep your acrylics looking fresh.'
  ),
  -- GEL EXTENSIONS
  (
    'bbbbbbbb-0000-0000-0000-000000000007',
    'Gel Extensions Full Set',
    65.00,
    90,
    'Lightweight, flexible gel extensions — natural look and feel, no odor.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000014',
    'Gel Extension Refill',
    45.00,
    60,
    'Maintenance refill for existing gel extensions.'
  ),
  -- DIP POWDER
  (
    'bbbbbbbb-0000-0000-0000-000000000008',
    'Dip Powder Manicure',
    45.00,
    60,
    'Odorless, chip-resistant dip powder in hundreds of shades — lasts 3–4 weeks.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000015',
    'Dip Powder with Tips',
    55.00,
    70,
    'Dip powder applied over nail tips for added length and strength.'
  ),
  -- NAIL ART
  (
    'bbbbbbbb-0000-0000-0000-000000000009',
    'Nail Art (per nail)',
    5.00,
    15,
    'Custom hand-painted designs, gems, chrome, ombre, or 3D art. Price starts at $5/nail — ask your specialist.'
  ),
  -- WAXING
  (
    'bbbbbbbb-0000-0000-0000-000000000010',
    'Eyebrow Wax',
    15.00,
    20,
    'Precise eyebrow shaping with premium wax. Includes soothing aftercare.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000016',
    'Lip Wax',
    10.00,
    15,
    'Smooth, quick lip wax with soothing aftercare lotion.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000017',
    'Full Face Wax',
    35.00,
    30,
    'Complete facial wax including brows, lip, chin, and cheeks.'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000018',
    'Underarm Wax',
    25.00,
    20,
    'Quick and smooth underarm waxing with soothing aftercare.'
  );

-- Availability: Stephanie, Katie, Rita
-- Mon–Sat 9am–7pm (day_of_week 1=Mon … 6=Sat), Sun 10am–5pm (0=Sun)
INSERT INTO availability (staff_id, day_of_week, start_time, end_time, is_available) VALUES
  -- Stephanie
  ('aaaaaaaa-0000-0000-0000-000000000002', 1, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 2, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 3, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 4, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 5, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 6, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000002', 0, '10:00', '17:00', true),
  -- Katie
  ('aaaaaaaa-0000-0000-0000-000000000003', 1, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 2, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 3, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 4, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 5, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 6, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000003', 0, '10:00', '17:00', true),
  -- Rita
  ('aaaaaaaa-0000-0000-0000-000000000004', 1, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 2, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 3, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 4, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 5, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 6, '09:00', '19:00', true),
  ('aaaaaaaa-0000-0000-0000-000000000004', 0, '10:00', '17:00', true);
