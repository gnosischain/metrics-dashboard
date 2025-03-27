/**
 * Utility functions for formatting values
 */

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  /**
   * Format a number as a byte size (KB, MB, GB, etc.)
   * @param {number} bytes - The number of bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted byte size
   */
  export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };
  
  /**
   * Format a percentage
   * @param {number} value - The value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  export const formatPercentage = (value, decimals = 2) => {
    return value.toFixed(decimals) + '%';
  };
  
  /**
   * Format a duration in seconds to a human-readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  export const formatDuration = (seconds) => {
    if (seconds < 60) {
      return seconds.toFixed(2) + ' sec';
    } else if (seconds < 3600) {
      return (seconds / 60).toFixed(2) + ' min';
    } else {
      return (seconds / 3600).toFixed(2) + ' hr';
    }
  };