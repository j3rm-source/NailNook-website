# Cloud Webhooks (Modal)

The system supports event-driven execution via Modal webhooks.

## Deploy
```bash
modal deploy execution/modal_webhook.py
```

## Endpoints
Replace `your-modal-username` with your Modal username:
- `https://your-modal-username--claude-orchestrator-list-webhooks.modal.run` — List webhooks
- `https://your-modal-username--claude-orchestrator-directive.modal.run?slug={slug}` — Execute skill
- `https://your-modal-username--claude-orchestrator-test-email.modal.run` — Test email

## Available Tools for Webhooks
`send_email`, `read_sheet`, `update_sheet`
