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
  variant, 
  cardVariant = 'default',
  minimal = false,
  contentClassName = '',
  titleFontSize = null
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  const isNumberDisplay = chartType === 'numberDisplay' || chartType === 'kpi';

  // Stage 4: collapse legacy variants onto unified .card--{outline|ghost} system
  const VARIANT_ALIASES = {
    'number-display-card': 'default',
    'compact': 'ghost',
    'card-variant-outline': 'outline',
    'outline': 'outline',
  };
  const legacyTokens = [
    isNumberDisplay ? 'number-display-card' : null,
    variant === 'compact' ? 'compact' : null,
    cardVariant && cardVariant !== 'default' ? `card-variant-${cardVariant}` : null,
  ].filter(Boolean);
  const resolvedVariants = new Set(
    legacyTokens.map((tok) => VARIANT_ALIASES[tok] ?? tok).filter((v) => v && v !== 'default')
  );
  const variantClasses = Array.from(resolvedVariants).map((v) => `card--${v}`).join(' ');
  const numberDisplayHook = isNumberDisplay ? 'number-display-card' : '';
  
  if (minimal) {
    return (
      <div className="minimal-widget-container" ref={ref}>
        {(title || subtitle || headerControls) && (
          <div className="minimal-widget-header">
            {(title || subtitle) && (
              <div className="minimal-widget-title">
                {title && (
                  <h3 
                    className="minimal-title"
                    style={titleFontSize ? { fontSize: titleFontSize } : {}}
                  >
                    {title}
                  </h3>
                )}
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
      <div 
        ref={ref} 
        className={`metric-card ${numberDisplayHook} ${variantClasses}`.trim()}
        data-chart-type={chartType} 
      >
        <div className="card-header">
          <div className="card-header-text">
            <h3 
              className="card-title"
              style={titleFontSize ? { fontSize: titleFontSize } : {}}
            >
              {title}
            </h3>
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
        <ChartModal 
          isOpen={isExpanded} 
          onClose={toggleExpand} 
          title={title} 
          subtitle={subtitle} 
          headerControls={headerControls} 
          isDarkMode={isDarkMode}
          chartType={chartType}
          titleFontSize={titleFontSize}
        >
          {children}
        </ChartModal>
      )}
    </>
  );
});

Card.displayName = 'Card';

export default Card;
