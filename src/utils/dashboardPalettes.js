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

// Gnosis App: brand violet + warm orange accents.
// Series alternate hue families so adjacent plot lines stay legible.
const GNOSIS_APP_SERIES_ORDERED = [
  '#7B3FE4', // brand violet
  '#FF8A3D', // brand orange
  '#4C1D95', // deep violet
  '#F59E0B', // amber
  '#A78BFA', // soft violet
  '#EA580C', // burnt orange
  '#6D28D9', // violet-700
  '#FDBA74', // peach
  '#2E1065', // ink violet
  '#9A3412', // dark orange
  '#C4B5FD', // lilac
  '#FB923C'  // orange-400
];

export const GNOSIS_APP_PALETTE = {
  id: 'gnosis-app',
  seriesLight: [...GNOSIS_APP_SERIES_ORDERED],
  seriesDark: [...GNOSIS_APP_SERIES_ORDERED],
  numberAccentLight: '#7B3FE4',
  numberAccentDark: '#FF8A3D',
  heatmapScaleLight: ['#FFF7ED', '#FED7AA', '#FB923C', '#7B3FE4', '#4C1D95'],
  heatmapScaleDark: ['#2E1065', '#6D28D9', '#A78BFA', '#FB923C', '#FDBA74']
};

// Circles: brand blue (primary) + red + light pink. Blue dominates;
// red and pink alternate for high contrast against the blue series.
const CIRCLES_SERIES_ORDERED = [
  '#3B82F6', // brand blue (primary)
  '#DC2626', // brand red
  '#F472B6', // light pink
  '#1D4ED8', // deep blue
  '#FB7185', // rose-400
  '#93C5FD', // light blue
  '#BE123C', // dark red
  '#EC4899', // pink-500
  '#1E3A8A', // navy
  '#FDA4AF', // rose-300
  '#2563EB', // blue-600
  '#FECDD3'  // rose-200
];

export const CIRCLES_PALETTE = {
  id: 'circles',
  seriesLight: [...CIRCLES_SERIES_ORDERED],
  seriesDark: [...CIRCLES_SERIES_ORDERED],
  numberAccentLight: '#3B82F6',
  numberAccentDark: '#60A5FA',
  heatmapScaleLight: ['#EFF6FF', '#BFDBFE', '#60A5FA', '#3B82F6', '#1E3A8A'],
  heatmapScaleDark: ['#172554', '#1E3A8A', '#1D4ED8', '#3B82F6', '#93C5FD']
};

const NAMED_PALETTES = {
  standard: STANDARD_PALETTE,
  'gnosis-pay': GNOSIS_PAY_PALETTE,
  gnosispay: GNOSIS_PAY_PALETTE,
  gnosis_pay: GNOSIS_PAY_PALETTE,
  'gnosis-app': GNOSIS_APP_PALETTE,
  gnosisapp: GNOSIS_APP_PALETTE,
  gnosis_app: GNOSIS_APP_PALETTE,
  app: GNOSIS_APP_PALETTE,
  circles: CIRCLES_PALETTE
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
