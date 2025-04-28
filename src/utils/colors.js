/**
 * Color utility functions for charts
 */

/**
 * Default chart color palette based on the new theme
 */
export const DEFAULT_COLORS = [
    '#133629', // moss (deep green)
    '#dd7143', // orange
    '#3e6957', // forest
    '#f0ebde', // cream
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
   * Generate a color palette with specified number of colors
   * Uses a preset palette for common sizes and generates additional colors if needed
   * 
   * @param {number} count - Number of colors needed
   * @returns {Array} Array of hex color values
   */
  export function generateColorPalette(count) {
    // For small counts, use the predefined palette
    if (count <= DEFAULT_COLORS.length) {
      return DEFAULT_COLORS.slice(0, count);
    }
    
    // For larger counts, generate additional colors
    const palette = [...DEFAULT_COLORS];
    
    // Add more colors using HSL color space with an earth-tone bias
    while (palette.length < count) {
      // Use golden ratio to create visually pleasing color distribution
      // But with a bias towards earth tones (greens, browns, oranges)
      
      // Hues: 20-40 (oranges/browns), 80-150 (greens), 35-55 (golds)
      const hueRanges = [[20, 40], [80, 150], [35, 55]];
      const selectedRange = hueRanges[palette.length % hueRanges.length];
      
      const hue = selectedRange[0] + (Math.random() * (selectedRange[1] - selectedRange[0]));
      const saturation = 30 + (Math.random() * 40); // More muted saturation for earth tones
      const lightness = 35 + (Math.random() * 30); // Balanced lightness that works well on white
      
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