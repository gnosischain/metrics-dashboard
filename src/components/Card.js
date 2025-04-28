import React from 'react';

/**
 * Card component for wrapping metric widgets
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle or description
 * @param {React.ReactNode} props.headerControls - Optional controls to render in the header
 * @param {React.ReactNode} props.children - Card content
 * @returns {JSX.Element} Card component
 */
const Card = ({ title, subtitle, headerControls, children }) => {
  return (
    <div className="metric-card">
      <div className="card-header">
        <div className="card-header-text"> {/* Wrap text */}
            <h3 className="card-title">{title}</h3>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {/* Render controls if provided */}
        {headerControls && (
            <div className="card-header-controls">
                {headerControls}
            </div>
        )}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;