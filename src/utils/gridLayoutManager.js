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
  
  // Sort metrics to optimize layout
  // Larger items first, then by vertical size
  return metricsWithDefaults.sort((a, b) => {
    const sizeOrder = { full: 4, large: 3, medium: 2, small: 1 };
    const vSizeOrder = { xl: 4, large: 3, medium: 2, small: 1 };
    
    const aSizeValue = sizeOrder[a.size] || 2;
    const bSizeValue = sizeOrder[b.size] || 2;
    const aVSizeValue = vSizeOrder[a.vSize] || 2;
    const bVSizeValue = vSizeOrder[b.vSize] || 2;
    
    // Primary sort by horizontal size (larger first)
    if (aSizeValue !== bSizeValue) {
      return bSizeValue - aSizeValue;
    }
    
    // Secondary sort by vertical size (larger first)
    return bVSizeValue - aVSizeValue;
  });
};

/**
 * Calculate grid row and column positions
 * @param {Array} metrics - Array of metric configurations
 * @param {number} maxColumns - Maximum columns in grid (default: 12)
 * @returns {Array} Metrics with calculated positions
 */
export const calculateGridPositions = (metrics, maxColumns = 12) => {
  if (!metrics || metrics.length === 0) return [];
  
  const optimizedMetrics = optimizeGridLayout(metrics);
  let currentRow = 1;
  let currentColumn = 1;
  
  return optimizedMetrics.map(metric => {
    const span = getSizeSpan(metric.size);
    
    // Check if metric fits in current row
    if (currentColumn + span - 1 > maxColumns) {
      // Move to next row
      currentRow++;
      currentColumn = 1;
    }
    
    const positionedMetric = {
      ...metric,
      gridRow: currentRow,
      gridColumn: currentColumn,
      gridColumnSpan: span
    };
    
    // Update position for next metric
    currentColumn += span;
    
    return positionedMetric;
  });
};

/**
 * Default export object
 */
const GridLayoutManager = {
  getSizeSpan,
  getVerticalSize,
  optimizeGridLayout,
  calculateGridPositions
};

export default GridLayoutManager;