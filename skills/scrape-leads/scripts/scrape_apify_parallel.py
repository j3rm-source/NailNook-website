#!/usr/bin/env python3
"""
Parallel lead scraping using Apify with geographic partitioning.
Splits by location to avoid extra Apify costs while maintaining speed.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv
from apify_client import ApifyClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import time

load_dotenv()

# United States (4-way split)
US_REGIONS = {
    "northeast": ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "Rhode Island",
                  "Vermont", "New Jersey", "New York", "Pennsylvania"],
    "southeast": ["Delaware", "Florida", "Georgia", "Maryland", "North Carolina",
                  "South Carolina", "Virginia", "West Virginia", "Alabama", "Kentucky",
                  "Mississippi", "Tennessee", "Arkansas", "Louisiana", "Oklahoma", "Texas"],
    "midwest": ["Illinois", "Indiana", "Michigan", "Ohio", "Wisconsin", "Iowa",
                "Kansas", "Minnesota", "Missouri", "Nebraska", "North Dakota", "South Dakota"],
    "west": ["Arizona", "Colorado", "Idaho", "Montana", "Nevada", "New Mexico", "Utah",
             "Wyoming", "Alaska", "California", "Hawaii", "Oregon", "Washington"]
}

# United States metros (8-way split)
US_METROS = [
    ["New York", "New Jersey", "Philadelphia", "Boston"],
    ["Los Angeles", "San Francisco", "San Diego", "San Jose"],
    ["Chicago", "Detroit", "Minneapolis", "Cleveland"],
    ["Dallas", "Houston", "Austin", "San Antonio"],
    ["Atlanta", "Miami", "Charlotte", "Tampa"],
    ["Phoenix", "Denver", "Las Vegas", "Seattle"],
    ["Washington DC", "Baltimore", "Virginia Beach"],
    ["Portland", "Sacramento", "Salt Lake City"]
]

# European Union (4-way split)
EU_REGIONS = {
    "western": ["Germany", "France", "Netherlands", "Belgium", "Luxembourg", "Austria", "Switzerland"],
    "southern": ["Spain", "Italy", "Portugal", "Greece", "Malta", "Cyprus"],
    "northern": ["Denmark", "Sweden", "Finland", "Norway", "Iceland", "Ireland"],
    "eastern": ["Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Slovakia",
                "Slovenia", "Croatia", "Estonia", "Latvia", "Lithuania"]
}

# United Kingdom (4-way split)
UK_REGIONS = {
    "england_southeast": ["London", "Kent", "Surrey", "Sussex", "Hampshire", "Berkshire", "Essex", "Hertfordshire"],
    "england_north": ["Manchester", "Liverpool", "Leeds", "Sheffield", "Newcastle", "Birmingham", "Nottingham"],
    "scotland_wales": ["Scotland", "Edinburgh", "Glasgow", "Wales", "Cardiff", "Swansea"],
    "england_southwest": ["Bristol", "Cornwall", "Devon", "Somerset", "Gloucestershire", "Dorset"]
}

# Canada (4-way split)
CANADA_REGIONS = {
    "ontario": ["Ontario", "Toronto", "Ottawa", "Mississauga", "Hamilton"],
    "quebec": ["Quebec", "Montreal", "Quebec City", "Laval", "Gatineau"],
    "west": ["British Columbia", "Alberta", "Saskatchewan", "Manitoba", "Vancouver", "Calgary", "Edmonton"],
    "atlantic": ["Nova Scotia", "New Brunswick", "Prince Edward Island", "Newfoundland and Labrador"]
}

# Australia (4-way split)
AUSTRALIA_REGIONS = {
    "nsw": ["New South Wales", "Sydney", "Newcastle", "Wollongong"],
    "victoria_tasmania": ["Victoria", "Melbourne", "Geelong", "Tasmania", "Hobart"],
    "queensland": ["Queensland", "Brisbane", "Gold Coast", "Sunshine Coast", "Cairns"],
    "west_south": ["Western Australia", "Perth", "South Australia", "Adelaide", "Northern Territory"]
}

# Asia-Pacific (8-way split)
APAC_REGIONS = [
    ["Japan", "Tokyo", "Osaka", "Kyoto"],
    ["South Korea", "Seoul", "Busan", "Incheon"],
    ["Singapore"],
    ["Hong Kong"],
    ["India", "Mumbai", "Delhi", "Bangalore", "Hyderabad"],
    ["China", "Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
    ["Southeast Asia", "Thailand", "Vietnam", "Malaysia", "Indonesia", "Philippines"],
    ["Australia", "New Zealand"]
]

# Global/Worldwide (8-way continental split)
GLOBAL_REGIONS = [
    ["United States", "Canada", "Mexico"],
    ["United Kingdom", "Ireland", "France", "Germany", "Netherlands", "Belgium"],
    ["Spain", "Italy", "Portugal", "Greece", "Switzerland", "Austria"],
    ["Poland", "Czech Republic", "Hungary", "Romania", "Scandinavia"],
    ["Australia", "New Zealand", "Singapore", "Hong Kong"],
    ["India", "Pakistan", "Bangladesh"],
    ["China", "Japan", "South Korea", "Taiwan"],
    ["Brazil", "Argentina", "Chile", "Colombia", "Peru"]
]

REGION_MAPS = {
    "united states": US_REGIONS,
    "us": US_REGIONS,
    "usa": US_REGIONS,
    "european union": EU_REGIONS,
    "eu": EU_REGIONS,
    "europe": EU_REGIONS,
    "united kingdom": UK_REGIONS,
    "uk": UK_REGIONS,
    "great britain": UK_REGIONS,
    "canada": CANADA_REGIONS,
    "australia": AUSTRALIA_REGIONS,
}


def scrape_partition(partition_id, query, locations, max_items, company_keywords=None, require_email=False):
    """Run a single Apify scrape for specific locations. Returns (partition_id, results, elapsed_time)."""
    start_time = time.time()

    api_token = os.getenv("APIFY_API_TOKEN")
    if not api_token:
        print(f"[Partition {partition_id}] Error: APIFY_API_TOKEN not found in .env", file=sys.stderr)
        return (partition_id, None, 0)

    client = ApifyClient(api_token)

    # Format locations for Apify (US states get ", us" suffix)
    formatted_locations = []
    for loc in locations:
        loc_lower = loc.lower()
        if ", us" not in loc_lower and loc_lower not in ["united states", "canada", "australia", "uk", "united kingdom"]:
            loc_lower = f"{loc_lower}, us"
        formatted_locations.append(loc_lower)

    run_input = {
        "fetch_count": int(max_items),
        "contact_job_title": [query],
        "company_keywords": company_keywords if company_keywords else [query],
        "contact_location": formatted_locations,
        "language": "en",
    }
    if require_email:
        run_input["email_status"] = ["validated"]

    location_str = ", ".join(locations[:3]) + ("..." if len(locations) > 3 else "")
    print(f"[Partition {partition_id}] Starting: '{query}' in [{location_str}] (limit: {max_items})...")

    try:
        run = client.actor("code_crafter/leads-finder").call(run_input=run_input)
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"[Partition {partition_id}] Error running actor: {e}")
        return (partition_id, None, elapsed)

    if not run:
        elapsed = time.time() - start_time
        print(f"[Partition {partition_id}] Error: Actor run failed to start", file=sys.stderr)
        return (partition_id, None, elapsed)

    results = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    elapsed = time.time() - start_time
    print(f"[Partition {partition_id}] Retrieved {len(results)} leads in {elapsed:.1f}s")
    return (partition_id, results, elapsed)


def generate_lead_hash(lead):
    """Generate a unique hash for deduplication."""
    email = (lead.get("email") or "").strip().lower()
    if email:
        return hashlib.md5(email.encode()).hexdigest()

    identifiers = [
        (lead.get("first_name") or "").strip().lower(),
        (lead.get("last_name") or "").strip().lower(),
        (lead.get("full_name") or "").strip().lower(),
        (lead.get("company_name") or "").strip().lower(),
        (lead.get("company_domain") or "").strip().lower(),
        (lead.get("city") or "").strip().lower(),
        (lead.get("state") or "").strip().lower(),
    ]
    return hashlib.md5("|".join(filter(None, identifiers)).encode()).hexdigest()


def deduplicate_leads(all_results):
    """Deduplicate leads across all partitions."""
    seen_hashes = set()
    unique_leads = []
    duplicate_count = 0

    for lead in all_results:
        lead_hash = generate_lead_hash(lead)
        if lead_hash not in seen_hashes:
            seen_hashes.add(lead_hash)
            unique_leads.append(lead)
        else:
            duplicate_count += 1

    print(f"\nDeduplication: {len(all_results)} total → {duplicate_count} removed → {len(unique_leads)} unique")
    return unique_leads


def scrape_parallel(query, location, total_count, strategy="regions", num_partitions=4, company_keywords=None, require_email=False):
    """
    Run parallel scrapes with geographic partitioning.

    Strategies:
    - "regions": Auto-detect by location (US/EU/UK/Canada/Australia)
    - "metros": 8-way US metro split
    - "apac": 8-way Asia-Pacific split
    - "global": 8-way worldwide split
    """
    workflow_start = time.time()

    if strategy == "regions":
        location_lower = location.lower() if isinstance(location, str) else None
        if location_lower in REGION_MAPS:
            region_map = REGION_MAPS[location_lower]
            location_groups = list(region_map.values())
            num_partitions = len(location_groups)
            print(f"  Region: {location_lower.upper()} ({num_partitions}-way split)")
        else:
            location_groups = list(US_REGIONS.values())
            num_partitions = 4
            print(f"  No region map for '{location}', defaulting to US regions")

    elif strategy == "metros":
        location_groups = US_METROS[:num_partitions] if num_partitions else US_METROS
        num_partitions = len(location_groups)

    elif strategy == "apac":
        location_groups = APAC_REGIONS[:num_partitions] if num_partitions else APAC_REGIONS
        num_partitions = len(location_groups)

    elif strategy == "global":
        location_groups = GLOBAL_REGIONS[:num_partitions] if num_partitions else GLOBAL_REGIONS
        num_partitions = len(location_groups)

    elif isinstance(location, list):
        chunk_size = max(1, len(location) // (num_partitions or 4))
        location_groups = [location[i:i + chunk_size] for i in range(0, len(location), chunk_size)]
        num_partitions = len(location_groups)

    else:
        print(f"Error: Use strategy='regions' or provide location as a list.")
        print(f"Supported auto-regions: {', '.join(REGION_MAPS.keys())}")
        return None, 0, []

    items_per_partition = total_count // num_partitions

    print(f"Parallel scrape: {total_count} leads, {num_partitions} partitions, {items_per_partition} each")
    print()

    all_results = []
    partition_times = []

    with ThreadPoolExecutor(max_workers=num_partitions) as executor:
        futures = [
            (executor.submit(scrape_partition, i + 1, query, locations, items_per_partition, company_keywords, require_email), i + 1, locations)
            for i, locations in enumerate(location_groups[:num_partitions])
        ]

        for future, pid, locations in futures:
            pid, results, elapsed = future.result()
            partition_times.append(elapsed)
            if results:
                location_str = ", ".join(locations[:2]) + ("..." if len(locations) > 2 else "")
                print(f"[Partition {pid}] Done: {len(results)} leads from [{location_str}]")
                all_results.extend(results)
            else:
                print(f"[Partition {pid}] Failed or no results")

    if not all_results:
        print("\nNo results collected")
        return None, 0, partition_times

    unique_leads = deduplicate_leads(all_results)
    total_time = time.time() - workflow_start
    return unique_leads, total_time, partition_times


def save_results(results, output=None, prefix="leads"):
    """Save results to JSON. Uses output path if provided, otherwise timestamped .tmp/ file."""
    if not results:
        print("No results to save.")
        return None

    if output:
        filename = output
        output_dir = os.path.dirname(filename)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        os.makedirs(".tmp", exist_ok=True)
        filename = f".tmp/{prefix}_{timestamp}.json"

    with open(filename, "w") as f:
        json.dump(results, f, indent=2)

    print(f"Results saved to {filename}")
    return filename


def main():
    parser = argparse.ArgumentParser(
        description="Parallel lead scraping with geographic partitioning",
        epilog=f"Supported regions for auto-detection: {', '.join(REGION_MAPS.keys())}"
    )
    parser.add_argument("--query", required=True, help="Search query (e.g., 'Dentist')")
    parser.add_argument("--location", required=True,
                        help="'United States', 'EU', 'UK', 'Canada', 'Australia', or comma-separated cities/states")
    parser.add_argument("--total_count", type=int, required=True, help="Total leads desired")
    parser.add_argument("--strategy", default="regions",
                        choices=["regions", "metros", "apac", "global"],
                        help="Partition strategy (default: regions)")
    parser.add_argument("--partitions", type=int, default=None, help="Number of partitions (auto-set by strategy)")
    parser.add_argument("--output", default=None, help="Output file path (e.g., .tmp/leads.json)")
    parser.add_argument("--output_prefix", default="leads", help="Prefix for auto-generated output filename")
    parser.add_argument("--company_keywords", nargs='+', help="Company keywords to filter")
    parser.add_argument("--no-email-filter", action="store_true", help="Don't filter by validated emails")

    args = parser.parse_args()

    require_email = not args.no_email_filter

    location = args.location
    if "," in location:
        location = [loc.strip() for loc in location.split(",")]
        strategy = "custom"
        num_partitions = args.partitions or 4
    else:
        strategy = args.strategy
        num_partitions = args.partitions

    results, total_time, partition_times = scrape_parallel(
        query=args.query,
        location=location,
        total_count=args.total_count,
        strategy=strategy,
        num_partitions=num_partitions,
        company_keywords=args.company_keywords,
        require_email=require_email,
    )

    if results:
        print(f"\nTotal unique leads: {len(results)}")
        print(f"Total time: {total_time:.1f}s ({total_time/60:.1f} min)")
        print(f"Partition times: {[f'{t:.1f}s' for t in partition_times]}")
        save_results(results, output=args.output, prefix=args.output_prefix)
    else:
        print("\nNo leads found or error occurred.")
        sys.exit(1)


if __name__ == "__main__":
    main()
