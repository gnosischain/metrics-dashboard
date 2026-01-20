import React from 'react';

/**
 * Expand/Collapse button for chart components
 * @param {Object} props - Component props
 * @param {boolean} props.isExpanded - Whether the chart is expanded
 * @param {Function} props.onClick - Handler for click event
 * @returns {JSX.Element} Expand button component
 */
const ExpandButton = ({ isExpanded, onClick }) => {
  return (
    <button 
      className="expand-chart-button" 
      onClick={onClick} 
      aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
      title={isExpanded ? "Collapse chart" : "Expand chart"}
    >
      {isExpanded ? (
        // Collapse icon (simple X)
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        // Expand icon (arrows pointing outward)
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      )}
    </button>
  );
};

export default ExpandButton;