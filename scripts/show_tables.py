#!/usr/bin/env python3
"""List PostgreSQL table names and sample rows via the backend /api/view-tables endpoint."""

import json
import os
import sys

import requests

API_URL = os.environ.get(
    "API_BASE_URL", "https://api.example.com"
).rstrip("/")

print(f"Backend: {API_URL}")
print("Fetching database tables...")
print("=" * 70)

try:
    response = requests.get(f"{API_URL}/api/view-tables", timeout=15)

    if response.status_code == 200:
        data = response.json()

        if data.get("status") == "success":
            tables_info = data.get("tables", {})

            print(f"\nFound {data.get('total_tables', 0)} tables\n")

            for table_name, table_info in sorted(tables_info.items()):
                print("=" * 70)
                print(f"TABLE: {table_name.upper()}")
                print("=" * 70)
                print(f"Columns: {', '.join(table_info.get('columns', []))}")
                print(f"Total Rows: {table_info.get('row_count', 0)}")
                print(f"Showing: {table_info.get('showing', 0)} sample rows\n")

                sample_data = table_info.get("sample_data", [])
                if sample_data:
                    print("Sample Data:")
                    print("-" * 70)
                    for i, row in enumerate(sample_data, 1):
                        print(f"\n[{i}]")
                        for col, value in row.items():
                            print(f"  {col}: {value}")
                else:
                    print("(No sample rows)")
                print()
        else:
            print(f"API returned error: {data.get('message', data)}")
            sys.exit(1)
    else:
        print(f"HTTP {response.status_code}: {response.text[:500]}")
        sys.exit(1)

except requests.exceptions.ConnectionError:
    print(f"Cannot connect to {API_URL}")
    sys.exit(1)
