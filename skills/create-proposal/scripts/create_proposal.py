"""
PandaDoc Proposal Creator

Generates a tailored sales proposal via PandaDoc API using Claude to write
the scope, pricing, and custom sections.

Usage:
    python3 skills/create-proposal/scripts/create_proposal.py \
        --client_name "Acme Corp" \
        --client_email "john@acme.com" \
        --service "Cold Email Lead Generation" \
        --pain_points "Not enough leads|Sales team is idle" \
        --deliverables "500 verified leads|3 email campaigns|Auto-reply setup" \
        --price 2500 \
        --template_id "YOUR_PANDADOC_TEMPLATE_ID"  # optional
"""

import os
import sys
import json
import argparse
import logging
import time
import requests
import anthropic
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("create-proposal")

PANDADOC_API_BASE = "https://api.pandadoc.com/public/v1"


def generate_proposal_content(
    client_name: str,
    service: str,
    pain_points: list[str],
    deliverables: list[str],
    price: float,
    sender_name: str,
    sender_company: str,
) -> dict:
    """Use Claude to generate proposal copy sections."""
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    pain_text = "\n".join(f"- {p}" for p in pain_points)
    deliverable_text = "\n".join(f"- {d}" for d in deliverables)

    prompt = f"""Write a concise, professional sales proposal for:

CLIENT: {client_name}
SERVICE: {service}
THEIR PAIN POINTS:
{pain_text}
DELIVERABLES:
{deliverable_text}
INVESTMENT: ${price:,.0f}
FROM: {sender_name} at {sender_company}

Generate these sections as JSON:

{{
  "executive_summary": "2-3 sentences. Lead with their problem, pivot to your solution. No fluff.",
  "problem_statement": "1 paragraph. Articulate their situation better than they can. Show you understand.",
  "proposed_solution": "2-3 paragraphs. Explain what you'll do and why it works. Be specific.",
  "deliverables": [
    {{"item": "Deliverable name", "description": "One sentence on what this is and why it matters"}}
  ],
  "timeline": "Brief timeline overview (e.g., 'Week 1: setup and lead generation. Week 2: campaign launch. Ongoing: auto-reply management.')",
  "investment_justification": "1-2 sentences on ROI or value relative to the price.",
  "next_steps": "2-3 bullet points on what happens after they sign."
}}

Output ONLY the JSON. No other text."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text.strip())


def create_document_from_template(
    template_id: str,
    client_name: str,
    client_email: str,
    content: dict,
    price: float,
    sender_name: str,
    sender_email: str,
) -> dict:
    """Create a PandaDoc document from an existing template."""
    api_key = os.getenv("PANDADOC_API_KEY")
    headers = {
        "Authorization": f"API-Key {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": f"Proposal — {client_name}",
        "template_uuid": template_id,
        "recipients": [
            {"email": client_email, "first_name": client_name.split()[0], "last_name": " ".join(client_name.split()[1:]), "role": "Client"}
        ],
        "tokens": [
            {"name": "client_name", "value": client_name},
            {"name": "executive_summary", "value": content["executive_summary"]},
            {"name": "problem_statement", "value": content["problem_statement"]},
            {"name": "proposed_solution", "value": content["proposed_solution"]},
            {"name": "timeline", "value": content["timeline"]},
            {"name": "investment_justification", "value": content["investment_justification"]},
            {"name": "next_steps", "value": "\n".join(f"• {s}" for s in content["next_steps"]) if isinstance(content["next_steps"], list) else content["next_steps"]},
            {"name": "total_price", "value": f"${price:,.0f}"},
            {"name": "sender_name", "value": sender_name},
            {"name": "sender_email", "value": sender_email},
        ],
        "fields": {
            "investment": {"value": price, "currency": "USD"}
        }
    }

    resp = requests.post(f"{PANDADOC_API_BASE}/documents", headers=headers, json=payload, timeout=30)
    if resp.status_code not in [200, 201]:
        raise RuntimeError(f"PandaDoc create error {resp.status_code}: {resp.text}")
    return resp.json()


def create_document_from_scratch(
    client_name: str,
    client_email: str,
    service: str,
    content: dict,
    deliverables: list[str],
    price: float,
    sender_name: str,
    sender_email: str,
    sender_company: str,
) -> dict:
    """Create a PandaDoc document built entirely from content blocks."""
    api_key = os.getenv("PANDADOC_API_KEY")
    headers = {
        "Authorization": f"API-Key {api_key}",
        "Content-Type": "application/json"
    }

    # Build deliverable rows for pricing table
    pricing_items = []
    for i, d in enumerate(deliverables):
        pricing_items.append({
            "options": {"optional": False, "optional_selected": True, "qty_editable": False},
            "data": {
                "name": d,
                "description": content["deliverables"][i]["description"] if i < len(content["deliverables"]) else "",
                "price": round(price / len(deliverables), 2),
                "qty": 1,
                "discount": {"value": 0, "type": "absolute"},
                "tax_first": {"value": 0, "type": "percent"}
            }
        })

    payload = {
        "name": f"Proposal — {client_name}",
        "recipients": [
            {
                "email": client_email,
                "first_name": client_name.split()[0],
                "last_name": " ".join(client_name.split()[1:]) or ".",
                "role": "Client"
            }
        ],
        "content": [
            {"type": "heading", "data": {"text": f"Proposal: {service}", "level": 1}},
            {"type": "text", "data": {"text": f"Prepared for {client_name} by {sender_name} · {sender_company}"}},
            {"type": "heading", "data": {"text": "Executive Summary", "level": 2}},
            {"type": "text", "data": {"text": content["executive_summary"]}},
            {"type": "heading", "data": {"text": "The Challenge", "level": 2}},
            {"type": "text", "data": {"text": content["problem_statement"]}},
            {"type": "heading", "data": {"text": "Our Solution", "level": 2}},
            {"type": "text", "data": {"text": content["proposed_solution"]}},
            {"type": "heading", "data": {"text": "Timeline", "level": 2}},
            {"type": "text", "data": {"text": content["timeline"]}},
            {"type": "heading", "data": {"text": "Investment", "level": 2}},
            {
                "type": "table",
                "data": {
                    "headers": [
                        {"text": "Deliverable"},
                        {"text": "Description"},
                        {"text": "Price"}
                    ],
                    "rows": pricing_items
                }
            },
            {"type": "text", "data": {"text": content["investment_justification"]}},
            {"type": "heading", "data": {"text": "Next Steps", "level": 2}},
            {"type": "text", "data": {"text": "\n".join(f"• {s}" for s in content["next_steps"]) if isinstance(content["next_steps"], list) else content["next_steps"]}},
            {
                "type": "signature",
                "data": {
                    "block_id": "client_sig",
                    "role": "Client",
                    "placeholder_text": "Client Signature"
                }
            }
        ],
        "metadata": {"service": service}
    }

    resp = requests.post(f"{PANDADOC_API_BASE}/documents", headers=headers, json=payload, timeout=30)
    if resp.status_code not in [200, 201]:
        raise RuntimeError(f"PandaDoc create error {resp.status_code}: {resp.text}")
    return resp.json()


def wait_for_document(doc_id: str, max_wait: int = 30) -> str:
    """Poll until document status is 'document.draft' then return share link."""
    api_key = os.getenv("PANDADOC_API_KEY")
    headers = {"Authorization": f"API-Key {api_key}"}

    for _ in range(max_wait):
        resp = requests.get(f"{PANDADOC_API_BASE}/documents/{doc_id}", headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            status = data.get("status", "")
            if status in ("document.draft", "document.sent"):
                return data.get("links", [{}])[0].get("href", "")
        time.sleep(1)

    return ""


def send_document(doc_id: str, message: str = "") -> bool:
    """Send the document to the recipient for signing."""
    api_key = os.getenv("PANDADOC_API_KEY")
    headers = {
        "Authorization": f"API-Key {api_key}",
        "Content-Type": "application/json"
    }

    payload = {"message": message or "Please review and sign the attached proposal."}
    resp = requests.post(f"{PANDADOC_API_BASE}/documents/{doc_id}/send", headers=headers, json=payload, timeout=15)
    return resp.status_code in [200, 201, 204]


def main():
    parser = argparse.ArgumentParser(description="Create a PandaDoc proposal")
    parser.add_argument("--client_name", required=True)
    parser.add_argument("--client_email", required=True)
    parser.add_argument("--service", required=True, help="Service being proposed (e.g., 'Cold Email Lead Generation')")
    parser.add_argument("--pain_points", required=True, help="Pipe-separated pain points")
    parser.add_argument("--deliverables", required=True, help="Pipe-separated deliverables")
    parser.add_argument("--price", required=True, type=float, help="Total investment amount in USD")
    parser.add_argument("--template_id", default="", help="PandaDoc template UUID (optional)")
    parser.add_argument("--sender_name", default=os.getenv("SENDER_NAME", "Your Name"))
    parser.add_argument("--sender_email", default=os.getenv("SENDER_EMAIL", "you@yourdomain.com"))
    parser.add_argument("--sender_company", default=os.getenv("SENDER_COMPANY", "Your Company"))
    parser.add_argument("--send", action="store_true", help="Send document to client after creation")
    parser.add_argument("--dry_run", action="store_true", help="Generate content only, don't create in PandaDoc")
    args = parser.parse_args()

    if not os.getenv("PANDADOC_API_KEY") and not args.dry_run:
        print(json.dumps({"status": "error", "error": "PANDADOC_API_KEY not set in .env"}))
        sys.exit(1)

    pain_points = [p.strip() for p in args.pain_points.split("|") if p.strip()]
    deliverables = [d.strip() for d in args.deliverables.split("|") if d.strip()]

    logger.info("Generating proposal content with Claude...")
    content = generate_proposal_content(
        client_name=args.client_name,
        service=args.service,
        pain_points=pain_points,
        deliverables=deliverables,
        price=args.price,
        sender_name=args.sender_name,
        sender_company=args.sender_company,
    )

    if args.dry_run:
        print(json.dumps({"status": "dry_run", "content": content}, indent=2))
        return

    logger.info("Creating document in PandaDoc...")
    try:
        if args.template_id:
            doc = create_document_from_template(
                template_id=args.template_id,
                client_name=args.client_name,
                client_email=args.client_email,
                content=content,
                price=args.price,
                sender_name=args.sender_name,
                sender_email=args.sender_email,
            )
        else:
            doc = create_document_from_scratch(
                client_name=args.client_name,
                client_email=args.client_email,
                service=args.service,
                content=content,
                deliverables=deliverables,
                price=args.price,
                sender_name=args.sender_name,
                sender_email=args.sender_email,
                sender_company=args.sender_company,
            )
    except RuntimeError as e:
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)

    doc_id = doc.get("uuid") or doc.get("id", "")
    logger.info(f"Document created: {doc_id}")

    # Wait for processing and get link
    share_link = wait_for_document(doc_id)

    result = {
        "status": "success",
        "document_id": doc_id,
        "document_name": doc.get("name", ""),
        "share_link": share_link,
        "sent": False
    }

    if args.send:
        sent = send_document(doc_id)
        result["sent"] = sent
        logger.info(f"Document sent: {sent}")

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
