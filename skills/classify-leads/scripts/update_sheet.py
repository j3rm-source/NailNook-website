#!/usr/bin/env python3
"""
Upload JSON data to a Google Sheet.
"""

import os
import sys
import json
import argparse
import pandas as pd
from dotenv import load_dotenv
import gspread
from google.oauth2.service_account import Credentials

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]


def get_credentials():
    """Load Google credentials. Supports Service Account and OAuth 2.0."""
    creds = None

    if os.path.exists('token.json'):
        from google.oauth2.credentials import Credentials as UserCredentials
        creds = UserCredentials.from_authorized_user_file('token.json', SCOPES)

    if creds and creds.expired and creds.refresh_token:
        from google.auth.transport.requests import Request
        try:
            creds.refresh(Request())
        except Exception as e:
            print(f"Error refreshing token: {e}", file=sys.stderr)
            creds = None

    if not creds:
        service_account_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")

        if os.path.exists(service_account_file):
            with open(service_account_file, 'r') as f:
                content = json.load(f)

            if "type" in content and content["type"] == "service_account":
                creds = Credentials.from_service_account_file(service_account_file, scopes=SCOPES)
            elif "installed" in content:
                from google_auth_oauthlib.flow import InstalledAppFlow
                flow = InstalledAppFlow.from_client_secrets_file(service_account_file, SCOPES)
                creds = flow.run_local_server(port=0)
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())
            else:
                print("Unknown credential type in JSON.", file=sys.stderr)
        else:
            print(f"Error: Credentials file '{service_account_file}' not found.", file=sys.stderr)
            return None

    return creds


def col_index_to_letter(n):
    """Convert 0-based column index to Excel-style letter (A, B, ..., Z, AA, etc.)"""
    result = ""
    while n >= 0:
        result = chr(n % 26 + 65) + result
        n = n // 26 - 1
    return result


def update_sheet(json_file, sheet_name=None):
    """Read JSON and upload to Google Sheet."""
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}", file=sys.stderr)
        return None

    if not data:
        print("No data in JSON file.")
        return None

    df = pd.json_normalize(data)

    creds = get_credentials()
    if not creds:
        return None

    client = gspread.authorize(creds)

    try:
        if sheet_name:
            try:
                sh = client.open(sheet_name)
                print(f"Opened existing sheet: {sheet_name}")
            except gspread.SpreadsheetNotFound:
                sh = client.create(sheet_name)
                print(f"Created new sheet: {sheet_name}")
        else:
            default_name = f"Leads Import - {os.path.basename(json_file)}"
            sh = client.create(default_name)
            print(f"Created new sheet: {default_name}")

        worksheet = sh.get_worksheet(0)
        worksheet.clear()

        all_data = [df.columns.values.tolist()] + df.values.tolist()
        num_cols = len(df.columns)
        end_col = col_index_to_letter(num_cols - 1)

        if len(all_data) > worksheet.row_count or num_cols > worksheet.col_count:
            new_rows = max(len(all_data), worksheet.row_count)
            new_cols = max(num_cols, worksheet.col_count)
            print(f"Resizing worksheet to {new_rows}x{new_cols}...")
            worksheet.resize(rows=new_rows, cols=new_cols)

        if len(all_data) > 1000:
            print(f"Large dataset ({len(all_data)} rows). Using batch update...")
            chunk_size = 1000
            for i in range(0, len(all_data), chunk_size):
                chunk = all_data[i:i + chunk_size]
                start_row = i + 1
                end_row = start_row + len(chunk) - 1
                worksheet.update(values=chunk, range_name=f"A{start_row}:{end_col}{end_row}", value_input_option='RAW')
                print(f"  Updated rows {start_row}-{end_row}")
        else:
            worksheet.update(values=all_data, value_input_option='RAW')

        user_email = os.getenv("USER_EMAIL")
        if user_email:
            sh.share(user_email, perm_type='user', role='writer')
            print(f"Shared sheet with {user_email}")

        return sh.url

    except Exception as e:
        print(f"Error updating sheet: {e}", file=sys.stderr)
        return None


def main():
    parser = argparse.ArgumentParser(description="Upload JSON to Google Sheet")
    parser.add_argument("json_file", help="Path to the JSON file containing leads")
    parser.add_argument("--sheet_name", help="Name of the Google Sheet (optional)")

    args = parser.parse_args()

    url = update_sheet(args.json_file, args.sheet_name)

    if url:
        print(f"Success! Sheet URL: {url}")
    else:
        print("Failed to update sheet.")
        sys.exit(1)


if __name__ == "__main__":
    main()
