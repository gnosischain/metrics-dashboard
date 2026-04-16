import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
import IconComponent from './IconComponent';
import dashboardsService from '../services/dashboards';
import dashboardConfig from '../utils/dashboardConfig';
import { buildMetricSearchIndex } from '../utils/metricSearch';
import { normalizeFilterValue } from '../utils/filterValues';

const getTabFilterKeyFor = (dashboardId, tabId) => {
  if (!dashboardId || !tabId) return null;
  return `${dashboardId}:${tabId}`;
};

const resolveLocationState = (dashboards, search = window.location.search) => {
  if (!Array.isArray(dashboards) || dashboards.length === 0) {
    return null;
  }

  const params = new URLSearchParams(search);
  const dashboardParam = params.get('dashboard');
  const tabParam = params.get('tab');
  const matchedDashboard = dashboards.find(dashboard => dashboard.id === dashboardParam) || dashboards[0];
  const dashboardTabs = dashboardsService.getDashboardTabs(matchedDashboard.id);
  const resolvedTabId = tabParam && dashboardTabs.some(tab => tab.id === tabParam)
    ? tabParam
    : (dashboardTabs[0]?.id || '');
  const tabConfig = resolvedTabId ? dashboardsService.getTab(matchedDashboard.id, resolvedTabId) : null;
  const globalFilterField = tabConfig?.globalFilterField || null;
  const secondaryGlobalFilterField = tabConfig?.secondaryGlobalFilterField || null;

  return {
    dashboardId: matchedDashboard.id,
    tabId: resolvedTabId,
    globalFilterField,
    globalFilterValue: globalFilterField ? normalizeFilterValue(globalFilterField, params.get(globalFilterField)) : null,
    secondaryGlobalFilterField,
    secondaryGlobalFilterValue: secondaryGlobalFilterField
      ? normalizeFilterValue(secondaryGlobalFilterField, params.get(secondaryGlobalFilterField))
      : null
  };
};

const getKnownFilterFields = (dashboards = []) => {
  const fields = new Set();

  dashboards.forEach((dashboard) => {
    const dashboardTabs = Array.isArray(dashboard?.tabs) && dashboard.tabs.length > 0
      ? dashboard.tabs
      : dashboardsService.getDashboardTabs(dashboard.id);

    dashboardTabs.forEach((tab) => {
      const resolvedTab = (tab?.globalFilterField || tab?.secondaryGlobalFilterField)
        ? tab
        : dashboardsService.getTab(dashboard.id, tab.id);

      if (resolvedTab?.globalFilterField) {
        fields.add(resolvedTab.globalFilterField);
      }
      if (resolvedTab?.secondaryGlobalFilterField) {
        fields.add(resolvedTab.secondaryGlobalFilterField);
      }
    });
  });

  return Array.from(fields);
};

