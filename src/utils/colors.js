/**
 * Color utility functions for charts
 */

/**
 * Cohesive light mode palette aligned with Indigo/Slate design tokens.
 */
export const DEFAULT_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
  '#06B6D4', '#A855F7', '#22C55E', '#FB7185', '#0EA5E9',
  '#6366F1', '#16A34A', '#EAB308', '#DC2626', '#7C3AED'
];

/**
 * Brighter dark mode palette for contrast on slate surfaces.
 */
export const DARK_MODE_COLORS = [
  '#818CF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA',
  '#60A5FA', '#F472B6', '#2DD4BF', '#FDBA74', '#A3E635',
  '#67E8F9', '#C4B5FD', '#4ADE80', '#FDA4AF', '#38BDF8',
  '#93C5FD', '#6EE7B7', '#FCD34D', '#FCA5A5', '#DDD6FE'
];

/**
 * High contrast dark palette for dense overlapping series.
 */
export const HIGH_CONTRAST_DARK_COLORS = [
  '#67E8F9', '#F472B6', '#FCD34D', '#FB7185', '#22D3EE',
  '#A3E635', '#C4B5FD', '#FDBA74', '#38BDF8', '#34D399',
  '#E879F9', '#F87171'
];

/**
 * Convert hex color to rgba with alpha
 * @param {string} hex - Hex color code or rgb/rgba string
 * @param {number} alpha - Alpha transparency value (0-1)
 * @returns {string} RGBA color string
 */
export const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(128, 128, 128, ${alpha})`;

  if (hex.startsWith('rgba')) return hex;
  if (hex.startsWith('rgb(')) {
    return hex.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
    
/**
 * Generate a color palette with specified number of colors
 * Uses a preset palette for common sizes and generates additional colors if needed
 * 
 * @param {number} count - Number of colors needed
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @param {boolean} highContrast - Whether to use high contrast colors for dark mode
 * @returns {Array} Array of hex color values
 */
export function generateColorPalette(count, isDarkMode = false, highContrast = false) {
  // Select the appropriate color palette based on theme and contrast setting
  const baseColors = isDarkMode 
    ? (highContrast ? HIGH_CONTRAST_DARK_COLORS : DARK_MODE_COLORS)
    : DEFAULT_COLORS;
  
  // For small counts, use the predefined palette
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // For larger counts, generate additional colors
  const palette = [...baseColors];
  
  // Add more colors using HSL color space.
  // Keep this deterministic so charts do not shift color assignments on rerender.
  while (palette.length < count) {
    const hue = (palette.length * 137.508) % 360; // Golden angle in degrees
    const saturation = isDarkMode ? (highContrast ? 92 : 78) : 62;
    const lightness = isDarkMode ? (highContrast ? 70 : 66) : 52;
    palette.push(hslToHex(hue, saturation, lightness));
  }
  
  return palette;
}

/**
 * Convert HSL color values to hex color string
 * 
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color value
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  
  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  // Convert to hex
  const toHex = (value) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
