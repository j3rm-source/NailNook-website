---
name: create-proposal
description: Generate PandaDoc proposals with AI-written scope, deliverables, and pricing. Use when user asks to create a proposal, send a quote, or draft a contract for a client.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# PandaDoc Proposal Creator

## Goal
Generate a polished sales proposal in PandaDoc using Claude to write the copy — executive summary, problem statement, solution, timeline, and investment justification — then create the document via API and optionally send it to the client.

## Inputs
| Parameter | Required | Description |
|-----------|----------|-------------|
| `--client_name` | Yes | Client's full name or company name |
| `--client_email` | Yes | Client email for sending/signing |
| `--service` | Yes | Service being proposed (e.g., "Cold Email Lead Generation") |
| `--pain_points` | Yes | Pipe-separated pain points (e.g., "Not enough leads\|Sales team is idle") |
| `--deliverables` | Yes | Pipe-separated deliverables |
| `--price` | Yes | Total investment in USD |
| `--template_id` | No | PandaDoc template UUID (uses content blocks if omitted) |
| `--send` | No | Flag — send to client immediately after creation |
| `--dry_run` | No | Flag — generate Claude copy only, don't create in PandaDoc |

## Scripts
- `scripts/create_proposal.py` — Generate copy + create PandaDoc document

## Process

### Step 1: Dry run to review the copy
```bash
python3 skills/create-proposal/scripts/create_proposal.py \
  --client_name "John Smith" \
  --client_email "john@acmeplumbing.com" \
  --service "Cold Email Lead Generation" \
  --pain_points "Not enough inbound leads|Sales team is underutilized|No predictable pipeline" \
  --deliverables "500 verified contractor leads|3 Instantly email campaigns|Auto-reply setup|Monthly reporting" \
  --price 2500 \
  --dry_run
```

### Step 2: Create in PandaDoc (without template)
```bash
python3 skills/create-proposal/scripts/create_proposal.py \
  --client_name "John Smith" \
  --client_email "john@acmeplumbing.com" \
  --service "Cold Email Lead Generation" \
  --pain_points "Not enough inbound leads|Sales team is underutilized" \
  --deliverables "500 verified leads|3 email campaigns|Auto-reply setup" \
  --price 2500
```

### Step 3: Create + send immediately
Add `--send` to the command above to dispatch the document for signing right away.

### Using a template
If you have a branded PandaDoc template, pass its UUID:
```bash
python3 skills/create-proposal/scripts/create_proposal.py \
  --client_name "..." \
  --client_email "..." \
  --service "..." \
  --pain_points "..." \
  --deliverables "..." \
  --price 2500 \
  --template_id "abc123-template-uuid"
```
Template must have token placeholders: `{{client_name}}`, `{{executive_summary}}`, `{{problem_statement}}`, `{{proposed_solution}}`, `{{timeline}}`, `{{investment_justification}}`, `{{next_steps}}`, `{{total_price}}`, `{{sender_name}}`.

## Output
```json
{
  "status": "success",
  "document_id": "abc123",
  "document_name": "Proposal — John Smith",
  "share_link": "https://app.pandadoc.com/s/...",
  "sent": false
}
```

## Environment
```
PANDADOC_API_KEY=your_api_key         # from app.pandadoc.com/integrations
ANTHROPIC_API_KEY=your_key
SENDER_NAME=Your Name                  # optional — default sender identity
SENDER_EMAIL=you@yourdomain.com
SENDER_COMPANY=Your Company
```

## Get your PandaDoc API key
Settings → Integrations → API → Developer API key

## Notes
- Without a template, the script builds a full document from content blocks (heading, text, pricing table, signature)
- Pricing table splits the total evenly across deliverables — adjust manually in PandaDoc if needed
- Document must be in `document.draft` status before it can be sent; script polls for up to 30 seconds
