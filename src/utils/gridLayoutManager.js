/**
 * Grid Layout Manager
 * 
 * Helper utilities for managing the grid layout of metrics
 */

/**
 * Convert metric size string to column span value
 * @param {string} size - Size value (small, medium, large, full)
 * @returns {number} Number of columns to span
 */
export const getSizeSpan = (size) => {
    switch (size?.toLowerCase()) {
      case 'small':
        return 3;  // 1/4 of the grid (3/12)
      case 'medium':
        return 6;  // 1/2 of the grid (6/12)
      case 'large':
        return 9;  // 3/4 of the grid (9/12)
      case 'full':
        return 12; // Full width (12/12)
      default:
        return 6;  // Default to medium
    }
  };
  
  /**
   * Get standard vertical size value
   * @param {string} vSize - Vertical size string (small, medium, large, xl)
   * @returns {string} Standardized vertical size
   */
  export const getVerticalSize = (vSize) => {
    switch (vSize?.toLowerCase()) {
      case 'small':
      case 'medium':
      case 'large':
      case 'xl':
        return vSize.toLowerCase();
      default:
        return 'medium'; // Default vertical size
    }
  };
  
  /**
   * Convert vertical size to numeric value for sorting
   * @param {string} vSize - Vertical size string
   * @returns {number} Numeric value for comparison
   */
  const getVerticalSizeValue = (vSize) => {
    switch (vSize?.toLowerCase()) {
      case 'small': return 1;
      case 'medium': return 2;
      case 'large': return 3;
      case 'xl': return 4;
      default: return 2; // Default to medium
    }
  };
  
  /**
   * Calculate optimal grid layout
   * @param {Array} metrics - Array of metric configurations
   * @returns {Array} Metrics in optimal order
   */
  export const optimizeGridLayout = (metrics) => {
    if (!metrics || metrics.length === 0) return [];
    
    // Apply default values to ensure all metrics have both size and vSize
    const metricsWithDefaults = metrics.map(metric => ({
      ...metric,
      size: metric.size || 'medium',
      vSize: metric.vSize || 'medium'
    }));
    
    // First, sort by row placement strategy
    return optimizeByRowPlacement(metricsWithDefaults);
  };
  
  /**
   * Optimize layout by placing metrics in rows intelligently
   * @param {Array} metrics - Metrics with defaults applied
   * @returns {Array} Optimized metrics array
   */
  const optimizeByRowPlacement = (metrics) => {
    // Create a new array to avoid modifying the original
    const result = [];
    
    // Group metrics by size categories 
    const fullMetrics = metrics.filter(m => getSizeSpan(m.size) === 12);
    const largeMetrics = metrics.filter(m => getSizeSpan(m.size) === 9);
    const mediumMetrics = metrics.filter(m => getSizeSpan(m.size) === 6);
    const smallMetrics = metrics.filter(m => getSizeSpan(m.size) === 3);
    
    // We'll maintain a count of columns filled in the current row
    let currentRowColumns = 0;
    
    // Process full-width metrics first (they always start a new row)
    for (const metric of fullMetrics) {
      result.push(metric);
      currentRowColumns = 0; // Reset column count for next row
    }
    
    // Next, pair medium metrics (they take half the width each)
    for (let i = 0; i < mediumMetrics.length; i++) {
      if (currentRowColumns === 0) {
        // Start a new row with this medium metric
        result.push(mediumMetrics[i]);
        currentRowColumns = 6;
      } else if (currentRowColumns === 6) {
        // Add this medium metric to complete the row
        result.push(mediumMetrics[i]);
        currentRowColumns = 0;
      } else {
        // This should not happen with our logic, but just in case
        result.push(mediumMetrics[i]);
        currentRowColumns = (currentRowColumns + 6) % 12;
      }
    }
    
    // Now, handle large (9-column) metrics with small (3-column) metrics when possible
    let availableSmallMetrics = [...smallMetrics]; // Create a copy we can modify
    
    while (largeMetrics.length > 0 || availableSmallMetrics.length > 0) {
      if (currentRowColumns === 0) {
        // Start a new row - prioritize large metrics if available
        if (largeMetrics.length > 0) {
          result.push(largeMetrics.shift());
          currentRowColumns = 9;
        } else if (availableSmallMetrics.length > 0) {
          // Start with a small metric if no large ones left
          result.push(availableSmallMetrics.shift());
          currentRowColumns = 3;
        }
      } else if (currentRowColumns === 3) {
        // 3 columns filled, can add either a large or 3 small metrics
        if (largeMetrics.length > 0) {
          result.push(largeMetrics.shift());
          currentRowColumns = 0; // 3 + 9 = 12, next row
        } else if (availableSmallMetrics.length > 0) {
          result.push(availableSmallMetrics.shift());
          currentRowColumns = 6;
        }
      } else if (currentRowColumns === 6) {
        // 6 columns filled, can add either 2 small metrics
        if (availableSmallMetrics.length > 0) {
          result.push(availableSmallMetrics.shift());
          currentRowColumns = 9;
        } else {
          // No more small metrics, start new row
          currentRowColumns = 0;
        }
      } else if (currentRowColumns === 9) {
        // 9 columns filled, can add 1 small metric
        if (availableSmallMetrics.length > 0) {
          result.push(availableSmallMetrics.shift());
          currentRowColumns = 0; // 9 + 3 = 12, next row
        } else {
          // No more small metrics, start new row
          currentRowColumns = 0;
        }
      }
      
      // Safety check to prevent infinite loop if nothing fits
      if (largeMetrics.length === 0 && availableSmallMetrics.length === 0) {
        break;
      }
    }
    
    return result;
  };