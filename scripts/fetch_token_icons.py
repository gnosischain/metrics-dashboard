"""
Fetch token icons from CoinGecko for all tokens in the Gnosis tokens_whitelist.
Downloads PNGs to public/imgs/tokens/ and writes a mapping.json summary.

Usage:
    cd metrics-dashboard
    python scripts/fetch_token_icons.py

Requires: Python 3.8+ (stdlib only, no pip dependencies).
Expects dbt-cerebro to be a sibling directory of metrics-dashboard.
"""

import csv
import json
import os
import time
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)

SEEDS_CSV = os.path.join(REPO_ROOT, '..', 'dbt-cerebro', 'seeds', 'tokens_whitelist.csv')
OUTPUT_DIR = os.path.join(REPO_ROOT, 'public', 'imgs', 'tokens')

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
PLATFORM = "xdai"
DELAY_SECONDS = 10
MAX_RETRIES = 4
RETRY_BASE_WAIT = 30

NATIVE_ADDR = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

COINGECKO_ID_OVERRIDES = {
    "xDAI":      "xdai",
    "WxDAI":     "xdai",
    "sDAI":      "savings-xdai",
    "GNO":       "gnosis",
    "WETH":      "weth",
    "WBTC":      "wrapped-bitcoin",
    "COW":       "cow-protocol",
    "SAFE":      "safe",
    "USDC":      "usd-coin",
    "USDC.e":    "usd-coin",
    "USDT":      "tether",
    "ZCHF":      "frankencoin",
}

ICON_REUSE = {
    "aGnoGNO":    "GNO",
    "sGNO":       "GNO",
    "spGNO":      "GNO",
    "aGnoWXDAI":  "xDAI",
    "aGnosDAI":   "sDAI",
    "aGnoUSDC":   "USDC",
    "aGnoUSDCe":  "USDC.e",
    "aGnoEURe":   "EURe",
    "spUSDC":     "USDC",
    "spUSDC.e":   "USDC.e",
    "spUSDT":     "USDT",
    "svZCHF":     "ZCHF",
}


def fetch_json(url):
    for attempt in range(MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers={
                "Accept": "application/json",
                "User-Agent": "GnosisTokenIconFetcher/1.0"
            })
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < MAX_RETRIES:
                wait = RETRY_BASE_WAIT * (attempt + 1)
                print(f"rate-limited, waiting {wait}s (retry {attempt+1}/{MAX_RETRIES})...", end=" ", flush=True)
                time.sleep(wait)
                continue
            raise


def download_image(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "GnosisTokenIconFetcher/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        with open(dest, "wb") as f:
            f.write(resp.read())


def get_image_url_by_id(coin_id):
    url = f"{COINGECKO_BASE}/coins/{coin_id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false"
    data = fetch_json(url)
    return data.get("image", {}).get("small")


def get_image_url_by_contract(address):
    url = f"{COINGECKO_BASE}/coins/{PLATFORM}/contract/{address}"
    data = fetch_json(url)
    return data.get("image", {}).get("small")


def main():
    seeds_path = os.path.normpath(SEEDS_CSV)
    output_path = os.path.normpath(OUTPUT_DIR)

    if not os.path.exists(seeds_path):
        print(f"ERROR: tokens_whitelist.csv not found at: {seeds_path}")
        print("Make sure dbt-cerebro is a sibling directory of metrics-dashboard.")
        return

    os.makedirs(output_path, exist_ok=True)

    with open(seeds_path, newline="", encoding="utf-8") as f:
        tokens = list(csv.DictReader(f))

    mapping_path = os.path.join(output_path, "mapping.json")
    if os.path.exists(mapping_path):
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
    else:
        mapping = {}

    already_done = {v["symbol"] for v in mapping.values()}
    downloaded = {v["symbol"]: v["icon_file"] for v in mapping.values()}
    remaining = [t for t in tokens if t["symbol"].strip() not in already_done]

    print(f"Seeds CSV:  {seeds_path}")
    print(f"Output dir: {output_path}")
    print(f"Found {len(tokens)} tokens ({len(already_done)} already downloaded, {len(remaining)} remaining)\n")

    stats = {"ok": 0, "reused": 0, "missed": 0, "error": 0, "skipped": len(already_done)}

    for i, row in enumerate(remaining, 1):
        addr = row["address"].strip()
        symbol = row["symbol"].strip()
        tag = f"[{i}/{len(remaining)}] {symbol}"

        if symbol in ICON_REUSE:
            parent = ICON_REUSE[symbol]
            if parent in downloaded:
                fname = f"{symbol.lower().replace('.', '_')}.png"
                src = os.path.join(output_path, downloaded[parent])
                dst = os.path.join(output_path, fname)
                with open(src, "rb") as sf:
                    with open(dst, "wb") as df:
                        df.write(sf.read())
                mapping[addr] = {"symbol": symbol, "icon_file": fname, "source": f"reused from {parent}"}
                downloaded[symbol] = fname
                stats["reused"] += 1
                print(f"  {tag} -> reused from {parent}")
                continue

        fname = f"{symbol.lower().replace('.', '_')}.png"
        dest = os.path.join(output_path, fname)

        try:
            img_url = None

            if symbol in COINGECKO_ID_OVERRIDES:
                coin_id = COINGECKO_ID_OVERRIDES[symbol]
                print(f"  {tag} -> by CoinGecko ID: {coin_id} ...", end=" ", flush=True)
                img_url = get_image_url_by_id(coin_id)
            elif addr == NATIVE_ADDR:
                print(f"  {tag} -> native token (skipped, use xDAI icon)")
                continue
            else:
                print(f"  {tag} -> by contract: {addr[:10]}... ...", end=" ", flush=True)
                img_url = get_image_url_by_contract(addr)

            if img_url:
                download_image(img_url, dest)
                mapping[addr] = {"symbol": symbol, "icon_file": fname, "source": "coingecko"}
                downloaded[symbol] = fname
                stats["ok"] += 1
                print("OK")
            else:
                stats["missed"] += 1
                print("no image URL")

        except urllib.error.HTTPError as e:
            stats["missed" if e.code == 404 else "error"] += 1
            print(f"HTTP {e.code}")
        except Exception as e:
            stats["error"] += 1
            print(f"ERROR: {e}")

        with open(mapping_path, "w", encoding="utf-8") as f:
            json.dump(mapping, f, indent=2)

        time.sleep(DELAY_SECONDS)

    print(f"\n{'='*50}")
    print(f"Results saved to: {output_path}")
    print(f"  Previously done: {stats['skipped']}")
    print(f"  Downloaded: {stats['ok']}")
    print(f"  Reused:     {stats['reused']}")
    print(f"  Missed:     {stats['missed']}")
    print(f"  Errors:     {stats['error']}")
    print(f"  Total:      {stats['skipped'] + stats['ok'] + stats['reused']}/{len(tokens)}")
    print(f"  Mapping:    {mapping_path}")


if __name__ == "__main__":
    main()
