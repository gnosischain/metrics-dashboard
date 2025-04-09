import React from 'react';

/**
 * TabNavigation component for switching between dashboard tabs
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects
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
            key={tab.id} 
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabNavigation;