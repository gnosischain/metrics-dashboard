/**
 * Color utility functions for charts
 */

/**
 * Default chart color palette
 */
export const DEFAULT_COLORS = [
    '#4285F4', // Blue
    '#34A853', // Green
    '#FBBC05', // Yellow
    '#EA4335', // Red
    '#5F6368', // Grey
    '#8AB4F8', // Light Blue
    '#B8D6F8', // Very Light Blue
    '#81C995', // Light Green
    '#CEEAD6', // Very Light Green
    '#FDE293', // Light Yellow
    '#FCF4C6', // Very Light Yellow
    '#F28B82', // Light Red
    '#FADCDA', // Very Light Red
    '#DADCE0', // Light Grey
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
    
    // Add more colors using HSL color space
    while (palette.length < count) {
      // Use golden ratio to create visually pleasing color distribution
      const hue = (palette.length * 137.5) % 360; // Golden angle approximation
      const saturation = 65 + (palette.length % 3) * 10; // Vary saturation
      const lightness = 55 + (palette.length % 2) * 10; // Vary lightness
      
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