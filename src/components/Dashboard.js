import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
import IconComponent from './IconComponent';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Default to collapsed on mobile, expanded on desktop
    return window.innerWidth <= 768;
  });
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const sidebarRef = useRef(null);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Indexing alert state
  const [showIndexingAlert, setShowIndexingAlert] = useState(true);
  const [indexingMessage, setIndexingMessage] = useState("Data is being indexed. Some metrics may not be fully updated.");
  
  // Auto-hide indexing alert after initial load (optional)
  useEffect(() => {
    // Hide indexing alert after data loads or after a timeout
    // You can replace this with actual logic based on your indexing status
    if (!isLoading && dashboards.length > 0) {
      // Hide after 5 seconds when data is loaded
      const timer = setTimeout(() => {
        setShowIndexingAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, dashboards.length]);

  // Example: Update indexing message based on loading state
  useEffect(() => {
    if (isLoading) {
      setIndexingMessage("Loading dashboard data...");
    } else if (tabMetrics.length === 0 && activeTab) {
      setIndexingMessage("Loading metrics...");
    } else {
      setIndexingMessage("Data is being indexed. Some metrics may not be fully updated.");
    }
  }, [isLoading, tabMetrics.length, activeTab]);
  
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
  
  // Handler for clicks outside the sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 768 && 
        mobileExpanded && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.sidebar-toggle') // Don't close when clicking the toggle button
      ) {
        setMobileExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileExpanded]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Default to collapsed on mobile, expanded on desktop
      if (window.innerWidth <= 768) {
        if (!sidebarCollapsed) {
          setSidebarCollapsed(true);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);
  
  // Load dashboard configuration
  useEffect(() => {
    const loadDashboards = async () => {
      console.log('Dashboard: Starting dashboard loading...');
      setIsLoading(true);
      setShowIndexingAlert(true); // Show alert while loading
      
      try {
        // Load dashboard configuration
        console.log('Dashboard: Loading dashboard config...');
        await dashboardConfig.loadConfig();
        
        // Get all dashboards
        console.log('Dashboard: Getting all dashboards...');
        const allDashboards = dashboardsService.getAllDashboards();
        console.log('Dashboard: Retrieved dashboards:', allDashboards);
        
        setDashboards(allDashboards);
        
        // Set first dashboard as active if no active dashboard
        if (!activeDashboard && allDashboards.length > 0) {
          console.log('Dashboard: Setting first dashboard as active:', allDashboards[0].id);
          setActiveDashboard(allDashboards[0].id);
        }
      } catch (error) {
        console.error('Dashboard: Error loading dashboards:', error);
        setIndexingMessage("Error loading dashboard. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboards();
  }, [activeDashboard]);
  
  // Update tabs when active dashboard changes
  useEffect(() => {
    console.log('Dashboard: Active dashboard changed to:', activeDashboard);
    
    if (activeDashboard) {
        const dashboard = dashboards.find(d => d.id === activeDashboard);
        console.log('Dashboard: Found dashboard object:', dashboard);

        if (dashboard) {
            const dashboardTabs = dashboardsService.getDashboardTabs(activeDashboard);
            console.log('Dashboard: Retrieved tabs for dashboard:', dashboardTabs);
            setTabs(dashboardTabs);

            // Set the active tab based on the new set of tabs
            setActiveTab(currentActiveTab => {
                const isCurrentTabValid = dashboardTabs.some(t => t.id === currentActiveTab);
                
                if (dashboard.hasDefaultTab && dashboardTabs.length > 0) {
                    console.log('Dashboard: Using default tab:', dashboardTabs[0].id);
                    return dashboardTabs[0].id; // Always use the default tab for these dashboards
                }
                
                if (isCurrentTabValid) {
                    console.log('Dashboard: Keeping current tab:', currentActiveTab);
                    return currentActiveTab; // Keep current tab if it exists in the new set
                }
                
                if (dashboardTabs.length > 0) {
                    console.log('Dashboard: Falling back to first tab:', dashboardTabs[0].id);
                    return dashboardTabs[0].id; // Otherwise, fallback to the first tab
                }

                console.log('Dashboard: No tabs available');
                return ''; // No tabs available
            });
        }
    } else {
        console.log('Dashboard: No active dashboard, clearing tabs');
        setTabs([]);
        setActiveTab('');
    }
  }, [activeDashboard, dashboards]);
  
  // Update metrics when active tab changes
  useEffect(() => {
    console.log('Dashboard: Active tab changed to:', activeTab, 'for dashboard:', activeDashboard);
    
    if (activeDashboard && activeTab) {
      const metricsForTab = dashboardsService.getTabMetrics(activeDashboard, activeTab);
      console.log('Dashboard: Retrieved metrics for tab:', metricsForTab);
      setTabMetrics(metricsForTab);
    } else {
      console.log('Dashboard: Clearing metrics');
      setTabMetrics([]);
    }
  }, [activeDashboard, activeTab]);
  
  // Change the active dashboard and tab
  const handleNavigation = useCallback((dashboardId, tabId) => {
    console.log('Dashboard: Navigation requested:', { dashboardId, tabId });
    
    // If changing to a different dashboard
    if (dashboardId !== activeDashboard) {
      // First, check if tabId is valid
      const newDashboard = dashboards.find(d => d.id === dashboardId);
      const newTabs = newDashboard ? dashboardsService.getDashboardTabs(dashboardId) : [];
      
      console.log('Dashboard: Changing dashboard to:', dashboardId, 'with tabs:', newTabs);
      
      // Clear metrics first to ensure clean unmounting
      setTabMetrics([]);
      
      // Set the new dashboard
      setActiveDashboard(dashboardId);
      
      // Then set the new tab
      // If the provided tabId exists, use it; otherwise, use the first tab
      if (tabId && newTabs.some(tab => tab.id === tabId)) {
        console.log('Dashboard: Using provided tab ID:', tabId);
        setActiveTab(tabId);
      } else if (newTabs.length > 0) {
        console.log('Dashboard: Using first available tab:', newTabs[0].id);
        setActiveTab(newTabs[0].id);
      } else {
        console.log('Dashboard: No tabs available for dashboard');
        setActiveTab('');
      }
      
      // On mobile, automatically close the sidebar after navigation
      if (window.innerWidth <= 768) {
        setMobileExpanded(false);
      }
    } 
    // Just changing tabs within the same dashboard
    else if (tabId !== activeTab) {
      console.log('Dashboard: Changing tab to:', tabId);
      // Just update the tab
      setTabMetrics([]);
      setActiveTab(tabId);
      
      // On mobile, automatically close the sidebar after navigation
      if (window.innerWidth <= 768) {
        setMobileExpanded(false);
      }
    }
  }, [activeDashboard, activeTab, dashboards]);
  
  // Get active dashboard name
  const getActiveDashboardName = () => {
    const dashboard = dashboards.find(d => d.id === activeDashboard);
    return dashboard ? dashboard.name : '';
  };
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    // On mobile
    if (window.innerWidth <= 768) {
      setMobileExpanded(!mobileExpanded);
    } 
    // On desktop
    else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  console.log('Dashboard: Rendering with state:', {
    isLoading,
    dashboardsCount: dashboards.length,
    activeDashboard,
    activeTab,
    tabsCount: tabs.length,
    metricsCount: tabMetrics.length
  });

  return (
    <div className="dashboard">
      <Header 
        dashboardName={getActiveDashboardName()} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        showIndexingAlert={showIndexingAlert}
        indexingMessage={indexingMessage}
      />
      
      <div className="dashboard-main">
        <aside 
          ref={sidebarRef}
          className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileExpanded ? 'mobile-expanded' : ''}`}
        >
          <TabNavigation 
            dashboards={dashboards}
            activeDashboard={activeDashboard}
            tabs={tabs} 
            activeTab={activeTab} 
            onNavigation={handleNavigation}
            isCollapsed={sidebarCollapsed && !mobileExpanded}
          />
        </aside>
        
        {/* Move sidebar toggle here - outside the sidebar */}
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          <IconComponent 
            name={
              // On mobile
              window.innerWidth <= 768 
                ? (mobileExpanded ? 'chevron-left' : 'chevron-right')
                // On desktop
                : (sidebarCollapsed ? 'chevron-right' : 'chevron-left')
            } 
            size="sm"
          />
        </div>
        
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
          ) : dashboards.length === 0 ? (
            <div className="empty-dashboard">
              <p>No dashboards configured. Please check your dashboard configuration.</p>
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