import React, { useState } from 'react';
import ExpandButton from './ExpandButton';
import ChartModal from './ChartModal';

/**
 * Card component for wrapping metric widgets
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle or description
 * @param {React.ReactNode} props.headerControls - Optional controls to render in the header
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.expandable - Whether the card can be expanded
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {string} props.chartType - Type of chart in the card
 * @param {boolean} props.minimal - Whether to render without card styling (new prop)
 * @returns {JSX.Element} Card component
 */
const Card = ({ 
  title, 
  subtitle, 
  headerControls, 
  children, 
  expandable = true, 
  isDarkMode = false, 
  chartType,
  minimal = false // New prop for minimal styling
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Special styling for number displays
  const isNumberDisplay = chartType === 'numberDisplay';
  
  // If minimal mode is enabled, render without card wrapper
  if (minimal) {
    return (
      <>
        <div className="minimal-widget-container">
          {/* Optional minimal header - only show if title exists */}
          {(title || subtitle || headerControls) && (
            <div className="minimal-widget-header">
              {(title || subtitle) && (
                <div className="minimal-widget-title">
                  {title && <h3 className="minimal-title">{title}</h3>}
                  {subtitle && <div className="minimal-subtitle">{subtitle}</div>}
                </div>
              )}
              {headerControls && (
                <div className="minimal-widget-controls">
                  {headerControls}
                  {expandable && !isNumberDisplay && (
                    <ExpandButton isExpanded={false} onClick={toggleExpand} />
                  )}
                </div>
              )}
            </div>
          )}
          <div className="minimal-widget-content">
            {children}
          </div>
        </div>

        {/* Modal still available for minimal widgets */}
        {expandable && !isNumberDisplay && (
          <ChartModal 
            isOpen={isExpanded}
            onClose={toggleExpand}
            title={title}
            subtitle={subtitle}
            headerControls={headerControls}
            isDarkMode={isDarkMode}
          >
            {children}
          </ChartModal>
        )}
      </>
    );
  }
  
  // Regular card rendering (existing logic)
  return (
    <>
      <div className={`metric-card ${isNumberDisplay ? 'number-display-card' : ''}`} 
           style={isNumberDisplay ? { 
             boxShadow: 'none', 
             border: 'none',
             "border-left": '1px solid rgba(0,0,0,0.4)', 
             background: 'transparent' 
           } : {}}>
        <div className="card-header" style={isNumberDisplay ? { 
          borderBottom: 'none', 
          background: 'transparent',
          padding: '0.5rem 1rem 0'
        } : {}}>
          <div className="card-header-text">
            <h3 className="card-title">{title}</h3>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          <div className="card-header-controls">
            {headerControls}
            {expandable && !isNumberDisplay && (
              <ExpandButton isExpanded={false} onClick={toggleExpand} />
            )}
          </div>
        </div>
        <div className="card-content" style={isNumberDisplay ? { padding: '0' } : {}}>
          {children}
        </div>
      </div>

      {expandable && !isNumberDisplay && (
        <ChartModal 
          isOpen={isExpanded}
          onClose={toggleExpand}
          title={title}
          subtitle={subtitle}
          headerControls={headerControls}
          isDarkMode={isDarkMode}
        >
          {children}
        </ChartModal>
      )}
    </>
  );
};

export default Card;