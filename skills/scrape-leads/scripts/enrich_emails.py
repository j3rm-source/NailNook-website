#!/usr/bin/env python3
"""
Enrich missing emails using AnyMailFinder API.
"""

import os
import sys
import json
import argparse
import time
from dotenv import load_dotenv
import gspread
from google.oauth2.credentials import Credentials
from google.oauth2.service_account import Credentials as ServiceAccountCredentials
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def get_credentials():
    """Load Google credentials. Supports OAuth 2.0 and Service Account."""
    creds = None

    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    if creds and creds.expired and creds.refresh_token:
        from google.auth.transport.requests import Request
        try:
            creds.refresh(Request())
        except Exception as e:
            print(f"Error refreshing token: {e}")
            creds = None

    if not creds:
        service_account_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")

        if os.path.exists(service_account_file):
            with open(service_account_file, 'r') as f:
                content = json.load(f)

            if "type" in content and content["type"] == "service_account":
                creds = ServiceAccountCredentials.from_service_account_file(service_account_file, scopes=SCOPES)
            elif "installed" in content:
                from google_auth_oauthlib.flow import InstalledAppFlow
                flow = InstalledAppFlow.from_client_secrets_file(service_account_file, SCOPES)
                creds = flow.run_local_server(port=0)
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())

    return creds


def find_email_with_anymailfinder(first_name, last_name, full_name, company_domain, company_name):
    """Query AnyMailFinder API to find an email."""
    api_key = os.getenv("ANYMAILFINDER_API_KEY")
    if not api_key:
        print("Error: ANYMAILFINDER_API_KEY not found in .env")
        return None

    url = "https://api.anymailfinder.com/v5.1/find-email/person"
    headers = {"Authorization": api_key, "Content-Type": "application/json"}

    body = {}
    if full_name:
        body["full_name"] = full_name
    if first_name:
        body["first_name"] = first_name
    if last_name:
        body["last_name"] = last_name
    if company_domain:
        body["domain"] = company_domain
    if company_name:
        body["company_name"] = company_name

    has_name = full_name or (first_name and last_name)
    has_company = company_domain or company_name
    if not has_name or not has_company:
        return None

    try:
        response = requests.post(url, headers=headers, json=body, timeout=180)
        response.raise_for_status()
        data = response.json()
        if data.get("email") and data.get("email_status") in ["valid", "risky"]:
            return data["email"]
        return None
    except Exception as e:
        print(f"Error querying AnyMailFinder: {e}")
        return None


def create_bulk_search(rows_data):
    """Create a bulk search using AnyMailFinder bulk API. Returns search ID."""
    api_key = os.getenv("ANYMAILFINDER_API_KEY")
    if not api_key:
        return None

    url = "https://api.anymailfinder.com/v5.1/bulk/json"
    headers = {"Authorization": api_key, "Content-Type": "application/json"}

    table_data = [["first_name", "last_name", "full_name", "domain", "company_name"]]
    for row in rows_data:
        table_data.append([
            row.get('first_name', ''),
            row.get('last_name', ''),
            row.get('full_name', ''),
            row.get('company_domain', ''),
            row.get('company_name', '')
        ])

    body = {
        "data": table_data,
        "first_name_field_index": 0,
        "last_name_field_index": 1,
        "full_name_field_index": 2,
        "domain_field_index": 3,
        "company_name_field_index": 4,
        "file_name": f"sheet_enrichment_{time.strftime('%Y%m%d_%H%M%S')}"
    }

    try:
        response = requests.post(url, headers=headers, json=body, timeout=30)
        response.raise_for_status()
        search_id = response.json().get("id")
        if search_id:
            print(f"Bulk search created: ID {search_id}")
        return search_id
    except Exception as e:
        print(f"Error creating bulk search: {e}")
        return None


def poll_bulk_search_status(search_id):
    """Poll until bulk search completes. Returns True on success."""
    api_key = os.getenv("ANYMAILFINDER_API_KEY")
    url = f"https://api.anymailfinder.com/v5.1/bulk/{search_id}"
    headers = {"Authorization": api_key}

    print("Polling bulk search status...")
    while True:
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            status = data.get("status")
            progress = data.get("progress", {})
            processed = progress.get("processed", 0)
            total = progress.get("total", 0)

            if status == "completed":
                print(f"Bulk search completed! ({processed}/{total} rows)")
                return True
            elif status == "failed":
                print("Bulk search failed")
                return False
            else:
                print(f"Status: {status} - {processed}/{total} rows...")
                time.sleep(10)
        except Exception as e:
            print(f"Error polling status: {e}")
            return False


def download_bulk_results(search_id):
    """Download results of a completed bulk search."""
    api_key = os.getenv("ANYMAILFINDER_API_KEY")
    url = f"https://api.anymailfinder.com/v5.1/bulk/{search_id}/download"
    headers = {"Authorization": api_key}

    try:
        response = requests.get(url, headers=headers, timeout=60)
        response.raise_for_status()
        results = response.json().get("data", [])
        print(f"Downloaded {len(results)} results")
        return results
    except Exception as e:
        print(f"Error downloading results: {e}")
        return None


