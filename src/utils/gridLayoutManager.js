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
   * Sort metrics by size for optimal layout
   * @param {Array} metrics - Array of metric configurations
   * @returns {Array} Sorted metrics
   */
  export const sortMetricsBySize = (metrics) => {
    // Sort by size (larger first) to optimize layout
    return [...metrics].sort((a, b) => {
      const aSpan = getSizeSpan(a.size);
      const bSpan = getSizeSpan(b.size);
      return bSpan - aSpan; // Larger sizes first
    });
  };
  
  /**
   * Calculate optimal grid layout
   * @param {Array} metrics - Array of metric configurations
   * @returns {Array} Metrics in optimal order
   */
  export const optimizeGridLayout = (metrics) => {
    // First sort by size
    const sortedMetrics = sortMetricsBySize(metrics);
    
    // Implement a more advanced layout algorithm if needed
    // This simple approach just sorts by size which works reasonably well
    return sortedMetrics;
  };