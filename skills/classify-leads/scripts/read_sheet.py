#!/usr/bin/env python3
"""
Read leads from a Google Sheet and export to JSON.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv
import gspread
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

load_dotenv()


def extract_sheet_id(url):
    if '/d/' in url:
        return url.split('/d/')[1].split('/')[0]
    return url


def get_credentials():
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]

    creds = None

    if os.path.exists('token.json'):
        try:
            with open('token.json', 'r') as token:
                creds = Credentials.from_authorized_user_info(json.load(token), scopes)
        except Exception as e:
            print(f"Error loading token: {e}")

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            creds_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "credentials.json")
            flow = InstalledAppFlow.from_client_secrets_file(creds_file, scopes)
            creds = flow.run_local_server(port=0)

        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return creds


def read_google_sheet(sheet_url, worksheet_name=None):
    try:
        client = gspread.authorize(get_credentials())
        spreadsheet = client.open_by_key(extract_sheet_id(sheet_url))
        worksheet = spreadsheet.worksheet(worksheet_name) if worksheet_name else spreadsheet.sheet1
        records = worksheet.get_all_records()
        print(f"Read {len(records)} leads from Google Sheet")
        return records
    except Exception as e:
        print(f"Error reading Google Sheet: {e}", file=sys.stderr)
        return None


def save_leads(leads, prefix="leads_input"):
    if not leads:
        print("No leads to save.")
        return None

    os.makedirs(".tmp", exist_ok=True)
    filename = f".tmp/{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    with open(filename, "w") as f:
        json.dump(leads, f, indent=2)

    print(f"Leads saved to {filename}")
    return filename


def main():
    parser = argparse.ArgumentParser(description="Read leads from Google Sheets")
    parser.add_argument("--url", required=True, help="Google Sheets URL or ID")
    parser.add_argument("--worksheet", help="Worksheet name (default: first sheet)")
    parser.add_argument("--output_prefix", default="leads_input", help="Prefix for output filename")

    args = parser.parse_args()

    leads = read_google_sheet(args.url, args.worksheet)

    if leads:
        filename = save_leads(leads, prefix=args.output_prefix)
        if filename:
            print(f"\nTotal leads: {len(leads)}")
            if leads:
                print(f"Fields: {', '.join(leads[0].keys())}")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
