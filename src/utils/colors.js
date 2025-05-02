/**
 * Color utility functions for charts
 */

/**
 * Default chart color palette for light mode based on the earth tone theme
 */
export const DEFAULT_COLORS = [
    '#133629', // moss (deep green)
    '#dd7143', // orange
    '#3e6957', // forest
    '#89857c', // gray
    '#b64b1b', // burnt orange
    '#91b7a1', // minty green
    '#6f592c', // saddle-brown
    '#ffb190', // light coral orange
    '#0f3d28', // deep moss
    '#d2c29d', // pale sand
    '#2e5943', // muted forest
    '#f08a5d', // soft orange
    '#769689', // light-green
    '#d4aa91', // orange-light
    '#231e10', // black
    '#bfa76f', // soft gold
    '#3e6957', // forest again for layering
    '#faf8f2', // extra light cream
    '#9c7e3f', // muted gold
    '#7c7160', // stone gray
    '#e4ddcb', // cream-medium
    '#473d2c', // dark olive
    '#cbc3ad', // cream-dark
    '#a29788', // warm gray
];

/**
 * Bright chart color palette for dark mode with better visibility
 */
export const DARK_MODE_COLORS = [
    '#4ecca3', // bright mint
    '#ff6b6b', // coral red
    '#73c2fb', // maya blue
    '#ffda77', // mellow yellow
    '#a685e2', // lavender
    '#ffbfa3', // peach
    '#64dfdf', // turquoise
    '#ffb6c1', // light pink
    '#9cf196', // light green
    '#f8b195', // light orange
    '#a5dee5', // powder blue
    '#fdfd96', // pastel yellow
    '#b5ead7', // sea foam
    '#ff9aa2', // light salmon
    '#c7ceea', // periwinkle
    '#edc9af', // desert sand
    '#80deea', // light cyan
    '#fff6dd', // cream
    '#aeea00', // lime
    '#dce775', // light lime
    '#ffcdd2', // light red
    '#e1bee7', // light purple
    '#c8e6c9', // mint cream
    '#b2dfdb', // aqua marine
];

/**
 * High contrast color palette for stacked area charts in dark mode
 * Specifically designed to provide better differentiation between areas
 */
export const HIGH_CONTRAST_DARK_COLORS = [
    '#00FFFF', // Cyan
    '#FF00FF', // Magenta
    '#FFFF00', // Yellow
    '#FF3333', // Bright Red
    '#33FF33', // Bright Green
    '#3333FF', // Bright Blue
    '#FF9900', // Orange
    '#9900FF', // Purple
    '#FF0099', // Pink
    '#00FF99', // Mint
    '#99FF00', // Lime
    '#0099FF', // Sky Blue
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
  
  // Add more colors using HSL color space
  while (palette.length < count) {
    // Use golden ratio to create visually pleasing color distribution
    // For dark mode, use brighter, more saturated colors
    if (isDarkMode) {
      const hue = (palette.length * 137.508) % 360; // Golden angle in degrees
      const saturation = highContrast ? 90 : 65; // Higher saturation for high contrast
      const lightness = highContrast ? 70 : 65; // Higher lightness for high contrast
      
      palette.push(hslToHex(hue, saturation, lightness));
    } else {
      // For light mode, use more muted, earth tone colors
      const hueRanges = [[20, 40], [80, 150], [35, 55]]; // earth tones
      const selectedRange = hueRanges[palette.length % hueRanges.length];
      
      const hue = selectedRange[0] + (Math.random() * (selectedRange[1] - selectedRange[0]));
      const saturation = 30 + (Math.random() * 40); // More muted saturation for earth tones
      const lightness = 35 + (Math.random() * 30); // Balanced lightness for light mode
      
      palette.push(hslToHex(hue, saturation, lightness));
    }
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