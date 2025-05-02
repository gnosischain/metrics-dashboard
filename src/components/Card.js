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
 * @returns {JSX.Element} Card component
 */
const Card = ({ title, subtitle, headerControls, children, expandable = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className="metric-card">
        <div className="card-header">
          <div className="card-header-text">
            <h3 className="card-title">{title}</h3>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          <div className="card-header-controls">
            {headerControls}
            {expandable && (
              <ExpandButton isExpanded={false} onClick={toggleExpand} />
            )}
          </div>
        </div>
        <div className="card-content">
          {children}
        </div>
      </div>

      {expandable && (
        <ChartModal 
          isOpen={isExpanded}
          onClose={toggleExpand}
          title={title}
          subtitle={subtitle}
          headerControls={headerControls}
        >
          {children}
        </ChartModal>
      )}
    </>
  );
};

export default Card;