/**
 * Main Dashboard component with dashboard and tabbed interface
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  const [activeDashboard, setActiveDashboard] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [dashboards, setDashboards] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [tabFilters, setTabFilters] = useState({}); // Store filter state per dashboard+tab: { `${dashboardId}:${tabId}`: selectedValue }
  const [tabSecondaryFilters, setTabSecondaryFilters] = useState({}); // Secondary (cascading) filter state per tab
  const [isLoading, setIsLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Default to collapsed on mobile, expanded on desktop
    return window.innerWidth <= 768;
  });
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const hasSyncedUrlRef = useRef(false);
  const suppressNextHistoryPushRef = useRef(false);
  const lastSyncedLocationRef = useRef({
    dashboardId: '',
    tabId: '',
    globalFilterField: null,
    globalFilterValue: null,
    secondaryGlobalFilterField: null,
    secondaryGlobalFilterValue: null
  });

  const getTabFilterKey = useCallback((dashboardId, tabId) => {
    return getTabFilterKeyFor(dashboardId, tabId);
  }, []);

  const activeTabFilterKey = getTabFilterKey(activeDashboard, activeTab);
  const activeTabConfig = useMemo(
    () => (activeDashboard && activeTab ? dashboardsService.getTab(activeDashboard, activeTab) : null),
    [activeDashboard, activeTab]
  );
  const tabMetrics = useMemo(
    () => (activeDashboard && activeTab ? dashboardsService.getTabMetrics(activeDashboard, activeTab) : []),
    [activeDashboard, activeTab]
  );
  const knownFilterFields = useMemo(() => getKnownFilterFields(dashboards), [dashboards]);
  
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
  const [showIndexingAlert, setShowIndexingAlert] = useState(false);
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
        !event.target.closest('.sidebar-toggle') 
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
      setIsLoading(true);
      setConfigLoaded(false);
      setShowIndexingAlert(false); // Show alert while loading
      
      try {
        // Load dashboard configuration
        await dashboardConfig.loadConfig();
        
        // Get all dashboards
        const allDashboards = dashboardsService.getAllDashboards();
        
        setDashboards(allDashboards);
        
        if (allDashboards.length > 0) {
          const locationState = resolveLocationState(allDashboards, window.location.search);
          if (locationState) {
            const filterKey = getTabFilterKeyFor(locationState.dashboardId, locationState.tabId);
            setActiveDashboard(locationState.dashboardId);
            setActiveTab(locationState.tabId);

            if (filterKey) {
              if (locationState.globalFilterField) {
                setTabFilters(prev => ({
                  ...prev,
                  [filterKey]: locationState.globalFilterValue || null
                }));
              }

              if (locationState.secondaryGlobalFilterField) {
                setTabSecondaryFilters(prev => ({
                  ...prev,
                  [filterKey]: locationState.secondaryGlobalFilterValue || null
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Dashboard: Error loading dashboards:', error);
        setIndexingMessage("Error loading dashboard. Please refresh the page.");
      } finally {
        setIsLoading(false);
        setConfigLoaded(true);
      }
    };
    
    loadDashboards();
  }, []);

  const applyLocationState = useCallback((search) => {
    const locationState = resolveLocationState(dashboards, search);
    if (!locationState) {
      return;
    }

    const filterKey = getTabFilterKey(locationState.dashboardId, locationState.tabId);

    setActiveDashboard(locationState.dashboardId);
    setActiveTab(locationState.tabId);

    if (!filterKey) {
      return;
    }

    setTabFilters((prev) => {
      const next = { ...prev };
      if (locationState.globalFilterField) {
        next[filterKey] = locationState.globalFilterValue || null;
      } else {
        delete next[filterKey];
      }
      return next;
    });

    setTabSecondaryFilters((prev) => {
      const next = { ...prev };
      if (locationState.secondaryGlobalFilterField) {
        next[filterKey] = locationState.secondaryGlobalFilterValue || null;
      } else {
        delete next[filterKey];
      }
      return next;
    });
  }, [dashboards, getTabFilterKey]);

  useEffect(() => {
    if (!configLoaded || dashboards.length === 0) {
      return undefined;
    }

    const handlePopState = () => {
      suppressNextHistoryPushRef.current = true;
      applyLocationState(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyLocationState, configLoaded, dashboards.length]);
  
  // Update tabs when active dashboard changes
  useEffect(() => {
    if (activeDashboard) {
        const dashboard = dashboards.find(d => d.id === activeDashboard);

        if (dashboard) {
            const dashboardTabs = dashboardsService.getDashboardTabs(activeDashboard);
            setTabs(dashboardTabs);

            // Set the active tab based on the new set of tabs
            setActiveTab(currentActiveTab => {
                const isCurrentTabValid = dashboardTabs.some(t => t.id === currentActiveTab);
                
                if (dashboard.hasDefaultTab && dashboardTabs.length > 0) {
                    return dashboardTabs[0].id; // Always use the default tab for these dashboards
                }
                
                if (isCurrentTabValid) {
                    return currentActiveTab; // Keep current tab if it exists in the new set
                }
                
                if (dashboardTabs.length > 0) {
                    return dashboardTabs[0].id; // Otherwise, fallback to the first tab
                }

                return ''; // No tabs available
            });
        }
    } else {
        setTabs([]);
        setActiveTab('');
    }
  }, [activeDashboard, dashboards]);
  
  // Change the active dashboard and tab
  const handleNavigation = useCallback((dashboardId, tabId) => {
    // If changing to a different dashboard
    if (dashboardId !== activeDashboard) {
      // First, check if tabId is valid
      const newDashboard = dashboards.find(d => d.id === dashboardId);
      const newTabs = newDashboard ? dashboardsService.getDashboardTabs(dashboardId) : [];
      
      // Set the new dashboard
      setActiveDashboard(dashboardId);
      
      // Then set the new tab
      // If the provided tabId exists, use it; otherwise, use the first tab
      if (tabId && newTabs.some(tab => tab.id === tabId)) {
        setActiveTab(tabId);
      } else if (newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      } else {
        setActiveTab('');
      }
      
      // On mobile, automatically close the sidebar after navigation
      if (window.innerWidth <= 768) {
        setMobileExpanded(false);
      }
    }
    // Just changing tabs within the same dashboard
    else if (tabId !== activeTab) {
      // Just update the tab
      setActiveTab(tabId);

      // On mobile, automatically close the sidebar after navigation
      if (window.innerWidth <= 768) {
        setMobileExpanded(false);
      }
    }
  }, [activeDashboard, activeTab, dashboards]);

  // Listen for overview KPI tile clicks (sector launcher).
  // Dispatched by src/components/NumberWidget.js via MetricWidget's onLinkClick.
  useEffect(() => {
    const handleOverviewNavigate = (event) => {
      const detail = event?.detail || {};
      const { dashboardId, tabId } = detail;
      if (!dashboardId) return;
      handleNavigation(dashboardId, tabId || null);
    };
    window.addEventListener('overview:navigate', handleOverviewNavigate);
    return () => {
      window.removeEventListener('overview:navigate', handleOverviewNavigate);
    };
  }, [handleNavigation]);
  
  // Get active dashboard name
  const activeDashboardConfig = useMemo(
    () => dashboards.find(d => d.id === activeDashboard) || null,
    [dashboards, activeDashboard]
  );
  const activeDashboardPalette = activeDashboardConfig?.palette || null;

  const getActiveDashboardName = () => {
    return activeDashboardConfig ? activeDashboardConfig.name : '';
  };

  // Handle global filter change for a tab
  const handleGlobalFilterChange = useCallback((selectedValue) => {
    if (activeTabFilterKey) {
      const normalizedValue = normalizeFilterValue(activeTabConfig?.globalFilterField, selectedValue);
      setTabFilters(prev => ({
        ...prev,
        [activeTabFilterKey]: normalizedValue
      }));
    }
  }, [activeTabConfig?.globalFilterField, activeTabFilterKey]);

  // Handle secondary (cascading) filter change for a tab
  const handleSecondaryGlobalFilterChange = useCallback((selectedValue) => {
    if (activeTabFilterKey) {
      const normalizedValue = normalizeFilterValue(activeTabConfig?.secondaryGlobalFilterField, selectedValue);
      setTabSecondaryFilters(prev => ({
        ...prev,
        [activeTabFilterKey]: normalizedValue
      }));
    }
  }, [activeTabConfig?.secondaryGlobalFilterField, activeTabFilterKey]);

  // Get current global filter value for active tab
  const currentGlobalFilter = activeTabFilterKey ? tabFilters[activeTabFilterKey] || null : null;
  const currentSecondaryGlobalFilter = activeTabFilterKey ? tabSecondaryFilters[activeTabFilterKey] || null : null;
  const searchIndex = useMemo(() => buildMetricSearchIndex(dashboards), [dashboards]);

  // Keep URL in sync with the current dashboard, tab, and active filters.
  useEffect(() => {
    if (!configLoaded || dashboards.length === 0 || !activeDashboard) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set('dashboard', activeDashboard);

    if (activeTab) {
      params.set('tab', activeTab);
    } else {
      params.delete('tab');
    }

    knownFilterFields.forEach((fieldName) => {
      params.delete(fieldName);
    });

    if (activeTabConfig?.globalFilterField && currentGlobalFilter) {
      params.set(activeTabConfig.globalFilterField, currentGlobalFilter);
    }

    if (activeTabConfig?.secondaryGlobalFilterField && currentSecondaryGlobalFilter) {
      params.set(activeTabConfig.secondaryGlobalFilterField, currentSecondaryGlobalFilter);
    }

    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const nextLocationState = {
      dashboardId: activeDashboard,
      tabId: activeTab,
      globalFilterField: activeTabConfig?.globalFilterField || null,
      globalFilterValue: currentGlobalFilter,
      secondaryGlobalFilterField: activeTabConfig?.secondaryGlobalFilterField || null,
      secondaryGlobalFilterValue: currentSecondaryGlobalFilter
    };

    const previousLocationState = lastSyncedLocationRef.current;
    const didNavigationChange = previousLocationState.dashboardId !== nextLocationState.dashboardId
      || previousLocationState.tabId !== nextLocationState.tabId;

    const shouldReplace = !hasSyncedUrlRef.current
      || suppressNextHistoryPushRef.current
      || !didNavigationChange;

    if (nextUrl !== currentUrl) {
      if (shouldReplace) {
        window.history.replaceState({}, '', nextUrl);
      } else {
        window.history.pushState({}, '', nextUrl);
      }
    }

    hasSyncedUrlRef.current = true;
    suppressNextHistoryPushRef.current = false;
    lastSyncedLocationRef.current = nextLocationState;
  }, [
    configLoaded,
    dashboards.length,
    activeDashboard,
    activeTab,
    activeTabConfig?.globalFilterField,
    activeTabConfig?.secondaryGlobalFilterField,
    currentGlobalFilter,
    currentSecondaryGlobalFilter,
    knownFilterFields
  ]);
  
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

  const handleSearchSelect = useCallback((searchEntry) => {
    if (!searchEntry?.dashboardId || !searchEntry?.tabId) {
      return;
    }

    handleNavigation(searchEntry.dashboardId, searchEntry.tabId);
  }, [handleNavigation]);

  return (
    <div className="dashboard">
      <Header 
        dashboardName={getActiveDashboardName()} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        showIndexingAlert={showIndexingAlert}
        indexingMessage={indexingMessage}
        searchIndex={searchIndex}
        onSearchSelect={handleSearchSelect}
        searchEnabled={configLoaded && searchIndex.length > 0}
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
          {!configLoaded ? (
            <div className="loading-indicator">Initializing dashboard...</div>
          ) : activeDashboard && activeTab ? (
            <div className="tab-content">
              <MetricGrid
                metrics={tabMetrics}
                isDarkMode={isDarkMode}
                tabConfig={activeTabConfig}
                globalFilterValue={currentGlobalFilter}
                onGlobalFilterChange={handleGlobalFilterChange}
                secondaryGlobalFilterValue={currentSecondaryGlobalFilter}
                onSecondaryGlobalFilterChange={handleSecondaryGlobalFilterChange}
                dashboardPalette={activeDashboardPalette}
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
