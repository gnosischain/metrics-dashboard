import React from 'react';
import config from '../utils/config';
import { getLastUpdateTime } from '../utils/dates';

/**
 * Header component for the dashboard with logo
 * @returns {JSX.Element} Header component
 */
const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="header-logo-section">
        {/* You can replace this URL with your actual logo path */}
        <img 
          src="https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/3e77e54e899a9b147939ecf350f3f1dc8e1c8c1c/Brand%20Assets/Logo/RGB/LogoLockup_Black_RGB.svg" 
          alt="Dashboard Logo" 
          className="dashboard-logo"
        />
        <div className="header-title">
          <h1>{config.dashboard.title}</h1>
          <div className="last-updated">
            Last updated: {getLastUpdateTime()}
          </div>
        </div>
      </div>
      
      {/* This can be used for additional header actions if needed */}
      <div className="header-actions">
        {/* Example: Buttons, dropdowns, etc. could go here */}
      </div>
    </header>
  );
};

export default Header;