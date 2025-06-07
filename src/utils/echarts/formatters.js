/**
 * ECharts-specific formatting utilities
 */

import formatters from '../formatters';

/**
 * Format value using the specified formatter
 * @param {number|string} value - Value to format
 * @param {string} format - Format type
 * @returns {string} Formatted value
 */
export const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-';
  
  if (format && formatters[format]) {
    return formatters[format](value);
  }
  
  // Use the default formatValue from formatters
  return formatters.formatValue(value, format);
};

/**
 * Create a tooltip formatter function
 * @param {string} format - Format type
 * @returns {Function} Tooltip formatter function
 */
export const createTooltipFormatter = (format) => {
  return (params) => {
    if (Array.isArray(params)) {
      let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
      params.forEach(param => {
        if (param.value !== null && param.value !== undefined) {
          tooltip += `${param.seriesName}: <strong>${formatValue(param.value, format)}</strong><br/>`;
        }
      });
      return tooltip;
    } else {
      return `${params.name}<br/><strong>${formatValue(params.value, format)}</strong>`;
    }
  };
};

/**
 * Create an axis label formatter function
 * @param {string} format - Format type
 * @returns {Function} Axis label formatter function
 */
export const createAxisFormatter = (format) => {
  return (value) => formatValue(value, format);
};

const echartsFormatters = {
  formatValue,
  createTooltipFormatter,
  createAxisFormatter
};

export default echartsFormatters;