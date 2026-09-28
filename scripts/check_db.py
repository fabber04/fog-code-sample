#!/usr/bin/env python3
"""Smoke-test the deployed backend API (health + optional podcast POST). Run when debugging Railway connectivity."""

import json
import os
import sys

import requests

API_BASE_URL = os.environ.get(
    "API_BASE_URL", "https://api.example.com"
).rstrip("/")

print(f"Backend: {API_BASE_URL}")
print("Testing API connection...")
try:
    response = requests.get(f"{API_BASE_URL}/api/health", timeout=15)
    print(f"Health check: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Health check failed: {e}")
    sys.exit(1)

print("\nDone. For table counts use: python scripts/show_tables.py")
