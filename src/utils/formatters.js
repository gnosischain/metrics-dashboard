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

export const formatPercentageInt = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return Math.round(value) + '%';
};

export const formatCurrencyCompact = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  const v = Number(value);
  if (Math.abs(v) >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
  return '$' + v.toFixed(0);
};

export const formatNumberCompact = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const v = Number(value);
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (v % 1 !== 0) return v.toFixed(2);
  return String(v);
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Export all formatters as default object for easier imports
/**
 * Truncate a hex string (pubkey, withdrawal_credentials, withdrawal_address) to a
 * `0xabcd…wxyz` form so long identifier columns don't dominate table rendering.
 * TableWidget handles click-to-copy using the `data-copy-value` attribute. The
 * full value is also in the title attribute for on-hover inspection.
 *
 * @param {string} value - The hex string to truncate.
 * @returns {string} HTML string with truncated text and copy metadata.
 */
export const formatTruncateHex = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value);
  if (str.length <= 14) return escapeHtml(str);
  const head = str.slice(0, 6);
  const tail = str.slice(-4);
  const truncated = `${head}…${tail}`;
  const escapedValue = escapeHtml(str);
  const escapedTruncated = escapeHtml(truncated);
  return `<span class="hex-copy" title="${escapedValue} — click to copy" data-copy-value="${escapedValue}" style="cursor:pointer;font-family:monospace;">${escapedTruncated}</span>`;
};

/**
 * Tabulator cell formatter that renders a percentage as a horizontal bar
 * filled proportional to the value, with the numeric label overlaid. Used
 * for top-holders / cumulative-share columns where the visual ramp is
 * more informative than the bare number alone.
 *
 * @param {number} rawValue - The percentage value (0-100, may exceed 100).
 * @param {{ decimals?: number, accent?: string }} [options]
 * @returns {string} HTML for the bar.
 */
export const formatPercentageBar = (rawValue, options = {}) => {
  const { decimals = 2, accent = 'primary' } = options;
  if (rawValue === null || rawValue === undefined || rawValue === '' || Number.isNaN(Number(rawValue))) {
    return '<span class="pct-bar pct-bar--empty">-</span>';
  }
  const value = Number(rawValue);
  const clamped = Math.max(0, Math.min(100, value));
  const label = `${value.toFixed(decimals)}%`;
  return (
    `<span class="pct-bar pct-bar--${escapeHtml(accent)}" role="img" aria-label="${escapeHtml(label)}">` +
      `<span class="pct-bar__fill" style="width:${clamped.toFixed(2)}%"></span>` +
      `<span class="pct-bar__label">${escapeHtml(label)}</span>` +
    '</span>'
  );
};

const formatters = {
  formatNumber,
  formatBytes,
  formatPercentage,
  formatPercentageInt,
  formatPercentageBar,
  formatDuration,
  formatValue,
  formatNumberWithXDAI,
  formatNumberWithUSD,
  formatNumberWithGNO,
  formatCurrency,
  formatCurrencyCompact,
  formatNumberCompact,
  formatTruncateHex
};

export default formatters;
