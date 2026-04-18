# Setup & Prerequisites

## Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- [Modal](https://modal.com/) account (for cloud webhooks)
- Google Cloud project with OAuth credentials (for Gmail/Sheets skills)

## Installation

```bash
cd "Claude Skills Demo"
pip install -r requirements.txt
npm install
```

## Environment Variables

```bash
cp .env.example .env
```

Edit `.env` — only fill in what you need:
- `ANTHROPIC_API_KEY` — Required
- `APIFY_API_TOKEN` — For lead scraping skills
- `INSTANTLY_API_KEY` — For cold email campaigns
- `PANDADOC_API_KEY` — For proposal generation
- `OPENAI_API_KEY` — For embeddings in RAG pipeline
- `PINECONE_API_KEY` — For vector search in RAG
- See `.env.example` for the full list

## Gmail Setup (optional)

```bash
cp gmail_accounts.json.example gmail_accounts.json
```

1. Create OAuth credentials in Google Cloud Console (Desktop app type)
2. Download as `credentials.json`
3. Edit `gmail_accounts.json` with your email addresses and token file paths
4. Run any Gmail skill once to complete the OAuth flow and generate token files

## Modal Deploy (optional)

```bash
modal deploy execution/modal_webhook.py
```

Update the webhook URLs in this file and SKILL.md files with your Modal username.
