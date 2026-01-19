import React from 'react';
import IconComponent from './IconComponent.jsx';

/**
 * Enhanced theme toggle component with SVG icons
 * @param {Object} props - Component props
 * @param {boolean} props.isDarkMode - Current theme state
 * @param {Function} props.toggleTheme - Function to toggle theme
 * @returns {JSX.Element} Theme toggle component
 */
const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme} 
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        // Sun icon for dark mode (clicking switches to light)
        <IconComponent name="sun" size="md" />
      ) : (
        // Moon icon for light mode (clicking switches to dark)
        <IconComponent name="moon" size="md" />
      )}
    </button>
  );
};

export default ThemeToggle;