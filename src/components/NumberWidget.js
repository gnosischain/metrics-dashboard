import React from 'react';
import formatters from '../utils/formatter';

/**
 * Component to display a metric as a large number
 * @param {Object} props - Component props
 * @param {number|string} props.value - The value to display
 * @param {string} props.format - The format to apply (e.g., formatNumber, formatBytes)
 * @param {string} props.color - Color for the value
 * @param {string} props.label - Label for the value
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @returns {JSX.Element} Number widget component
 */
const NumberWidget = ({ value, format = 'formatNumber', color = '#0969DA', label, isDarkMode = false }) => {
  // Apply formatting if specified
  const formattedValue = format && formatters[format] 
    ? formatters[format](value)
    : value;
    
  // Adjust color for dark mode if the color is the default one
  const adjustedColor = isDarkMode ? '#58A6FF' : color;
    
  return (
    <div className="number-widget">
      <div 
        className="number-value" 
        style={{ 
          color: adjustedColor
        }}
      >
        {formattedValue}
      </div>
      {label && (
        <div 
          className="number-label" 
          style={{
            color: isDarkMode ? '#8B949E' : '#57606A',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
        </div>
      )}
    </div>
  );
};

export default NumberWidget;