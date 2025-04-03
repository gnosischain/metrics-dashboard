import React from 'react';
import config from '../utils/config';
import { getLastUpdateTime } from '../utils/dates';

/**
 * Simplified Header component for the dashboard
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="header-title">
        <h1>{config.dashboard.title}</h1>
        <div className="last-updated">
          Last updated: {getLastUpdateTime()}
        </div>
      </div>
    </header>
  );
};

export default Header;