"""
Upwork Proposal Generator

Reads scraped Upwork jobs, filters for best fit, and uses Claude to write
tailored proposals. Saves proposals to a markdown file for review.

Usage:
    python3 skills/upwork-apply/scripts/generate_proposals.py \
        --jobs .tmp/upwork_jobs.json \
        --profile "We build cold email systems for local service businesses..." \
        --top_n 5 \
        --output .tmp/upwork_proposals.md
"""

import os
import json
import argparse
import logging
from pathlib import Path
import anthropic
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("upwork-proposals")


def score_and_filter_jobs(jobs: list[dict], profile: str, top_n: int) -> list[dict]:
    """Use Claude to score jobs for fit and return the top N."""
    if not jobs:
        return []

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    jobs_summary = json.dumps([
        {"index": i, "title": j["title"], "description": j["description"][:800], "budget": j["budget"], "skills": j["skills"]}
        for i, j in enumerate(jobs)
    ], indent=2)

    prompt = f"""Score these Upwork jobs for fit with our profile.

OUR PROFILE:
{profile}

JOBS:
{jobs_summary}

Score each job 1-10 based on:
- Alignment with our skills and experience
- Budget quality (higher = better)
- Description clarity (vague jobs = harder to win)
- Client quality (total spent, hire rate)

Output a JSON array of the top {top_n} job indices, best first:
{{"top_jobs": [2, 0, 4, ...]}}

Only include jobs scoring 6+. Output ONLY the JSON."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.content[0].text.strip()
    if "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
        if text.startswith("json"):
            text = text[4:].strip()

    result = json.loads(text)
    top_indices = result.get("top_jobs", [])[:top_n]
    return [jobs[i] for i in top_indices if i < len(jobs)]


def generate_proposal(job: dict, profile: str, tone_examples: str = "") -> str:
    """Generate a tailored proposal for a single job."""
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    prompt = f"""Write a winning Upwork proposal for this job.

JOB TITLE: {job['title']}
JOB DESCRIPTION:
{job['description']}

OUR PROFILE / CREDENTIALS:
{profile}

{f"TONE EXAMPLES (match this style):{chr(10)}{tone_examples}" if tone_examples else ""}

PROPOSAL RULES:
- Open with a line that shows you read and understood their specific problem (no "Hello, I'm a...")
- 150-250 words total
- Mention 1-2 specific things from their job description
- Include a relevant result or credential from our profile
- End with a clear, low-friction CTA (e.g., "Want to hop on a 15-min call?")
- Conversational, confident, zero corporate speak
- No bullet points — flowing prose

Write the proposal now. Just the proposal text, nothing else."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()


def main():
    parser = argparse.ArgumentParser(description="Generate Upwork proposals from scraped jobs")
    parser.add_argument("--jobs", required=True, help="Path to scraped jobs JSON file")
    parser.add_argument("--profile", required=True, help="Your profile/background description")
    parser.add_argument("--top_n", type=int, default=5, help="Number of top jobs to apply to")
    parser.add_argument("--tone_examples", default="", help="Path to .txt file with example proposals for tone")
    parser.add_argument("--output", default=".tmp/upwork_proposals.md", help="Output markdown file")
    args = parser.parse_args()

    with open(args.jobs) as f:
        jobs = json.load(f)

    logger.info(f"Loaded {len(jobs)} jobs")

    # Load tone examples if provided
    tone_examples = ""
    if args.tone_examples and Path(args.tone_examples).exists():
        tone_examples = Path(args.tone_examples).read_text()

    # Score and filter
    logger.info(f"Scoring jobs for fit (top {args.top_n})...")
    top_jobs = score_and_filter_jobs(jobs, args.profile, args.top_n)
    logger.info(f"Selected {len(top_jobs)} jobs")

    if not top_jobs:
        logger.warning("No jobs scored high enough — try broadening your search or adjusting the profile")
        return

    # Generate proposals
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    output_lines = [f"# Upwork Proposals\n\nGenerated {len(top_jobs)} proposals.\n\n---\n"]

    for i, job in enumerate(top_jobs, 1):
        logger.info(f"Writing proposal {i}/{len(top_jobs)}: {job['title']}")
        proposal = generate_proposal(job, args.profile, tone_examples)

        output_lines.append(f"## {i}. {job['title']}")
        if job.get("url"):
            output_lines.append(f"**Link:** {job['url']}")
        if job.get("budget"):
            output_lines.append(f"**Budget:** ${job['budget']:,.0f}")
        if job.get("proposals"):
            output_lines.append(f"**Competing proposals:** {job['proposals']}")
        output_lines.append(f"\n**Proposal:**\n\n{proposal}\n\n---\n")

    Path(args.output).write_text("\n".join(output_lines))
    logger.info(f"Saved proposals to {args.output}")
    print(json.dumps({
        "status": "success",
        "proposals_written": len(top_jobs),
        "output": args.output
    }, indent=2))


if __name__ == "__main__":
    main()
