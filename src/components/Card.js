import React, { useState, forwardRef } from 'react';
import ExpandButton from './ExpandButton';
import ChartModal from './ChartModal';

const Card = forwardRef(({ 
  title, 
  subtitle, 
  headerControls, 
  children, 
  expandable = true, 
  isDarkMode = false, 
  chartType,
  variant, // Add variant prop
  minimal = false,
  contentClassName = '' // New prop for custom class on content area
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const isNumberDisplay = chartType === 'numberDisplay';
  
  if (minimal) {
    return (
      <div className="minimal-widget-container" ref={ref}>
        {(title || subtitle || headerControls) && (
          <div className="minimal-widget-header">
            {(title || subtitle) && (
              <div className="minimal-widget-title">
                {title && <h3 className="minimal-title">{title}</h3>}
                {subtitle && <div className="minimal-subtitle">{subtitle}</div>}
              </div>
            )}
            {headerControls && <div className="minimal-widget-controls">{headerControls}</div>}
          </div>
        )}
        <div className={`minimal-widget-content ${contentClassName}`}>{children}</div>
      </div>
    );
  }
  
  return (
    <>
      <div ref={ref} className={`metric-card ${isNumberDisplay ? 'number-display-card' : ''} ${variant === 'compact' ? 'compact' : ''}`}>
        <div className="card-header">
          <div className="card-header-text">
            <h3 className="card-title">{title}</h3>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          <div className="card-header-controls">
            {headerControls}
            {expandable && !isNumberDisplay && <ExpandButton isExpanded={false} onClick={toggleExpand} />}
          </div>
        </div>
        <div className={`card-content ${contentClassName}`}>
          {children}
        </div>
      </div>
      {expandable && !isNumberDisplay && (
        <ChartModal isOpen={isExpanded} onClose={toggleExpand} title={title} subtitle={subtitle} headerControls={headerControls} isDarkMode={isDarkMode}>
          {children}
        </ChartModal>
      )}
    </>
  );
});

Card.displayName = 'Card';

export default Card;