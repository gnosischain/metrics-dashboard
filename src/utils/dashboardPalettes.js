import { DEFAULT_COLORS, DARK_MODE_COLORS } from './colors';

const DEFAULT_HEATMAP_SCALE_LIGHT = ['#ffffff', '#cce7ff', '#99d6ff', '#66c2ff', '#0080ff'];
const DEFAULT_HEATMAP_SCALE_DARK = ['#003366', '#006699', '#0099cc', '#33ccff', '#66ffff'];
const GNOSIS_PAY_TOKEN_COLORS_ORDERED = [
  '#5b5954',
  '#CDDF52',
  '#919E3A',
  '#1B1A16',
  '#D4D0C5',
  '#9B9A92',
  '#A784E6',
  '#988066',
  '#F5B83D',
  '#2E2C26',
  '#6E68FF',
  '#292086'
];

export const STANDARD_PALETTE = {
  id: 'standard',
  seriesLight: [...DEFAULT_COLORS],
  seriesDark: [...DARK_MODE_COLORS],
  numberAccentLight: '#4F46E5',
  numberAccentDark: '#818CF8',
  heatmapScaleLight: [...DEFAULT_HEATMAP_SCALE_LIGHT],
  heatmapScaleDark: [...DEFAULT_HEATMAP_SCALE_DARK]
};

export const GNOSIS_PAY_PALETTE = {
  id: 'gnosis-pay',
  // Preserve website token ordering so chart assignment is deterministic by series index.
  seriesLight: [...GNOSIS_PAY_TOKEN_COLORS_ORDERED],
  seriesDark: [...GNOSIS_PAY_TOKEN_COLORS_ORDERED],
  numberAccentLight: '#6E6C62',
  numberAccentDark: '#CBFB6C',
  heatmapScaleLight: ['#FCF9F2', '#F0EBDE', '#D4D0C5', '#DBE881', '#CDDF52'],
  heatmapScaleDark: ['#1B1A16', '#2E2C26', '#5B5954', '#919E3A', '#CBFB6C']
};

const NAMED_PALETTES = {
  standard: STANDARD_PALETTE,
  'gnosis-pay': GNOSIS_PAY_PALETTE,
  gnosispay: GNOSIS_PAY_PALETTE,
  gnosis_pay: GNOSIS_PAY_PALETTE
};

const clonePalette = (palette) => ({
  ...palette,
  seriesLight: [...(palette.seriesLight || [])],
  seriesDark: [...(palette.seriesDark || [])],
  heatmapScaleLight: [...(palette.heatmapScaleLight || [])],
  heatmapScaleDark: [...(palette.heatmapScaleDark || [])]
});

const normalizePaletteKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const resolveNamedPalette = (paletteName) => {
  const key = normalizePaletteKey(paletteName);
  return NAMED_PALETTES[key] ? clonePalette(NAMED_PALETTES[key]) : null;
};

export const resolveDashboardPalette = (paletteConfig) => {
  if (!paletteConfig) {
    return clonePalette(STANDARD_PALETTE);
  }

  if (typeof paletteConfig === 'string') {
    return resolveNamedPalette(paletteConfig) || clonePalette(STANDARD_PALETTE);
  }
  // Preset-only mode: keep all palette definitions in this file.
  return clonePalette(STANDARD_PALETTE);
};
