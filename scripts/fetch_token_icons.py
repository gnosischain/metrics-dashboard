"""
Fetch token icons from CoinGecko for Gnosis Chain tokens.
Downloads PNGs to public/imgs/tokens/ with circular masks applied.
Self-contained — no external CSV dependency.

Usage:
    pip install Pillow
    cd metrics-dashboard
    python scripts/fetch_token_icons.py

Requires: Python 3.8+, Pillow.
"""

import json
import os
import time
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, 'public', 'imgs', 'tokens')

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
PLATFORM = "xdai"
DELAY_SECONDS = 10
MAX_RETRIES = 4
RETRY_BASE_WAIT = 30
ICON_SIZE = 64

NATIVE_ADDR = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

# ── Token list (synced from dbt-cerebro/seeds/tokens_whitelist.csv) ──────────
# To add a new token: append a (address, symbol) tuple below.
TOKENS = [
    ("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "xDAI"),
    ("0xcb444e90d8198415266c6a2724b7900fb12fc56e", "EURe"),
    ("0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430", "EURe"),
    ("0x5Cb9073902F2035222B9749F8fB0c9BFe5527108", "GBPe"),
    ("0x8E34bfEC4f6Eb781f9743D9b4af99CD23F9b7053", "GBPe"),
    ("0x9c58bacc331c9aa871afd802db6379a98e80cedb", "GNO"),
    ("0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445", "sGNO"),
    ("0x5671b0B8aC13DC7813D36B99C21c53F6cd376a14", "spGNO"),
    ("0xA1Fa064A85266E2Ca82DEe5C5CcEC84DF445760e", "aGnoGNO"),
    ("0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", "WxDAI"),
    ("0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533", "aGnoWXDAI"),
    ("0xaf204776c7245bF4147c2612BF6e5972Ee483701", "sDAI"),
    ("0x7a5c3860a77a8DC1b225BD46d0fb2ac1C6D191BC", "aGnosDAI"),
    ("0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1", "WETH"),
    ("0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252", "WBTC"),
    ("0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0", "USDC.e"),
    ("0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", "USDC"),
    ("0xc6B7AcA6DE8a6044E0e32d0c841a89244A10D284", "aGnoUSDC"),
    ("0xEdBC7449a9b594CA4E053D9737EC5Dc4CbCcBfb2", "aGnoEURe"),
    ("0xC0333cb85B59a788d8C7CAe5e1Fd6E229A3E5a65", "aGnoUSDCe"),
    ("0x5850D127a04ed0B4F1FCDFb051b3409FB9Fe6B90", "spUSDC"),
    ("0xA34DB0ee8F84C4B90ed268dF5aBbe7Dcd3c277ec", "spUSDC.e"),
    ("0x4ECaBa5870353805a9F068101A40E0f32ed605C6", "USDT"),
    ("0x08B0cAebE352c3613302774Cd9B82D08afd7bDC4", "spUSDT"),
    ("0x177127622c4A00F3d409B75571e12cB3c8973d3c", "COW"),
    ("0x4d18815D14fe5c3304e87B3FA18318baa5c23820", "SAFE"),
    ("0xFECB3F7c54E2CAAE9dC6Ac9060A822D47E053760", "BRLA"),
    ("0x0a06c8354a6cc1a07549a38701eac205942e3ac6", "BRZ"),
    ("0x1e2c4fb7ede391d116e6b41cd0608260e8801d59", "bCSPX"),
    ("0x14a5f2872396802c3cc8942a39ab3e4118ee5038", "bTSLA"),
    ("0xac28c9178acc8ba4a11a29e013a3a2627086e422", "bMSTR"),
    ("0x52d134c6db5889fad3542a09eaf7aa90c0fdf9e4", "bIBTA"),
    ("0xa34c5e0abe843e10461e2c9586ea03e55dbcc495", "bNVDA"),
    ("0xbbcb0356bb9e6b3faa5cbf9e5f36185d53403ac9", "bCOIN"),
    ("0x2f123cf3f37ce3328cc9b5b8415f9ec5109b45e7", "bC3M"),
    ("0xca30c93b02514f86d5c86a6e375e3a330b435fb5", "bIB01"),
    ("0x20c64dee8fda5269a78f2d5bdba861ca1d83df7a", "bHIGH"),
    ("0xd4dd9e2f021bb459d5a5f6c24c12fe09c5d45553", "ZCHF"),
    ("0x6165946250dd04740ab1409217e95a4f38374fe9", "svZCHF"),
    ("0x8aD3c73F833d3F9A523aB01476625F269aEB7Cf0", "TSLAX"),
]

# Well-known tokens → CoinGecko coin ID (avoids contract lookup failures)
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

# Derivative tokens that reuse the icon of their underlying asset
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


def make_circular(path):
    """Apply a circular alpha mask so the icon renders as a circle everywhere."""
    from PIL import Image, ImageDraw
    img = Image.open(path).convert("RGBA").resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
    mask = Image.new("L", (ICON_SIZE, ICON_SIZE), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, ICON_SIZE, ICON_SIZE), fill=255)
    result = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    result.paste(img, mask=mask)
    result.save(path)


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
    output_path = os.path.normpath(OUTPUT_DIR)
    os.makedirs(output_path, exist_ok=True)

    mapping_path = os.path.join(output_path, "mapping.json")
    if os.path.exists(mapping_path):
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
    else:
        mapping = {}

    already_done = {v["symbol"] for v in mapping.values()}
    downloaded = {v["symbol"]: v["icon_file"] for v in mapping.values()}
    remaining = [(a, s) for a, s in TOKENS if s not in already_done]

    print(f"Output dir: {output_path}")
    print(f"Found {len(TOKENS)} tokens ({len(already_done)} already downloaded, {len(remaining)} remaining)\n")

    stats = {"ok": 0, "reused": 0, "missed": 0, "error": 0, "skipped": len(already_done)}

    for i, (addr, symbol) in enumerate(remaining, 1):
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
                make_circular(dst)
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
                make_circular(dest)
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
    print(f"  Total:      {stats['skipped'] + stats['ok'] + stats['reused']}/{len(TOKENS)}")
    print(f"  Mapping:    {mapping_path}")


if __name__ == "__main__":
    main()
