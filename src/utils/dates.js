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
 * Get cutoff Date for a time range label (e.g. '1M', '3M', '1Y', 'ALL').
 * Returns null for 'ALL' (no cutoff).
 * @param {string} range - Range label
 * @returns {Date|null}
 */
export const getTimeRangeCutoff = (range) => {
  const now = new Date();
  switch (range) {
    case '7D':  now.setDate(now.getDate() - 7); break;
    case '1M':  now.setMonth(now.getMonth() - 1); break;
    case '3M':  now.setMonth(now.getMonth() - 3); break;
    case '6M':  now.setMonth(now.getMonth() - 6); break;
    case 'YTD': now.setMonth(0); now.setDate(1); break;
    case '1Y':  now.setFullYear(now.getFullYear() - 1); break;
    case '2Y':  now.setFullYear(now.getFullYear() - 2); break;
    case '3Y':  now.setFullYear(now.getFullYear() - 3); break;
    case '5Y':  now.setFullYear(now.getFullYear() - 5); break;
    case 'ALL': return null;
    default:    return null;
  }
  return now;
};

/**
 * Filter a data array by time range, keeping only rows where the date field >= cutoff.
 * Returns the original array for empty input, missing range, or 'ALL'.
 * @param {Array} dataArray - Array of data objects
 * @param {string} timeRange - Range label (e.g. '1M', '3M', '1Y', 'ALL')
 * @param {string} xField - Name of the date field in each row
 * @returns {Array}
 */
export const filterDataByTimeRange = (dataArray, timeRange, xField = 'date') => {
  if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) return dataArray;
  if (!timeRange || timeRange === 'ALL') return dataArray;

  const cutoff = getTimeRangeCutoff(timeRange);
  if (!cutoff) return dataArray;

  const cutoffStr = cutoff.toISOString().split('T')[0];
  return dataArray.filter(row => {
    const dateVal = row[xField];
    if (!dateVal) return true; // keep rows without a date field
    const normalized = String(dateVal).substring(0, 10);
    return normalized >= cutoffStr;
  });
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