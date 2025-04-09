import React from 'react';

/**
 * Dashboard selector component for switching between dashboards
 * @param {Object} props - Component props
 * @param {Array} props.dashboards - Array of dashboards
 * @param {string} props.activeDashboard - Currently active dashboard
 * @param {Function} props.onDashboardChange - Handler for dashboard change
 * @returns {JSX.Element} Dashboard selector component
 */
const DashboardSelector = ({ dashboards, activeDashboard, onDashboardChange }) => {
  // Skip rendering if only one dashboard
  if (dashboards.length <= 1) {
    return null;
  }
  
  return (
    <div className="dashboard-selector">
      <div className="dashboard-tabs">
        {dashboards.map(dashboard => (
          <div 
            key={dashboard.id} 
            className={`dashboard-tab ${activeDashboard === dashboard.id ? 'active' : ''}`}
            onClick={() => onDashboardChange(dashboard.id)}
          >
            {dashboard.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSelector;