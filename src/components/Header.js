import React from 'react';
import config from '../utils/config';
import { getLastUpdateTime } from '../utils/dates';

/**
 * Header component for the dashboard
 * @param {Object} props - Component props
 * @param {string} props.dateRange - Current date range
 * @param {Function} props.onDateRangeChange - Handler for date range change
 * @param {Function} props.onRefresh - Handler for refresh button click
 * @returns {JSX.Element} Header component
 */
const Header = ({ dateRange, onDateRangeChange, onRefresh }) => {
  return (
    <header className="dashboard-header">
      <div className="header-title">
        <h1>{config.dashboard.title}</h1>
        <div className="last-updated">
          Last updated: {getLastUpdateTime()}
        </div>
      </div>
      
      <div className="header-controls">
        <div className="date-range-selector">
          <label htmlFor="date-range">Date Range:</label>
          <select 
            id="date-range"
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
          >
            {config.dateRanges.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button className="refresh-button" onClick={onRefresh}>
          Refresh Data
        </button>
      </div>
    </header>
  );
};

export default Header;