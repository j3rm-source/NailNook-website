"""
Upwork Job Scraper

Scrapes Upwork job postings via Apify (actor: apify/upwork-scraper).
Filters by keyword and budget, outputs JSON for proposal generation.

Usage:
    python3 skills/upwork-apply/scripts/scrape_upwork.py \
        --query "email marketing automation" \
        --max_items 20 \
        --min_budget 500 \
        --output .tmp/upwork_jobs.json
"""

import os
import sys
import json
import argparse
import logging
import time
import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("upwork-scraper")

APIFY_BASE = "https://api.apify.com/v2"


def scrape_upwork(query: str, max_items: int, min_budget: float) -> list[dict]:
    """Run Apify upwork-scraper actor and return job listings."""
    token = os.getenv("APIFY_API_TOKEN")
    if not token:
        raise RuntimeError("APIFY_API_TOKEN not set in .env")

    # Start the actor run
    run_url = f"{APIFY_BASE}/acts/apify~upwork-scraper/runs"
    payload = {
        "searchQuery": query,
        "maxItems": max_items,
        "jobType": "hourly,fixed",
        "proxy": {"useApifyProxy": True}
    }

    headers = {"Content-Type": "application/json"}
    resp = requests.post(
        f"{run_url}?token={token}",
        headers=headers,
        json=payload,
        timeout=30
    )

    if resp.status_code not in [200, 201]:
        raise RuntimeError(f"Apify start error {resp.status_code}: {resp.text}")

    run_data = resp.json()
    run_id = run_data["data"]["id"]
    dataset_id = run_data["data"]["defaultDatasetId"]
    logger.info(f"Apify run started: {run_id}")

    # Poll until finished
    status_url = f"{APIFY_BASE}/actor-runs/{run_id}?token={token}"
    for attempt in range(120):
        time.sleep(5)
        status_resp = requests.get(status_url, timeout=15)
        status = status_resp.json()["data"]["status"]
        logger.info(f"Run status: {status} ({attempt * 5}s elapsed)")

        if status == "SUCCEEDED":
            break
        elif status in ("FAILED", "ABORTED", "TIMED-OUT"):
            raise RuntimeError(f"Apify run failed with status: {status}")
    else:
        raise RuntimeError("Apify run timed out after 10 minutes")

    # Fetch results
    dataset_url = f"{APIFY_BASE}/datasets/{dataset_id}/items?token={token}&limit={max_items}"
    items_resp = requests.get(dataset_url, timeout=30)
    jobs = items_resp.json()

    # Normalize fields
    normalized = []
    for job in jobs:
        budget = job.get("budget", {})
        if isinstance(budget, dict):
            amount = budget.get("amount") or budget.get("maximum") or 0
        else:
            amount = float(budget) if budget else 0

        if amount and amount < min_budget:
            continue

        normalized.append({
            "title": job.get("title", ""),
            "description": job.get("description", "")[:3000],
            "url": job.get("url", ""),
            "budget": amount,
            "job_type": job.get("jobType", ""),
            "skills": job.get("skills", []),
            "client_country": job.get("clientCountry", ""),
            "client_total_spent": job.get("clientTotalSpent", 0),
            "client_hires": job.get("clientHires", 0),
            "posted_at": job.get("createdOn", ""),
            "proposals": job.get("proposalsTier", ""),
        })

    logger.info(f"Found {len(normalized)} jobs matching filters")
    return normalized


def main():
    parser = argparse.ArgumentParser(description="Scrape Upwork job listings via Apify")
    parser.add_argument("--query", required=True, help="Search keyword (e.g., 'email marketing automation')")
    parser.add_argument("--max_items", type=int, default=20, help="Max jobs to scrape")
    parser.add_argument("--min_budget", type=float, default=0, help="Minimum budget/rate to include")
    parser.add_argument("--output", default=".tmp/upwork_jobs.json", help="Output JSON file path")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)

    try:
        jobs = scrape_upwork(args.query, args.max_items, args.min_budget)
    except RuntimeError as e:
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)

    with open(args.output, "w") as f:
        json.dump(jobs, f, indent=2)

    logger.info(f"Saved {len(jobs)} jobs to {args.output}")
    print(json.dumps({"status": "success", "jobs_found": len(jobs), "output": args.output}))


if __name__ == "__main__":
    main()
