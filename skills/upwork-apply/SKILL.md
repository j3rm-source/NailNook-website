---
name: upwork-apply
description: Scrape Upwork job postings and generate tailored proposals using Claude. Use when user asks to find Upwork jobs, write proposals, or automate Upwork outreach.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Upwork Proposal Generator

## Goal
Scrape Upwork for relevant job postings, score them for fit, and generate tailored proposals using Claude. Output is a markdown file with ready-to-paste proposals.

## Inputs
| Parameter | Required | Description |
|-----------|----------|-------------|
| `--query` | Yes | Job search keyword (e.g., "cold email automation") |
| `--profile` | Yes | Your background, credentials, and results |
| `--max_items` | No | Jobs to scrape (default: 20) |
| `--min_budget` | No | Minimum budget in USD (filters out low-value jobs) |
| `--top_n` | No | Number of proposals to write (default: 5) |
| `--tone_examples` | No | Path to .txt file with your past winning proposals |

## Scripts
- `scripts/scrape_upwork.py` — Scrape Upwork via Apify → JSON
- `scripts/generate_proposals.py` — Score jobs for fit + write proposals → Markdown

## Process

### Step 1: Scrape jobs
```bash
python3 skills/upwork-apply/scripts/scrape_upwork.py \
  --query "cold email lead generation" \
  --max_items 25 \
  --min_budget 500 \
  --output .tmp/upwork_jobs.json
```

### Step 2: Generate proposals
```bash
python3 skills/upwork-apply/scripts/generate_proposals.py \
  --jobs .tmp/upwork_jobs.json \
  --profile "We build cold email outreach systems for local service businesses. We've generated 50,000+ leads via Google Maps scraping and Instantly campaigns. Past clients: HVAC, roofing, plumbing contractors. Typical results: 20-50 booked calls per month." \
  --top_n 5 \
  --output .tmp/upwork_proposals.md
```

### Step 3: Review and submit
Read `.tmp/upwork_proposals.md` — each section has the job link, budget, and proposal copy ready to paste into Upwork.

### Optional: Match tone to winning proposals
Save your past proposals to `.tmp/upwork_tone_examples.txt` and pass:
```bash
  --tone_examples .tmp/upwork_tone_examples.txt
```

## Output
`.tmp/upwork_proposals.md` — structured markdown with one section per job:
```
## 1. Job Title
Link: https://upwork.com/...
Budget: $1,500
Competing proposals: 5-10

**Proposal:**
[Ready-to-paste proposal text]
```

## Environment
```
APIFY_API_TOKEN=your_token    # for scraping
ANTHROPIC_API_KEY=your_key    # for scoring + writing
```

## Notes
- Apify's upwork-scraper actor is community-maintained — if it breaks, check https://apify.com/apify/upwork-scraper for updates
- Scraping takes ~2-5 minutes depending on result count
- Claude scores jobs 1-10 for fit against your profile; only 6+ make it through
- Proposals are 150-250 words, written to open with the client's specific problem (highest-converting format on Upwork)
- Submitting proposals is manual — Upwork's ToS prohibit automated submission
