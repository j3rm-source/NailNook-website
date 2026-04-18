# File Organization

## Deliverables vs Intermediates

**Deliverables** — Google Sheets, Google Slides, or other cloud-based outputs. These live in cloud services where the user can access them.

**Intermediates** — Temporary files needed during processing. Live in `.tmp/`, never committed.

**Key principle:** Local files are only for processing. Deliverables live in cloud services.

## Directory Structure

```
.claude/skills/     # Skills (SKILL.md + scripts/)
.tmp/               # Intermediate files (never commit)
execution/          # Shared utilities and infrastructure
.env                # Environment variables and API keys
credentials.json    # Google OAuth credentials
token.json          # Google OAuth tokens
```
