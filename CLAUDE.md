# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

---

## Architecture

This system separates probabilistic decision-making (Claude) from deterministic execution (scripts).

**Layer 1 — Skills** (`skills/`)
Each skill = `SKILL.md` (intent + process) + `scripts/` folder. Skills are self-contained — each bundles its own copies of shared helpers (e.g. `update_sheet.py`). Claude reads the SKILL.md, runs the scripts in order, handles errors, and updates the SKILL.md with any learnings.

**Layer 2 — Orchestration**
That's you. Your job: read the right SKILL.md, run bundled scripts in the right order, route between skills, and update them when you learn something new.

## Skills

| Skill | Trigger |
|-------|---------|
| `scrape-leads` | Find leads via Apify; industry + location + count → Google Sheet |
| `googlemaps-scraper` | Google Maps B2B scrape with website enrichment → Google Sheet |
| `classify-leads` | LLM classification of leads (e.g. product SaaS vs agency) |
| `instantly-autoreply` | Auto-reply to incoming Instantly email threads via Claude |
| `instantly-campaigns` | Create 3 cold email campaigns in Instantly with AI-written sequences |
| `create-proposal` | Generate PandaDoc proposal with Claude-written copy; optionally send for signing |
| `upwork-apply` | Scrape Upwork jobs, score for fit, write tailored proposals → Markdown |
| `onboarding-kickoff` | Full post-kickoff automation: leads → campaigns → auto-reply setup |
| `design-website` | Generate single-page HTML mockup for a prospect (buildinamsterdam.com style) |
| `frontend-webdesign` | Build any frontend UI — components, pages, full apps |
| `add-webhook` | Create new Modal webhook endpoints |

Run scripts from the project root (the directory containing this CLAUDE.md):
```bash
python3 skills/scrape-leads/scripts/scrape_apify.py --query "Plumbers" --location "Texas" --max_items 25 --output .tmp/test.json
```

## Subagents (`Agents/`)

Three subagents, each with a self-contained context. All are **read-only reporters** — they never modify files. The parent agent applies all fixes.

- `code-reviewer` — Zero-context code review. Returns PASS / PASS WITH NOTES / NEEDS CHANGES.
- `qa` — Generates and runs tests, reports pass/fail.
- `research` — Deep research via web + file reads without polluting parent context.

**Design & build workflow for non-trivial code changes:**
1. Write/edit the code
2. Spawn `code-reviewer` and `qa` in parallel (`run_in_background: true`)
3. Read both reports, apply all fixes in the parent agent
4. Ship only after both pass

## Operating Principles

**Self-anneal:** When a script breaks — read the error, fix the script, test it, update the SKILL.md. Never leave a broken path undocumented.

**Update Skills as you learn:** SKILL.md files are living documents. When you discover API constraints, better approaches, or edge cases — update the relevant SKILL.md. Don't create new Skills without asking.

**Output convention:** Local files in `.tmp/` are intermediates only. The only deliverable is a cloud URL (Google Sheet, Slides, etc.).

## Setup

Launch Claude Code from the project root (the directory containing this CLAUDE.md). All script paths are relative to that directory.

```bash
pip install -r requirements.txt
```

Edit `.env` in the project root with the keys you need.

## File Layout

```
skills/           # Skills (SKILL.md + scripts/) — each skill is self-contained
Agents/           # Subagent definitions (code-reviewer, qa, research)
rules/            # Modular rule files (loaded automatically by Claude Code)
nailnook/         # Static HTML/CSS site for NailNook client — edit directly, no build step
nailnook-booking/ # Next.js booking app for NailNook — separate deliverable
Scheduale page/   # Generic Next.js booking app template — separate deliverable
.tmp/             # Temporary intermediates — never commit
.env              # API keys
```

## Environment Variables

Required keys per skill area (set in `.env`):
- `ANTHROPIC_API_KEY` — All skills
- `APIFY_API_TOKEN` — `scrape-leads`, `googlemaps-scraper`
- `INSTANTLY_API_KEY` — `instantly-autoreply`, `onboarding-kickoff`
- `ANYMAILFINDER_API_KEY` — `scrape-leads` email enrichment
- `PANDADOC_API_KEY` — `create-proposal`
- `OPENAI_API_KEY` — embeddings in RAG-based skills
- `PINECONE_API_KEY` / `PINECONE_INDEX` — vector search in RAG-based skills
- `UNSPLASH_ACCESS_KEY` — `design-website` (falls back to picsum.photos if absent)
- Google OAuth (`credentials.json`, `token.json`) — any Sheets-writing skill

---

## NailNook Static Site (`nailnook/`)

Static HTML/CSS client site. Edit files directly — no build step. Pages: `index.html`, `booking.html`, `services.html`, `team.html`.

---

## NailNook Booking App (`nailnook-booking/`)

A Next.js booking app for NailNook (Next.js 14, React, TypeScript, Tailwind, Supabase, Twilio). No relation to the skills system — it's a separate deliverable.

### Dev commands (run from inside `nailnook-booking/`)
```bash
npm run dev      # start dev server on :3000
npm run build    # production build
npm run lint     # ESLint
```

### Architecture
- **Public booking flow** (`/`) — multi-step wizard: pick service → pick staff → pick date/time → enter info → confirm. State managed in `BookingFlow` component (`src/components/booking/`).
- **Staff portal** (`/staff/login`, `/staff/dashboard`) — PIN-based auth; staff view their own upcoming bookings.
- **Admin panel** (`/admin`) — manage staff, services, availability, and all bookings.
- **API routes** (`src/app/api/`) — all DB writes go server-side; browser uses the anon Supabase client (RLS enforced), API routes use the service-role admin client (`createAdminClient()` in `src/lib/supabase.ts`).
- **Twilio** (`src/lib/twilio.ts`) — SMS confirmations/reminders triggered from API routes.
- **Auth** (`src/lib/auth.ts`) — session stored in a cookie; PIN is bcrypt-hashed in the DB.

### Key types (`src/lib/types.ts`)
`Staff`, `Service`, `Availability`, `Booking`, `TimeSlot`, `AvailableDate`, `BookingCreatePayload`

### Environment variables (add to `nailnook-booking/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — server-side admin client (never expose to browser)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — SMS
- `NEXT_PUBLIC_BUSINESS_NAME` / `NEXT_PUBLIC_BUSINESS_TAGLINE` — branding

### DB schema
Migrations live in `nailnook-booking/supabase/migrations/`. Seed data in `supabase/seed.sql`.

---

## Scheduale Page (`Scheduale page/`)

A generic Next.js booking app template (Next.js 15, React 19, TypeScript, Tailwind, Supabase, Twilio). Same architecture as `nailnook-booking/` but a separate deliverable.

### Dev commands (run from inside `Scheduale page/`)
```bash
npm run dev      # start dev server on :3000
npm run build    # production build
npm run lint     # ESLint
```

### Architecture
Same pattern as `nailnook-booking/`: public booking wizard → staff portal (PIN auth) → admin panel. API routes use service-role Supabase client; browser uses anon client with RLS.

### Environment variables (add to `Scheduale page/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_BUSINESS_NAME` / `NEXT_PUBLIC_BUSINESS_TAGLINE`

### DB schema
Migrations live in `Scheduale page/supabase/migrations/`. Seed data in `seed.sql`.
