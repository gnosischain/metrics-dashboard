import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Enhanced Header component for the dashboard with logo and indexing status
 * @param {Object} props - Component props
 * @param {string} props.dashboardName - Currently active dashboard name
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {Function} props.toggleTheme - Function to toggle theme
 * @param {boolean} props.showIndexingAlert - Whether to show the indexing alert
 * @param {string} props.indexingMessage - Custom message for indexing alert
 * @returns {JSX.Element} Header component
 */
const Header = ({ 
  dashboardName, 
  isDarkMode, 
  toggleTheme,
  showIndexingAlert = false,
  indexingMessage = "Data is being indexed. Some metrics may not be fully updated."
}) => {
  // Different logo URLs for light and dark mode
  const logoUrl = isDarkMode 
    ? "https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/main/Brand%20Assets/Logo/RGB/LogoLockup_White_RGB.png"
    : "https://raw.githubusercontent.com/gnosis/gnosis-brand-assets/3e77e54e899a9b147939ecf350f3f1dc8e1c8c1c/Brand%20Assets/Logo/RGB/LogoLockup_Black_RGB.svg";

  return (
    <header className="dashboard-header">
      <div className="header-logo-section">
        <img 
          src={logoUrl}
          alt="Dashboard Logo" 
          className="dashboard-logo"
        />
        <div className="header-title">
          <div className="analytics-title">Analytics</div>
        </div>
        
        {/* Indexing Alert Box */}
        {showIndexingAlert && (
          <div className="indexing-alert">
            <div className="indexing-alert-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm9-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 7a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 7z"/>
              </svg>
            </div>
            <span className="indexing-alert-text">{indexingMessage}</span>
          </div>
        )}
      </div>
      
      <div className="header-actions">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};

export default Header;