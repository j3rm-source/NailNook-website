# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run from inside nailnook/
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # ESLint
npx artillery run artillery.yml  # load test
```

## Architecture

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (Postgres), Twilio SMS.

**Two distinct layers in one app:**

1. **Marketing pages** (`/`, `/services`, `/team`) — Server components with extensive client-side interactivity (gallery slideshow, lightbox, parallax, scroll reveal, chatbot). Styled with `src/styles/marketing.css` (~343 lines of custom CSS) alongside Tailwind. These pages contain large `useEffect` blocks that wire up IntersectionObserver, event listeners, and the chatbot state machine.

2. **Operational pages** (`/book`, `/staff/dashboard`, `/admin`) — Multi-step booking wizard, PIN-based staff login, admin CRUD for services/staff/bookings.

**Auth:** PIN-based. Staff enter name + PIN → `/api/auth/login` bcrypt-verifies against DB → sets `session` cookie → `middleware.ts` enforces on `/staff/dashboard/*` and `/admin/*`. Admin role stored on the staff record.

**Booking flow:** 6-step `BookingFlow` component (`src/components/booking/`) — service → specialist → date → time slots → customer info → confirmation. Specialist list is filtered client-side by the selected service. Available time slots are queried from `/api/timeslots` which joins availability + existing bookings.

**Chatbot:** Embedded in all marketing pages as a floating bubble. Self-contained `useEffect` state machine in each page file. Replicates the 6-step booking flow inside chat, collects info conversationally, then POSTs to `/api/chat-booking`.

**SMS:** Twilio fires on booking confirmation, cancellation, and 24h reminders. Reminders run via a Supabase Edge Function cron (`supabase/functions/send-reminders/`).

**Supabase clients:** Two clients in `src/lib/supabase.ts` — browser anon client (RLS enforced) and server admin client (`createAdminClient()`). All DB writes from API routes use the admin client.

**Image proxy:** `next.config.mjs` proxies Supabase CDN images via `**.supabase.co`.

## Key Files

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage — 2400+ lines including full chatbot state machine |
| `src/styles/marketing.css` | All custom CSS for marketing pages (colors, gallery, chatbot, lightbox) |
| `src/lib/types.ts` | `Staff`, `Service`, `Availability`, `Booking`, `TimeSlot` types |
| `src/lib/supabase.ts` | DB client factory — use `createAdminClient()` in API routes |
| `middleware.ts` | Route protection for `/admin` and `/staff/dashboard` |
| `tailwind.config.ts` | Design tokens: `navy` (#1e1e1e), `accent` (#e91e8c), Lato/Playfair Display/Great Vibes fonts |

## Design Tokens

- **Accent color:** `#e91e8c` (magenta/pink) — used for CTAs, active states, highlights
- **Body font:** Lato
- **Display font:** Playfair Display (headings)
- **Cursive accent:** Great Vibes (decorative text)
- **Animations:** `fade-in` (0.2s), `slide-in` (0.3s) defined in Tailwind config

## Environment Variables (`nailnook/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
NEXT_PUBLIC_BUSINESS_NAME
NEXT_PUBLIC_BUSINESS_TAGLINE
```

## DB Schema

Migrations in `supabase/migrations/`. Tables: `staff`, `services`, `availability`, `bookings`. Seed data in `supabase/seed.sql` (3 services, sample staff with hashed PINs).
