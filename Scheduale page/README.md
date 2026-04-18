# Booking App

A full-stack appointment booking system built with Next.js 14, Supabase, and Twilio SMS.

## Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, DM Sans
- **Database + Auth**: Supabase (Postgres)
- **SMS**: Twilio
- **Hosting**: Vercel

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run `supabase/migrations/001_initial.sql` to create the schema
3. Then run `supabase/seed.sql` to add sample data

### 3. Configure environment variables

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+15550000000

NEXT_PUBLIC_BUSINESS_NAME=Luxe Studio
NEXT_PUBLIC_BUSINESS_TAGLINE=Premium hair & beauty services
```

Find your Supabase keys under: Project Settings → API.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seed Data (pre-loaded)

| | |
|---|---|
| **Services** | Haircut ($45 / 45 min), Color ($120 / 90 min), Blowout ($35 / 30 min) |
| **Staff** | Sarah Johnson (PIN: 1234), Mike Davis (PIN: 5678) |
| **Admin** | Admin (PIN: 0000) |

---

## Routes

| Route | Description |
|---|---|
| `/` | Public booking page (customer-facing, 6-step flow) |
| `/staff/login` | PIN-based staff login |
| `/staff/dashboard` | Staff availability grid + upcoming bookings |
| `/admin` | Admin dashboard (stats, bookings, services, staff) |

---

## SMS

SMS is sent via Twilio in these events:

| Event | Recipient | Trigger |
|---|---|---|
| Booking confirmed | Staff + Customer | `POST /api/bookings` |
| Booking cancelled | Staff + Customer | `PUT /api/bookings/[id]` with `status: cancelled` |
| 24-hour reminder | Customer | Supabase Edge Function cron (daily 8am) |

In development, if `TWILIO_ACCOUNT_SID` starts with `AC_PLACEHOLDER`, SMS is logged to the console instead of sent.

---

## Supabase Edge Function (Reminders)

Deploy the reminder cron function:

```bash
supabase functions deploy send-reminders
```

Set the environment variables in Supabase Dashboard → Edge Functions → send-reminders → Secrets:

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
```

Then enable the cron schedule in Dashboard → Edge Functions → Cron, or via SQL:

```sql
select cron.schedule(
  'send-reminders',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  )
  $$
);
```

---

## Deploy to Vercel

```bash
vercel deploy
```

Add all `.env.local` variables in Vercel → Project → Settings → Environment Variables.

---

## Regenerating PINs

To create a new bcrypt hash for a PIN:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR_PIN', 10))"
```

Then update the `pin_hash` column directly in Supabase, or use the Admin UI.
