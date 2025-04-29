import React, { useState, useEffect } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
import dashboardsService from '../services/dashboards';
import dashboardConfig from '../utils/dashboardConfig';

/**
 * Main Dashboard component with dashboard and tabbed interface
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  const [activeDashboard, setActiveDashboard] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [dashboards, setDashboards] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [tabMetrics, setTabMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Toggle dark mode function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // Save to localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only update if no user preference is saved
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  // Load dashboard configuration
  useEffect(() => {
    const loadDashboards = async () => {
      setIsLoading(true);
      
      try {
        // Load dashboard configuration
        await dashboardConfig.loadConfig();
        
        // Get all dashboards
        const allDashboards = dashboardsService.getAllDashboards();
        setDashboards(allDashboards);
        
        // Set first dashboard as active if no active dashboard
        if (!activeDashboard && allDashboards.length > 0) {
          setActiveDashboard(allDashboards[0].id);
        }
      } catch (error) {
        console.error('Error loading dashboards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboards();
  }, []);
  
  // Update tabs when active dashboard changes
  useEffect(() => {
    if (activeDashboard) {
      const dashboardTabs = dashboardsService.getDashboardTabs(activeDashboard);
      setTabs(dashboardTabs);
      
      // Set first tab as active if no active tab
      if (!activeTab && dashboardTabs.length > 0) {
        setActiveTab(dashboardTabs[0].id);
      } else {
        // Reset active tab if it doesn't exist in the new dashboard
        const tabExists = dashboardTabs.some(tab => tab.id === activeTab);
        if (!tabExists && dashboardTabs.length > 0) {
          setActiveTab(dashboardTabs[0].id);
        }
      }
    } else {
      setTabs([]);
      setActiveTab('');
    }
  }, [activeDashboard]);
  
  // Update metrics when active tab changes
  useEffect(() => {
    if (activeDashboard && activeTab) {
      const metricsForTab = dashboardsService.getTabMetrics(activeDashboard, activeTab);
      setTabMetrics(metricsForTab);
    } else {
      setTabMetrics([]);
    }
  }, [activeDashboard, activeTab]);
  
  // Change the active dashboard and tab
  const handleNavigation = (dashboardId, tabId) => {
    if (dashboardId !== activeDashboard) {
      // Clear existing tabs and metrics first to ensure clean unmounting
      setTabs([]);
      setTabMetrics([]);
      setActiveTab('');
      setActiveDashboard(dashboardId);
      
      // Set the tab after dashboard is updated
      setTimeout(() => {
        setActiveTab(tabId);
      }, 0);
    } else if (tabId !== activeTab) {
      // Just update the tab if the dashboard is the same
      setTabMetrics([]);
      setActiveTab(tabId);
    }
  };
  
  // Get active dashboard name
  const getActiveDashboardName = () => {
    const dashboard = dashboards.find(d => d.id === activeDashboard);
    return dashboard ? dashboard.name : '';
  };
  
  // Get active tab name
  const getActiveTabName = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.name : '';
  };
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard">
      <Header 
        dashboardName={getActiveDashboardName()} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
      
      <div className="dashboard-main">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '▶' : '◀'}
          </div>
          <TabNavigation 
            dashboards={dashboards}
            activeDashboard={activeDashboard}
            tabs={tabs} 
            activeTab={activeTab} 
            onNavigation={handleNavigation}
            isCollapsed={sidebarCollapsed}
          />
        </aside>
        
        <div className="dashboard-content">
          {isLoading ? (
            <div className="loading-indicator">Loading dashboard...</div>
          ) : activeDashboard && activeTab ? (
            <div className="tab-content">
              <MetricGrid 
                key={`grid-${activeDashboard}-${activeTab}`} 
                metrics={tabMetrics}
                isDarkMode={isDarkMode}
              />
            </div>
          ) : (
            <div className="empty-dashboard">
              <p>Select a dashboard and tab to view metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;