import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * Enhanced Header component for the dashboard with logo
 * @param {Object} props - Component props
 * @param {string} props.dashboardName - Currently active dashboard name
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {Function} props.toggleTheme - Function to toggle theme
 * @returns {JSX.Element} Header component
 */
const Header = ({ dashboardName, isDarkMode, toggleTheme }) => {
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
      </div>
      
      <div className="header-actions">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};

export default Header;