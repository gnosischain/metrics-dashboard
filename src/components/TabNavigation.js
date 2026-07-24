import React, { useState, useEffect, useRef } from 'react';
import IconComponent from './IconComponent';

/**
 * Hierarchical TabNavigation component for switching between dashboards and tabs
 * @param {Object} props - Component props
 * @param {Array} props.dashboards - Array of dashboard objects
 * @param {string} props.activeDashboard - Currently active dashboard
 * @param {Array} props.tabs - Array of tab objects
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onNavigation - Handler for navigation changes
 * @param {boolean} props.isCollapsed - Whether the sidebar is collapsed
 * @returns {JSX.Element} Tab navigation component
 */
const TabNavigation = ({ dashboards, activeDashboard, tabs, activeTab, onNavigation, isCollapsed }) => {
  // Manual expand/collapse overrides on top of the accordion default
  // (only the active dashboard's tab list is open).
  const [expandedDashboards, setExpandedDashboards] = useState({});
  const navRef = useRef(null);

  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector('.tab-item.active, .dashboard-header.active');
    if (!activeEl) return;
    const sidebar = navRef.current.closest('.dashboard-sidebar');
    if (!sidebar) return;
    const elRect = activeEl.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    const isAbove = elRect.top < sidebarRect.top;
    const isBelow = elRect.bottom > sidebarRect.bottom;
    if (isAbove || isBelow) {
      sidebar.scrollTop += elRect.top - sidebarRect.top - 80;
    }
  }, [activeDashboard, activeTab]);

  // Navigating to another sector resets manual overrides so the sidebar
  // returns to the clean accordion state (only the new sector open).
  useEffect(() => {
    setExpandedDashboards({});
  }, [activeDashboard]);

  // Determine if a dashboard's tab list is open. Accordion default: only the
  // active dashboard is expanded; manual toggles override until navigation.
  const isDashboardExpanded = (dashboardId) => {
    if (expandedDashboards[dashboardId] !== undefined) {
      return expandedDashboards[dashboardId];
    }
    return dashboardId === activeDashboard;
  };

  // Toggle dashboard expansion
  const toggleDashboard = (dashboardId) => {
    setExpandedDashboards(prev => ({
      ...prev,
      [dashboardId]: !(prev[dashboardId] ?? (dashboardId === activeDashboard))
    }));
  };
  
  // Get the first tab ID for a dashboard
  const getFirstTabId = (dashboard) => {
    if (dashboard.tabs && dashboard.tabs.length > 0) {
      return dashboard.tabs[0].id;
    }
    return '';
  };

  // Consecutive dashboards sharing a `group` render under one section label
  // (expanded sidebar) or after a thin divider (collapsed sidebar). Ungrouped
  // dashboards that follow a group get a divider so they read as standalone.
  const buildNavEntries = () => {
    const entries = [];
    let previousGroup = null;
    dashboards.forEach((dashboard, index) => {
      const group = dashboard.group || null;
      if (group !== previousGroup) {
        if (group) {
          entries.push({ type: 'group', name: group, key: `group-${group}` });
        } else if (index > 0) {
          entries.push({ type: 'divider', key: `divider-${dashboard.id}` });
        }
        previousGroup = group;
      }
      entries.push({ type: 'dashboard', dashboard, key: dashboard.id });
    });
    return entries;
  };

  const navEntries = buildNavEntries();

  // If collapsed, show only icons
  if (isCollapsed) {
    return (
      <div className="tab-navigation collapsed" ref={navRef}>
        <ul className="dashboard-list">
          {navEntries.map(entry => {
            if (entry.type === 'group' || entry.type === 'divider') {
              return <li key={entry.key} className="nav-group-divider" aria-hidden="true" />;
            }
            const { dashboard } = entry;
            return (
              <li key={entry.key} className="dashboard-item">
                <div 
                  className={`dashboard-header icon-only ${activeDashboard === dashboard.id ? 'active' : ''}`}
                  onClick={() => {
                    // For all dashboards, navigate to first tab
                    const firstTabId = getFirstTabId(dashboard);
                    if (firstTabId) {
                      onNavigation(dashboard.id, firstTabId);
                    }
                  }}
                  title={dashboard.name}
                >
                  <span className="dashboard-icon">
                    <IconComponent 
                      name={dashboard.iconClass} 
                      fallback={dashboard.icon || dashboard.name.charAt(0)} 
                      size="md"
                      color="currentColor"
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // Normal expanded view
  return (
    <div className="tab-navigation" ref={navRef}>
      <ul className="dashboard-list">
        {navEntries.map(entry => {
          if (entry.type === 'group') {
            return <li key={entry.key} className="nav-group-label">{entry.name}</li>;
          }
          if (entry.type === 'divider') {
            return <li key={entry.key} className="nav-group-divider" aria-hidden="true" />;
          }
          const { dashboard } = entry;
          // Get the first tab for this dashboard
          const firstTabId = getFirstTabId(dashboard);
          
          // Check if this is a dashboard with no tabs UI
          const isTablessDashboard = dashboard.hasDefaultTab === true;
          
          return (
            <li key={dashboard.id} className="dashboard-item">
              <div 
                className={`dashboard-header ${activeDashboard === dashboard.id ? 'active' : ''}`}
                onClick={() => {
                  // Header click navigates: inactive sectors open on their
                  // first tab (which also expands them via the accordion),
                  // the active sector just toggles its tab list.
                  if (dashboard.id !== activeDashboard && firstTabId) {
                    onNavigation(dashboard.id, firstTabId);
                  } else if (!isTablessDashboard) {
                    toggleDashboard(dashboard.id);
                  }
                }}
              >
                <div className="dashboard-header-content">
                  <span className="dashboard-icon">
                    <IconComponent 
                      name={dashboard.iconClass} 
                      fallback={dashboard.icon || dashboard.name.charAt(0)} 
                      size="md"
                      color="currentColor"
                    />
                  </span>
                  <span className="dashboard-name">{dashboard.name}</span>
                </div>
                
                {/* Only show expand icon for dashboards with tabs */}
                {!isTablessDashboard && (
                  <span 
                    className="expand-icon"
                    title={isDashboardExpanded(dashboard.id) ? 'Collapse tabs' : 'Show tabs'}
                    onClick={(event) => {
                      // Chevron peeks at a sector's tabs without navigating.
                      event.stopPropagation();
                      toggleDashboard(dashboard.id);
                    }}
                  >
                    <IconComponent 
                      name={isDashboardExpanded(dashboard.id) ? 'chevron-down' : 'chevron-right'} 
                      size="sm"
                    />
                  </span>
                )}
              </div>
              
              {/* Only show tab list for dashboards with tabs and when expanded */}
              {!isTablessDashboard && isDashboardExpanded(dashboard.id) && (
                <ul className="tab-list">
                  {dashboard.tabs && dashboard.tabs.map(tab => (
                    <li 
                      key={tab.id} 
                      className={`tab-item ${activeDashboard === dashboard.id && activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => onNavigation(dashboard.id, tab.id)}
                    >
                      <div className="tab-item-content">
                        <span className="tab-icon">
                          <IconComponent 
                            name={tab.iconClass} 
                            fallback={tab.icon || '•'} 
                            size="sm"
                            color="currentColor"
                          />
                        </span>
                        <span className="tab-name">{tab.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TabNavigation;