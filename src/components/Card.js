import React from 'react';

/**
 * Card component for wrapping metric widgets
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle or description
 * @param {React.ReactNode} props.children - Card content
 * @returns {JSX.Element} Card component
 */
const Card = ({ title, subtitle, children }) => {
  return (
    <div className="metric-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;