/**
 * Date utility functions for the dashboard
 */

/**
 * Get date range in ISO format based on the range code
 * @param {string} range - The range code (e.g., '7d', '30d')
 * @returns {Object} Object with from and to dates in ISO format
 */
export const getDateRange = (range = '7d') => {
    const to = new Date();
    const from = new Date();
    
    const days = parseInt(range.replace('d', ''), 10);
    from.setDate(from.getDate() - days);
    
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Generate an array of dates between two dates
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Array} Array of dates in ISO format
   */
  export const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  /**
   * Get the last update timestamp
   * @returns {string} Formatted timestamp
   */
  export const getLastUpdateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };