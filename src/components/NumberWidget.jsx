import React from 'react';
import formatters from '../utils/formatters';

/**
 * Component to display a metric as a large number with optional change indicators
 * @param {Object} props - Component props
 * @param {number|string} props.value - The value to display
 * @param {string} props.format - The format to apply (e.g., formatNumber, formatBytes)
 * @param {string} props.color - Color for the value
 * @param {string} props.label - Label for the value
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {string} props.variant - Layout variant: 'default' or 'compact'
 * @param {number|string} props.changeValue - Change value (percentage or absolute)
 * @param {string} props.changeType - Type of change: 'positive', 'negative', or 'neutral'
 * @param {boolean} props.showChange - Whether to show change indicator
 * @param {string} props.changePeriod - Period for the change (e.g., '30d ago', 'from last month')
 * @returns {JSX.Element} Number widget component
 */
const NumberWidget = ({ 
  value, 
  format = 'formatNumber', 
  color = '#0969DA', 
  label, 
  isDarkMode = false,
  variant = 'default',
  changeValue,
  changeType = 'neutral',
  showChange = false,
  changePeriod = '',
  fontSize
}) => {
  // Apply formatting if specified
  const formattedValue = format && formatters[format] 
    ? formatters[format](value)
    : value;
    
  // Adjust color for dark mode if the color is the default one
  const adjustedColor = isDarkMode ? '#58A6FF' : color;

  // Format change value
  const formattedChange = React.useMemo(() => {
    if (!changeValue) return '';
    
    // If it's already a formatted string (like "+0.07%"), use as is
    if (typeof changeValue === 'string' && (changeValue.includes('%') || changeValue.includes('+'))) {
      return changeValue;
    }
    
    // Otherwise format as percentage
    const numericChange = parseFloat(changeValue);
    if (isNaN(numericChange)) return '';
    
    const sign = numericChange > 0 ? '+' : '';
    return `${sign}${numericChange.toFixed(2)}%`;
  }, [changeValue]);

  // Determine arrow direction and colors
  const getChangeStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '0.125rem 0.375rem',
      borderRadius: '0.25rem',
      whiteSpace: 'nowrap'
    };

    switch (changeType) {
      case 'positive':
        return {
          ...baseStyles,
          color: isDarkMode ? '#3FB950' : '#1a7f37',
          backgroundColor: isDarkMode ? 'rgba(63, 185, 80, 0.15)' : 'rgba(26, 127, 55, 0.1)'
        };
      case 'negative':
        return {
          ...baseStyles,
          color: isDarkMode ? '#F85149' : '#cf222e',
          backgroundColor: isDarkMode ? 'rgba(248, 81, 73, 0.15)' : 'rgba(207, 34, 46, 0.1)'
        };
      default:
        return {
          ...baseStyles,
          color: isDarkMode ? '#8B949E' : '#656d76',
          backgroundColor: isDarkMode ? 'rgba(139, 148, 158, 0.1)' : 'rgba(101, 109, 118, 0.1)'
        };
    }
  };

  // Render arrow icon
  const ArrowIcon = ({ direction }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      {direction === 'up' ? (
        <path d="M6 2l4 4H7v4H5V6H2l4-4z" />
      ) : direction === 'down' ? (
        <path d="M6 10L2 6h3V2h2v4h3l-4 4z" />
      ) : (
        <circle cx="6" cy="6" r="1" />
      )}
    </svg>
  );

  // Compact variant (horizontal layout)
  if (variant === 'compact') {
    return (
      <div className="number-widget number-widget-compact">
        <div className="compact-number-container">
          {/* Main content group */}
          <div className="compact-main-content">
            {/* Main number */}
            <span 
              className="compact-number-value" 
              style={{ 
                color: adjustedColor,
                ...(fontSize && { fontSize })
              }}
            >
              {formattedValue}
            </span>
            
            {/* Label */}
            {label && (
              <span className="compact-number-label">
                {label}
              </span>
            )}
          </div>
          
          {/* Change indicator */}
          {showChange && formattedChange && (
            <span className="compact-change-indicator" style={getChangeStyles()}>
              <ArrowIcon direction={changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'neutral'} />
              {formattedChange}
              {changePeriod && (
                <span className="change-period">{changePeriod}</span>
              )}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default variant (vertical layout - existing behavior)
  return (
    <div className="number-widget">
      <div 
        className="number-value" 
        style={{ 
          color: adjustedColor,
          ...(fontSize && { fontSize })
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
          {label}
        </div>
      )}
      
      {/* Change indicator for default variant */}
      {showChange && formattedChange && (
        <div className="number-change-container" style={{ marginTop: '0.5rem' }}>
          <span className="number-change" style={getChangeStyles()}>
            <ArrowIcon direction={changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'neutral'} />
            {formattedChange}
            {changePeriod && (
              <span className="change-period"> {changePeriod}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default NumberWidget;