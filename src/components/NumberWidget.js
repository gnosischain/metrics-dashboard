import React from 'react';
import formatters from '../utils/formatter';

/**
 * Component to display a metric as a large number
 * @param {Object} props - Component props
 * @param {number|string} props.value - The value to display
 * @param {string} props.format - The format to apply (e.g., formatNumber, formatBytes)
 * @param {string} props.label - Optional label for the value
 * @param {string} props.color - Color for the value
 * @returns {JSX.Element} Number widget component
 */
const NumberWidget = ({ value, format = 'formatNumber', label = '', color = '#4285F4' }) => {
  // Apply formatting if specified
  const formattedValue = format && formatters[format] 
    ? formatters[format](value)
    : value;
    
  return (
    <div className="number-widget">
      <div 
        className="number-value" 
        style={{ color: color }}
      >
        {formattedValue}
      </div>
    </div>
  );
};

export default NumberWidget;