def enrich_sheet(sheet_url):
    """Enrich a Google Sheet by finding missing emails."""
    creds = get_credentials()
    if not creds:
        print("Error: Could not authenticate with Google")
        return None

    client = gspread.authorize(creds)

    try:
        sheet = client.open_by_url(sheet_url)
        worksheet = sheet.get_worksheet(0)
    except Exception as e:
        print(f"Error opening sheet: {e}")
        return None

    records = worksheet.get_all_records()
    if not records:
        print("No records found in sheet")
        return sheet_url

    headers = worksheet.row_values(1)
    email_col = next((i + 1 for i, h in enumerate(headers) if h.lower() == "email"), None)
    if not email_col:
        print("Error: Could not find 'email' column in sheet")
        return None

    rows_to_enrich = []
    for idx, record in enumerate(records):
        if record.get("email", "").strip():
            continue
        rows_to_enrich.append({
            'row_num': idx + 2,
            'first_name': record.get("first_name", "").strip(),
            'last_name': record.get("last_name", "").strip(),
            'full_name': record.get("full_name", "").strip(),
            'company_domain': record.get("company_domain", "").strip(),
            'company_name': record.get("company_name", "").strip(),
        })

    if not rows_to_enrich:
        print("No rows need email enrichment")
        return sheet_url

    print(f"Processing {len(rows_to_enrich)} rows with missing emails...")

    if len(rows_to_enrich) >= 200:
        print(f"Using BULK API for {len(rows_to_enrich)} rows")
        result = enrich_with_bulk_api(worksheet, email_col, rows_to_enrich, sheet_url)
        if result is None:
            print("Bulk API failed. Falling back to concurrent API...")
            return enrich_with_concurrent_api(worksheet, email_col, rows_to_enrich, sheet_url)
        return result
    else:
        print(f"Using CONCURRENT API for {len(rows_to_enrich)} rows")
        return enrich_with_concurrent_api(worksheet, email_col, rows_to_enrich, sheet_url)


def enrich_with_bulk_api(worksheet, email_col, rows_to_enrich, sheet_url):
    """Enrich using bulk API (for 200+ rows)."""
    search_id = create_bulk_search(rows_to_enrich)
    if not search_id:
        return None

    if not poll_bulk_search_status(search_id):
        return None

    results = download_bulk_results(search_id)
    if not results:
        return None

    enriched_count = 0
    failed_count = 0
    updates_to_apply = []

    for idx, result_row in enumerate(results[1:]):
        if idx >= len(rows_to_enrich):
            break
        row_data = rows_to_enrich[idx]
        email = result_row[5] if len(result_row) > 5 else None
        email_status = result_row[6] if len(result_row) > 6 else None

        if email and email_status in ['valid', 'risky']:
            updates_to_apply.append({'row': row_data['row_num'], 'col': email_col, 'value': email})
            print(f"  Row {row_data['row_num']}: Found: {email}")
            enriched_count += 1
        else:
            failed_count += 1

    if updates_to_apply:
        print(f"Batch updating {len(updates_to_apply)} cells...")
        cell_list = []
        for update in updates_to_apply:
            cell = worksheet.cell(update['row'], update['col'])
            cell.value = update['value']
            cell_list.append(cell)
        worksheet.update_cells(cell_list, value_input_option='RAW')

    print(f"\nEnrichment complete: {enriched_count} found, {failed_count} not found")
    return sheet_url


def enrich_with_concurrent_api(worksheet, email_col, rows_to_enrich, sheet_url):
    """Enrich using concurrent API calls (for <200 rows)."""
    enriched_count = 0
    failed_count = 0

    def enrich_row(row_data):
        display_name = row_data['full_name'] or f"{row_data['first_name']} {row_data['last_name']}"
        found_email = find_email_with_anymailfinder(
            row_data['first_name'], row_data['last_name'], row_data['full_name'],
            row_data['company_domain'], row_data['company_name']
        )
        return {'row_num': row_data['row_num'], 'email': found_email, 'display_name': display_name}

    updates_to_apply = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(enrich_row, row): row for row in rows_to_enrich}
        for future in as_completed(futures):
            result = future.result()
            if result['email']:
                updates_to_apply.append({'row': result['row_num'], 'col': email_col, 'value': result['email']})
                print(f"  Row {result['row_num']}: Found: {result['email']}")
                enriched_count += 1
            else:
                print(f"  Row {result['row_num']}: Not found for {result['display_name']}")
                failed_count += 1

    if updates_to_apply:
        print(f"Batch updating {len(updates_to_apply)} cells...")
        try:
            batch_data = []
            for update in updates_to_apply:
                col_letter = chr(64 + update['col'])
                batch_data.append({'range': f"{col_letter}{update['row']}", 'values': [[update['value']]]})
            worksheet.spreadsheet.values_batch_update(body={'value_input_option': 'RAW', 'data': batch_data})
        except Exception as e:
            print(f"Batch update failed ({e}), falling back to individual updates...")
            for update in sorted(updates_to_apply, key=lambda x: x['row']):
                col_letter = chr(64 + update['col'])
                worksheet.update(f"{col_letter}{update['row']}", [[update['value']]], value_input_option='RAW')
                time.sleep(0.1)

    print(f"\nEnrichment complete: {enriched_count} found, {failed_count} not found")
    return sheet_url


def main():
    parser = argparse.ArgumentParser(description="Enrich missing emails using AnyMailFinder")
    parser.add_argument("sheet_url", help="Google Sheet URL to enrich")
    args = parser.parse_args()

    result_url = enrich_sheet(args.sheet_url)
    if result_url:
        print(f"\nSuccess! Updated sheet: {result_url}")
    else:
        print("Enrichment failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
