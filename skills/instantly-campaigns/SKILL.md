---
name: instantly-campaigns
description: Create cold email campaigns in Instantly with AI-generated sequences. Use when user asks to create campaigns, write cold email sequences, or set up outreach for a client.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Instantly Campaign Creator

## Goal
Generate and create 3 cold email campaigns in Instantly — one per offer — using Claude to write the sequences. Each campaign has A/B tested first step + 2 follow-ups.

## Inputs
| Parameter | Required | Description |
|-----------|----------|-------------|
| `--client_name` | Yes | Company or client name |
| `--client_description` | Yes | What they do and who they serve |
| `--offers` | No | Pipe-separated offers (auto-generated if omitted) |
| `--target_audience` | No | Who's being targeted (default: "Business owners and decision makers") |
| `--social_proof` | No | Credentials, results, testimonials |
| `--dry_run` | No | Generate without creating in Instantly |

## Scripts
- `scripts/instantly_create_campaigns.py` — Full pipeline: generate → create in Instantly

## Process

### Step 1: Run the campaign creator
```bash
python3 skills/instantly-campaigns/scripts/instantly_create_campaigns.py \
  --client_name "Acme Plumbing" \
  --client_description "Local plumbing contractor serving residential and commercial clients in Austin TX" \
  --offers "Free drain inspection|Emergency same-day service guarantee|Commercial maintenance contract" \
  --target_audience "Property managers and homeowners in Austin TX" \
  --social_proof "500+ 5-star reviews, licensed master plumber, 24/7 availability"
```

### Step 2 (optional): Dry run first to review emails
```bash
python3 skills/instantly-campaigns/scripts/instantly_create_campaigns.py \
  --client_name "..." \
  --client_description "..." \
  --dry_run
```

### Step 3: Add examples for better output (optional)
Place campaign examples in `.tmp/instantly_campaign_examples/campaigns.md` — Claude will use them for tone and structure reference.

## Output
```json
{
  "status": "success",
  "campaigns_created": 3,
  "campaign_ids": ["id1", "id2", "id3"],
  "campaign_names": ["ClientName | Offer 1", "ClientName | Offer 2", "ClientName | Offer 3"]
}
```

## Environment
```
INSTANTLY_API_KEY=your_v2_key   # from app.instantly.ai/app/settings/integrations
ANTHROPIC_API_KEY=your_key
```

## Notes
- Uses `claude-opus-4-5` with extended thinking for higher-quality email copy
- Automatically converts newlines to HTML paragraphs (Instantly strips plain text)
- Rate limiting: 2s delay between campaign creations; auto-retries once on 429
- Default schedule: weekdays 9am–5pm CT, 50 emails/day, stop on reply
