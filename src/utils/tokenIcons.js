import { withBaseUrl } from './env.js';

const ICON_FILES = {
  'xDAI':      'xdai.png',
  'WxDAI':     'wxdai.png',
  'sDAI':      'sdai.png',
  'GNO':       'gno.png',
  'sGNO':      'sgno.png',
  'spGNO':     'spgno.png',
  'aGnoGNO':   'agnogno.png',
  'WETH':      'weth.png',
  'WBTC':      'wbtc.png',
  'USDC':      'usdc.png',
  'USDC.e':    'usdc_e.png',
  'USDT':      'usdt.png',
  'EURe':      'eure.png',
  'GBPe':      'gbpe.png',
  'COW':       'cow.png',
  'SAFE':      'safe.png',
  'BRLA':      'brla.png',
  'ZCHF':      'zchf.png',
  'svZCHF':    'svzchf.png',
  'aGnoWXDAI': 'agnowxdai.png',
  'aGnosDAI':  'agnosdai.png',
  'aGnoUSDC':  'agnousdc.png',
  'aGnoUSDCe': 'agnousdce.png',
  'aGnoEURe':  'agnoeure.png',
  'spUSDC':    'spusdc.png',
  'spUSDC.e':  'spusdc_e.png',
  'spUSDT':    'spusdt.png',
  'bCSPX':     'bcspx.png',
  'bTSLA':     'btsla.png',
  'bMSTR':     'bmstr.png',
  'bIBTA':     'bibta.png',
  'bNVDA':     'bnvda.png',
  'bCOIN':     'bcoin.png',
  'bC3M':      'bc3m.png',
  'bIB01':     'bib01.png',
  'bHIGH':     'bhigh.png',
};

const TOKEN_ICON_URLS = {};
for (const [symbol, file] of Object.entries(ICON_FILES)) {
  const url = withBaseUrl(`/imgs/tokens/${file}`);
  TOKEN_ICON_URLS[symbol] = url;
  const upper = symbol.toUpperCase();
  if (upper !== symbol) TOKEN_ICON_URLS[upper] = url;
}

// Case-insensitive lookup: "usdc.e" → "USDC.e", "eure" → "EURe", etc.
const SYMBOL_BY_LOWER = Object.fromEntries(
  Object.keys(ICON_FILES).map(s => [s.toLowerCase(), s])
);

function resolveSymbol(input) {
  if (!input) return null;
  if (TOKEN_ICON_URLS[input]) return input;
  return SYMBOL_BY_LOWER[input.toLowerCase()] || null;
}

export function formatTokenSymbol(input) {
  if (!input) return input;
  return SYMBOL_BY_LOWER[input.toLowerCase()] || input;
}

export function getTokenIconUrl(symbol) {
  const resolved = resolveSymbol(symbol);
  return resolved ? TOKEN_ICON_URLS[resolved] : null;
}

export function getTokenIconHtml(symbol, size = 18) {
  const resolved = resolveSymbol(symbol);
  if (!resolved) return '';
  const url = TOKEN_ICON_URLS[resolved];
  const escaped = resolved.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<img src="${url}" alt="${escaped}" style="width:${size}px;height:${size}px;border-radius:50%;vertical-align:middle;object-fit:cover;" />`;
}

export function getTokenIconsFromName(name) {
  if (!name) return '';
  const found = [];
  const parts = name.split(/[\s\/•,]+/);
  for (const part of parts) {
    const resolved = resolveSymbol(part.trim());
    if (resolved && !found.includes(resolved)) {
      found.push(resolved);
    }
  }
  const imgs = found.map((s, i) => {
    const ml = i > 0 ? 'margin-left:-4px;' : '';
    const url = TOKEN_ICON_URLS[s];
    const escaped = s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<img src="${url}" alt="${escaped}" style="display:inline-block;width:18px;height:18px;border-radius:50%;vertical-align:middle;object-fit:cover;${ml}border:1.5px solid var(--color-surface, #fff);position:relative;z-index:${found.length - i};" />`;
  }).join('');
  return `<span style="display:inline-flex;align-items:center;flex-shrink:0;">${imgs}</span>`;
}

/**
 * Replace token symbols in a string with their properly-cased display names.
 * E.g. "WETH/WXDAI" → "WETH/WxDAI", "USDC.E/SDAI" → "USDC.e/sDAI"
 */
export function formatTokenName(name) {
  if (!name) return name;
  return name.replace(/[A-Za-z][A-Za-z0-9.]*(?=[\/\s•,]|$)/g, (match) => {
    const resolved = resolveSymbol(match);
    return resolved || match;
  });
}

export default TOKEN_ICON_URLS;
