import React from 'react';
import formatters from '../utils/formatter';

/**
 * Component to display a metric as a large number
 * @param {Object} props - Component props
 * @param {number|string} props.value - The value to display
 * @param {string} props.format - The format to apply (e.g., formatNumber, formatBytes)
 * @param {string} props.color - Color for the value
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @returns {JSX.Element} Number widget component
 */
const NumberWidget = ({ value, format = 'formatNumber', color = '#4285F4', isDarkMode = false }) => {
  // Apply formatting if specified
  const formattedValue = format && formatters[format] 
    ? formatters[format](value)
    : value;
    
  // Adjust color for dark mode if the color is the default one
  const adjustedColor = isDarkMode && color === '#4285F4' ? '#77aaff' : color;
    
  return (
    <div className="number-widget">
      <div 
        className="number-value" 
        style={{ 
          color: adjustedColor,
          fontSize: '1.5rem' 
        }}
      >
        {formattedValue}
      </div>
    </div>
  );
};

export default NumberWidget;