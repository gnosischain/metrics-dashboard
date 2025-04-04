import React from 'react';

/**
 * TabNavigation component for switching between dashboard tabs
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab names
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Handler for tab change
 * @returns {JSX.Element} Tab navigation component
 */
const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-navigation">
      <ul className="tab-list">
        {tabs.map(tab => (
          <li 
            key={tab} 
            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabNavigation;