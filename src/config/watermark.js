/**
 * Global watermark configuration
 * Location: src/config/watermark.js
 * 
 * This file sets the global watermark configuration for all charts
 */

export const WATERMARK_CONFIG = {
  // Show watermark on charts
  showWatermark: true,
  
  // Watermark position
  watermarkPosition: 'bottom-right',
  
  // Size of the watermark
  watermarkSize: 25, // Small size
  
  // Opacity of the watermark
  watermarkOpacity: 0.1, // Subtle
  
  // Path to watermark image - Use the Gnosis logo URLs
  watermarkImage: {
    light: 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_Black_RGB.png',
    dark: 'https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/Owl_Logomark_White_RGB.png'
  }
};

// Export a function to get watermark configuration
export const getWatermarkConfig = (options = {}) => {
  const {
    isDarkMode = false,
    position = WATERMARK_CONFIG.watermarkPosition
  } = options;
  
  // Select appropriate watermark image based on theme
  const watermarkImage = isDarkMode 
    ? WATERMARK_CONFIG.watermarkImage.dark 
    : WATERMARK_CONFIG.watermarkImage.light;
  
  return {
    showWatermark: WATERMARK_CONFIG.showWatermark,
    watermarkPosition: position,
    watermarkSize: WATERMARK_CONFIG.watermarkSize,
    watermarkOpacity: WATERMARK_CONFIG.watermarkOpacity,
    watermarkImage: watermarkImage
  };
};