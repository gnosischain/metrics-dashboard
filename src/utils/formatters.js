/**
 * Value formatting utilities
 */

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a number as a byte size (KB, MB, GB, etc.)
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted byte size
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0 || bytes === null || bytes === undefined) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format a percentage
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  return value.toFixed(decimals) + '%';
};

/**
 * Format a duration in seconds to a human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '0 sec';
  
  if (seconds < 60) {
    return seconds.toFixed(2) + ' sec';
  } else if (seconds < 3600) {
    return (seconds / 60).toFixed(2) + ' min';
  } else {
    return (seconds / 3600).toFixed(2) + ' hr';
  }
};

/**
 * Format a value based on its type and magnitude
 * @param {number} value - The value to format
 * @param {string} format - Format type (optional)
 * @returns {string} Formatted value
 */
export const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-';
  
  // Use specific formatter if provided
  if (format && formatters[format]) {
    return formatters[format](value);
  }
  
  // Auto-format based on value
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (value % 1 !== 0) {
      return value.toFixed(2);
    }
    return value.toString();
  }
  
  return String(value);
};

export const formatNumberWithXDAI = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0 xDAI';
  const full = new Intl.NumberFormat('en-US').format(Number(value));
  return `${full} xDAI`;
};

export const formatNumberWithUSD = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const full = new Intl.NumberFormat('en-US').format(Number(value));
  return `$${full}`;
};

/**
 * Format a number as currency (USD) with proper separators and 2 decimal places
 * @param {number} value - The value to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
};

export const formatNumberWithGNO = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0 GNO';
  const full = new Intl.NumberFormat('en-US').format(Number(value));
  return `${full} GNO`;
};

// Export all formatters as default object for easier imports
const formatters = {
  formatNumber,
  formatBytes,
  formatPercentage,
  formatDuration,
  formatValue,
  formatNumberWithXDAI,
  formatNumberWithUSD,
  formatNumberWithGNO,
  formatCurrency
};

export default formatters;