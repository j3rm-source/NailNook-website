# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Next.js 16 warning:** This app runs Next.js 16, which has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing any Next.js code. Heed deprecation notices.

> **Tailwind v4 warning:** This project uses Tailwind CSS v4 (`@tailwindcss/postcss`), which has breaking syntax changes from v3 — no `tailwind.config.js`, different color/spacing APIs, CSS-first config. Do not apply v3 patterns.

## Dev Commands (run from inside `hvac-saas/`)

```bash
npm run dev      # dev server on :3001
npm run build    # production build
npm run lint     # ESLint
```

> There is no local worker process — background jobs run via Upstash QStash webhooks, not BullMQ/Redis.

## Architecture

### Multi-Tenancy
Tenant ID is stored in the JWT (Supabase session). **All DB queries must be filtered by `tenant_id`** — enforced via Supabase RLS. Never use the admin client (`createAdminClient()`) in routes that serve tenant-scoped data.

### Auth
Email/password via Supabase + `@supabase/ssr`. Two client helpers in `src/lib/supabase/`:
- `client.ts` — browser client (anon key, RLS enforced)
- `server.ts` — `createClient()` for server components/actions; `createAdminClient()` for API routes that need to bypass RLS (webhooks, admin panel)

### Plan Gating
Feature access is gated by `plan_tier` (1 = Foundation, 2 = Growth System, 3 = Revenue Partner). Use `assertFeature(tier, feature)` from `src/lib/plan-gate.ts` in API routes. `getPlanFeatures(tier)` returns a `PlanFeatures` object. Most features require tier ≥ 2.

### Background Jobs (QStash, not workers)
Delayed/scheduled tasks use **Upstash QStash** (`src/lib/qstash.ts`). `publishDelayed(path, body, delaySeconds)` schedules a POST to an API route. The 3-touch SMS sequence fires `/api/qstash/sms-followup` at t+0, t+24h, t+72h. To cancel a job: `cancelMessage(messageId)`.

### AI Integration
Bland.ai handles inbound voice calls. On call completion, `/api/bland/webhook` runs the transcript through **Claude Haiku** (`src/lib/bland-script.ts`) to extract: caller name, issue type, booking confirmation, and a lead score (1–10). The parsed result creates a `Contact` and optionally starts the SMS sequence.

### SMS
Twilio handles SMS. Inbound SMS hits `/api/twilio/sms`. Outbound manual sends go through `/api/sms/send`. The sequence is orchestrated in `src/lib/sms-sequence.ts`. Template variable interpolation: `src/lib/utils.ts` → `interpolateSmsTemplate()`.

### Stripe Lifecycle
Checkout → `stripe/webhook` receives `checkout.session.completed` → creates `tenants` row, `user_profiles` row, and seeds default `sms_templates`. Tenant provisioning (Twilio number, etc.) is triggered here.

### Public Tenant Sites
Each tenant gets a public site at `/[tenant]` (their `website_slug`) with a customer portal at `/[tenant]/portal`. The site is built from data in the `tenants` table (logo, colors, services, about text, Cal.com booking link). No separate CMS.

### Component Colocation
There is no central `src/components/` directory. Components live in `_components/` subdirectories alongside their feature pages (e.g. `dashboard/contacts/_components/`). The jobs kanban uses `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop.

## Key Types (`src/lib/types.ts`)

`Tenant`, `UserProfile`, `Contact`, `Job`, `Booking`, `SmsTemplate`, `SmsSequence`, `AiCall`, `JobNote`, `PlanFeatures`

Contact `source` values: `'website_form' | 'ai_call' | 'sms_reply' | 'manual' | 'cal_booking'`  
Contact `status` values: `'new' | 'contacted' | 'qualified' | 'booked' | 'won' | 'lost'`  
Job `status` values: `'new' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'`

## App Structure

```
src/app/
  (auth)/             # login, signup, signup/plan — unauthenticated
  [tenant]/           # public business site; /[tenant]/portal is the customer portal
  admin/              # ops admin panel (broadcast, tenant list)
  api/                # all API routes and webhooks
  dashboard/          # protected tenant dashboard
  onboarding/         # new-tenant setup wizard
```

Dashboard pages: `contacts`, `jobs` (with `[id]/invoice`), `bookings`, `sms`, `ai-calls`, `analytics`, `notifications`, `website`.  
Dashboard settings sub-pages: `ai-receptionist`, `sms-templates`, `billing`, `team`, `website`.

## API Routes

Webhooks require the service-role Supabase client (`createAdminClient()`). All routes that modify tenant data must verify the authenticated user's `tenant_id` before touching any records. `src/lib/rate-limit.ts` provides rate limiting for public-facing routes.

```
/api/stripe/checkout          POST  Create Stripe checkout session
/api/stripe/portal            POST  Redirect to Stripe billing portal
/api/stripe/webhook           POST  Stripe events; tenant provisioning happens here

/api/bland/create-call        POST  Initiate outbound Bland.ai call
/api/bland/recording          GET   Fetch call recording
/api/bland/webhook            POST  Call completion → Claude Haiku extraction → Contact + SMS

/api/twilio/sms               POST  Inbound SMS handler
/api/twilio/voice             POST  Inbound voice call handler
/api/twilio/provision-number  POST  Buy a Twilio number during onboarding

/api/qstash/sms-followup      POST  Delayed QStash callback; sends next SMS in sequence
/api/qstash/review-request    POST  Delayed review/feedback request

/api/calcom/webhook           POST  Booking confirmation → create Contact + Job

/api/sms/send                 POST  Manual outbound SMS
/api/jobs/create              POST  Create new job
/api/jobs/complete            POST  Mark job completed
/api/jobs/notes               POST/PUT  Add or update job notes
/api/bookings/update-status   PUT   Update booking status
/api/tenant/contact           POST  Create contact from public tenant site form
/api/review-request/send      POST  Trigger review request sequence
/api/team/invite              POST  Invite team member
/api/team/member/[id]         DELETE  Remove team member
/api/admin/broadcast          POST  Send broadcast message to all tenants
```

## Key `src/lib/` Utilities

| File | Purpose |
|------|---------|
| `types.ts` | All domain types and enums |
| `utils.ts` | `cn()`, `formatPhone()`, `formatCurrency()`, `formatDate()`, `interpolateSmsTemplate()`, `getInitials()` |
| `plan-gate.ts` | `assertFeature(tier, feature)`, `getPlanFeatures(tier)` |
| `bland-script.ts` | `generateBlandScript()` — builds AI receptionist system prompt from tenant config |
| `email.ts` | Transactional email templates + Resend integration |
| `sms-sequence.ts` | `startSmsSequence()`, `cancelSequence()` |
| `qstash.ts` | `publishDelayed()`, `cancelMessage()` |
| `stripe.ts` | Stripe SDK initialization and helpers |
| `rate-limit.ts` | Token-bucket rate limiting for public routes |

## DB Migrations

Migrations are in `supabase/migrations/` (6 total). Key schema decisions:
- `sms_sequences.qstash_message_ids` (was `bullmq_job_ids` before migration 002)
- `contacts.lead_score` (1–10, set by AI from call transcript — migration 006)
- `tenants.ai_voice`, `ai_greeting`, `ai_call_hours`, `ai_transfer_number` (migration 005)
- `job_notes` table added in migration 004

## Environment Variables (`hvac-saas/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PLAN1 / PLAN2 / PLAN3
TWILIO_ACCOUNT_SID / AUTH_TOKEN / PHONE_NUMBER
QSTASH_TOKEN / QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY
BLAND_API_KEY
CALCOM_API_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
```
