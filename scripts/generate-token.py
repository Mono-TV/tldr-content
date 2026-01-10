#!/usr/bin/env python3
"""
Generate Akamai HMAC Token for Hotstar API
Based on Akamai EdgeAuth token format
"""

import hashlib
import hmac
import time
import sys
import os
import binascii

def generate_token(key, acl='/*', start_time='now', window=2000):
    """
    Generate Akamai EdgeAuth token

    Args:
        key: Secret key (hex string)
        acl: Access Control List path
        start_time: Start time ('now' or epoch timestamp)
        window: Token validity window in seconds

    Returns:
        Token string in format: st=X~exp=Y~acl=Z~hmac=H
    """

    # Parse start time
    if start_time == 'now':
        start = int(time.time())
    else:
        start = int(start_time)

    # Calculate expiry
    exp = start + int(window)

    # Build auth string (what we'll sign)
    auth_string = f"st={start}~exp={exp}~acl={acl}"

    # Convert hex key to bytes
    try:
        key_bytes = bytes.fromhex(key)
    except ValueError:
        # If key is not hex, use as-is
        key_bytes = key.encode('utf-8')

    # Generate HMAC-SHA256
    hmac_hash = hmac.new(
        key_bytes,
        auth_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Build final token
    token = f"{auth_string}~hmac={hmac_hash}"

    return token

def main():
    # Get secret from environment or use provided value
    secret = os.environ.get('HOTSTAR_AKAMAI_SECRET',
                           '7073910d5c5f50d16d50bfdfb0ebb156dd37bea138f341a8432c92e569881617')

    # Token parameters
    acl = '/*'
    start_time = 'now'
    window = 2000  # 33 minutes

    print("\n=== Akamai Token Generator ===\n")
    print(f"Secret: {secret[:16]}...{secret[-8:]}")
    print(f"ACL: {acl}")
    print(f"Window: {window} seconds ({window//60} minutes)")

    # Generate token
    token = generate_token(secret, acl, start_time, window)

    print(f"\n=== Generated Token ===\n")
    print(token)

    print(f"\n=== Add to .env.local ===\n")
    print(f"HOTSTAR_TOKEN={token}")

    print(f"\n=== Test with cURL ===\n")
    print(f"""curl --location 'https://pp-catalog-api.hotstar.com/movie/search?partner=92837456123&orderBy=contentId&order=desc&offset=0&size=5' \\
  --header 'x-country-code: in' \\
  --header 'x-platform-code: ANDROID' \\
  --header 'x-partner-name: 92837456123' \\
  --header 'x-region-code: DL' \\
  --header 'x-client-code: pt' \\
  --header 'hdnea: {token}'""")
    print()

    return token

if __name__ == '__main__':
    token = main()
