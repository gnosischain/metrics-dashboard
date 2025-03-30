/**
 * Date utility functions
 */

/**
 * Get date range in ISO format based on range code
 * @param {string} range - Range code (e.g., '7d', '30d')
 * @returns {Object} Object with from and to dates
 */
export const getDateRange = (range = '7d') => {
  const to = new Date();
  const from = new Date();
  
  if (range.endsWith('d')) {
    const days = parseInt(range.replace('d', ''), 10);
    from.setDate(from.getDate() - days);
  } else if (range.endsWith('h')) {
    const hours = parseInt(range.replace('h', ''), 10);
    from.setHours(from.getHours() - hours);
  } else if (range.endsWith('m')) {
    const months = parseInt(range.replace('m', ''), 10);
    from.setMonth(from.getMonth() - months);
  } else {
    // Default to 7 days
    from.setDate(from.getDate() - 7);
  }
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Get the last update timestamp
 * @returns {string} Formatted timestamp
 */
export const getLastUpdateTime = () => {
  return new Date().toLocaleString();
};