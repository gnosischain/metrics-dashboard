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

const TOKEN_ICON_URLS = Object.fromEntries(
  Object.entries(ICON_FILES).map(([symbol, file]) => [
    symbol,
    withBaseUrl(`/imgs/tokens/${file}`)
  ])
);

// Case-insensitive lookup: "usdc.e" → "USDC.e", "eure" → "EURe", etc.
const SYMBOL_BY_LOWER = Object.fromEntries(
  Object.keys(ICON_FILES).map(s => [s.toLowerCase(), s])
);

function resolveSymbol(input) {
  if (!input) return null;
  if (TOKEN_ICON_URLS[input]) return input;
  return SYMBOL_BY_LOWER[input.toLowerCase()] || null;
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
  return found.map(s => getTokenIconHtml(s)).join(' ');
}

export default TOKEN_ICON_URLS;
