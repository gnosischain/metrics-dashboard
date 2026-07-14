import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import MetricGrid from './MetricGrid';
// Heavy custom views — load only when the user opens those tabs so they
// don't drag down first paint (or Landing) with their dependency trees.
const ValidatorExplorer = lazy(() => import('./ValidatorExplorer'));
const AccountPortfolio = lazy(() => import('./AccountPortfolio'));
import IconComponent from './IconComponent';
import Landing from './Landing';
import dashboardsService from '../services/dashboards';
import metricsService from '../services/metrics';
import dashboardConfig from '../utils/dashboardConfig';
import { buildMetricSearchIndex } from '../utils/metricSearch';
import { normalizeFilterValue } from '../utils/filterValues';
import {
  EMPTY_VALIDATOR_EXPLORER_STATE,
  applyValidatorExplorerStateToParams,
  parseValidatorExplorerState,
  normalizeValidatorExplorerState,
  validatorExplorerStatesEqual
} from '../utils/validatorExplorerState';
import {
  EMPTY_ACCOUNT_PORTFOLIO_STATE,
  accountPortfolioStatesEqual,
  applyAccountPortfolioStateToParams,
  normalizeAccountPortfolioState,
  parseAccountPortfolioState,
} from '../utils/accountPortfolioState';

const getTabFilterKeyFor = (dashboardId, tabId) => {
  if (!dashboardId || !tabId) return null;
  return `${dashboardId}:${tabId}`;
};

const resolveRequestedView = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  return params.has('dashboard') ? 'dashboard' : 'landing';
};

const getCustomTabStateFor = (tabConfig, params) => {
  if (!tabConfig?.customView) {
    return null;
  }

  if (tabConfig.customView === 'validatorExplorer') {
    return parseValidatorExplorerState(params);
  }

  if (tabConfig.customView === 'accountPortfolio') {
    return parseAccountPortfolioState(params);
  }

  return null;
};

const resolveLocationState = (dashboards, search = window.location.search) => {
  if (!Array.isArray(dashboards) || dashboards.length === 0) {
    return null;
  }

  const params = new URLSearchParams(search);
  const dashboardAliases = {
    accounts: 'account-portfolio'
  };
  const requestedDashboardParam = params.get('dashboard');
  const dashboardParam = dashboardAliases[requestedDashboardParam] || requestedDashboardParam;
  const tabParam = params.get('tab');

  // No dashboard param → show landing page (caller treats this as landing).
  if (!dashboardParam) {
    return {
      dashboardId: '',
      tabId: '',
      globalFilterField: null,
      globalFilterValue: null,
      secondaryGlobalFilterField: null,
      secondaryGlobalFilterValue: null,
      customView: null,
      customState: null
    };
  }

  const matchedDashboard = dashboards.find(dashboard => dashboard.id === dashboardParam) || dashboards[0];
  const dashboardTabs = dashboardsService.getDashboardTabs(matchedDashboard.id);
  const resolvedTabId = tabParam && dashboardTabs.some(tab => tab.id === tabParam)
    ? tabParam
    : (dashboardTabs[0]?.id || '');
  const tabConfig = resolvedTabId ? dashboardsService.getTab(matchedDashboard.id, resolvedTabId) : null;
  const isCustomView = Boolean(tabConfig?.customView);
  const customViewBypassesGlobalFilter = tabConfig?.customView === 'validatorExplorer' ||
    tabConfig?.customView === 'accountPortfolio';
  const globalFilterField = (isCustomView && customViewBypassesGlobalFilter)
    ? null
    : (tabConfig?.globalFilterField || null);
  const secondaryGlobalFilterField = (isCustomView && customViewBypassesGlobalFilter)
    ? null
    : (tabConfig?.secondaryGlobalFilterField || null);

  return {
    dashboardId: matchedDashboard.id,
    tabId: resolvedTabId,
    globalFilterField,
    globalFilterValue: globalFilterField ? normalizeFilterValue(globalFilterField, params.get(globalFilterField)) : null,
    secondaryGlobalFilterField,
    secondaryGlobalFilterValue: secondaryGlobalFilterField
      ? normalizeFilterValue(secondaryGlobalFilterField, params.get(secondaryGlobalFilterField))
      : null,
    customView: tabConfig?.customView || null,
    customState: getCustomTabStateFor(tabConfig, params)
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
  const [tabCustomStates, setTabCustomStates] = useState({}); // Custom per-tab URL/application state (e.g. validator explorer)
  const [isLoading, setIsLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [activeTabConfigsLoaded, setActiveTabConfigsLoaded] = useState(false);
  const [metricsCacheVersion, setMetricsCacheVersion] = useState(0);
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
    secondaryGlobalFilterValue: null,
    customView: null,
    customState: null
  });

  const getTabFilterKey = useCallback((dashboardId, tabId) => {
    return getTabFilterKeyFor(dashboardId, tabId);
  }, []);

  const activeTabFilterKey = getTabFilterKey(activeDashboard, activeTab);
  const activeTabConfig = useMemo(
    () => (activeDashboard && activeTab ? dashboardsService.getTab(activeDashboard, activeTab) : null),
    [activeDashboard, activeTab]
  );
  const rawTabMetrics = useMemo(
    () => (activeDashboard && activeTab ? dashboardsService.getTabMetrics(activeDashboard, activeTab) : []),
    [activeDashboard, activeTab]
  );
  const tabMetrics = useMemo(
    () => metricsService.resolveTabMetrics(rawTabMetrics),
    // metricsCacheVersion bumps when new configs land in the cache, forcing re-resolution
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawTabMetrics, metricsCacheVersion]
  );
  const knownFilterFields = useMemo(() => getKnownFilterFields(dashboards), [dashboards]);

  // Subscribe to metric-config cache updates so memos re-resolve once configs land.
  useEffect(() => {
    const unsubscribe = metricsService.subscribe((version) => {
      setMetricsCacheVersion(version);
    });
    return unsubscribe;
  }, []);

  // Preload the active tab's metric configs before rendering MetricGrid.
  useEffect(() => {
    if (!rawTabMetrics || rawTabMetrics.length === 0) {
      setActiveTabConfigsLoaded(true);
      return undefined;
    }

    let cancelled = false;
    setActiveTabConfigsLoaded(false);

    // Load each card's default id AND its non-default-chain variant (`celoId`)
    // so the per-tab chain toggle swaps data without a skeleton flash.
    const ids = rawTabMetrics.flatMap((m) => [m.id, m.celoId]).filter(Boolean);
    metricsService.loadMetricConfigs(ids).then(() => {
      if (!cancelled) setActiveTabConfigsLoaded(true);

      // Preload the D/W/M resolution variants for any toggle metric on this
      // tab. Each metric only ships its default-resolution config in `ids`, so
      // without this the first click on D/M points at an unloaded *_daily /
      // *_monthly config and the widget briefly drops to a skeleton while it
      // lazy-loads. This stays within the lazy-by-tab budget: only the active
      // tab's toggle siblings (a handful of small configs) are fetched.
      const siblingIds = ids.flatMap((id) => {
        const config = metricsService.getMetricConfig(id);
        if (!Array.isArray(config?.resolutions)) return [];
        const base = id.replace(/_(daily|weekly|monthly)$/, '');
        return config.resolutions.map((res) => `${base}_${res}`);
      });
      if (siblingIds.length > 0) {
        metricsService.loadMetricConfigs(siblingIds).catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rawTabMetrics]);

  // Note: we no longer eagerly load every metric config in the background.
  // Doing so on idle at boot pulled ~500 JS chunks the user may never need
  // and slowed first paint. Search across non-active tabs is best-effort
  // until those tabs are visited.
  
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

              if (locationState.customView && locationState.customState) {
                setTabCustomStates(prev => ({
                  ...prev,
                  [filterKey]: locationState.customState
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

    setTabCustomStates((prev) => {
      const next = { ...prev };
      if (locationState.customView && locationState.customState) {
        next[filterKey] = locationState.customState;
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

  // Multi-chain dashboards no longer split their tabs across the sidebar or
  // carry a dashboard-level chain switcher. Chain selection is now a per-tab
  // control rendered inside MetricGrid (tabs list `chains:` and each card a
  // `celoId`), so toggling a chain swaps only the current tab's card data and
  // the menu stays stable. The sidebar therefore lists every tab as-is.

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
  const currentCustomTabState = useMemo(() => {
    if (!activeTabFilterKey || !activeTabConfig?.customView) {
      return null;
    }

    if (activeTabConfig.customView === 'validatorExplorer') {
      return normalizeValidatorExplorerState(
        tabCustomStates[activeTabFilterKey] || EMPTY_VALIDATOR_EXPLORER_STATE
      );
    }

    if (activeTabConfig.customView === 'accountPortfolio') {
      return normalizeAccountPortfolioState(
        tabCustomStates[activeTabFilterKey] || EMPTY_ACCOUNT_PORTFOLIO_STATE
      );
    }

    return tabCustomStates[activeTabFilterKey] || null;
  }, [activeTabConfig?.customView, activeTabFilterKey, tabCustomStates]);
  const searchIndex = useMemo(() => {
    const enriched = dashboards.map((dashboard) => ({
      ...dashboard,
      tabs: (dashboard.tabs || []).map((tab) => ({
        ...tab,
        // Disambiguate same-named tabs across chains in search results
        // (e.g. "Overview · Celo" vs "Overview").
        name: tab.chain && tab.chainLabel && dashboard.defaultChain && tab.chain !== dashboard.defaultChain
          ? `${tab.name} · ${tab.chainLabel}`
          : tab.name,
        metrics: metricsService.resolveTabMetrics(tab.metrics || [])
      }))
    }));
    return buildMetricSearchIndex(enriched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboards, metricsCacheVersion]);

  const handleCustomTabStateChange = useCallback((nextStateOrUpdater) => {
    if (!activeTabFilterKey || !activeTabConfig?.customView) {
      return;
    }

    setTabCustomStates((prev) => {
      const previousState = activeTabConfig.customView === 'validatorExplorer'
        ? normalizeValidatorExplorerState(prev[activeTabFilterKey] || EMPTY_VALIDATOR_EXPLORER_STATE)
        : activeTabConfig.customView === 'accountPortfolio'
          ? normalizeAccountPortfolioState(prev[activeTabFilterKey] || EMPTY_ACCOUNT_PORTFOLIO_STATE)
          : (prev[activeTabFilterKey] || null);
      const candidateState = typeof nextStateOrUpdater === 'function'
        ? nextStateOrUpdater(previousState)
        : nextStateOrUpdater;

      const normalizedState = activeTabConfig.customView === 'validatorExplorer'
        ? normalizeValidatorExplorerState(candidateState)
        : activeTabConfig.customView === 'accountPortfolio'
          ? normalizeAccountPortfolioState(candidateState)
          : candidateState;

      if (activeTabConfig.customView === 'validatorExplorer' &&
        validatorExplorerStatesEqual(previousState, normalizedState)
      ) {
        return prev;
      }

      if (activeTabConfig.customView === 'accountPortfolio' &&
        accountPortfolioStatesEqual(previousState, normalizedState)
      ) {
        return prev;
      }

      return {
        ...prev,
        [activeTabFilterKey]: normalizedState
      };
    });
  }, [activeTabConfig?.customView, activeTabFilterKey]);

  // Keep URL in sync with the current dashboard, tab, and active filters.
  useEffect(() => {
    if (!configLoaded || dashboards.length === 0 || !activeDashboard) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const isCustomValidatorExplorer = activeTabConfig?.customView === 'validatorExplorer';
    const isCustomAccountPortfolio = activeTabConfig?.customView === 'accountPortfolio';
    params.set('dashboard', activeDashboard);

    if (activeTab) {
      params.set('tab', activeTab);
    } else {
      params.delete('tab');
    }

    knownFilterFields.forEach((fieldName) => {
      params.delete(fieldName);
    });

    params.delete('explorerMode');
    params.delete('validator_index');
    params.delete('compare');
    params.delete('withdrawal_credentials');
    params.delete('portfolio_tab');

    if (isCustomValidatorExplorer) {
      applyValidatorExplorerStateToParams(params, currentCustomTabState);
    } else if (isCustomAccountPortfolio) {
      applyAccountPortfolioStateToParams(params, currentCustomTabState);
    } else {
      if (activeTabConfig?.globalFilterField && currentGlobalFilter) {
        params.set(activeTabConfig.globalFilterField, currentGlobalFilter);
      }

      if (activeTabConfig?.secondaryGlobalFilterField && currentSecondaryGlobalFilter) {
        params.set(activeTabConfig.secondaryGlobalFilterField, currentSecondaryGlobalFilter);
      }
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
      secondaryGlobalFilterValue: currentSecondaryGlobalFilter,
      customView: activeTabConfig?.customView || null,
      customState: currentCustomTabState
    };

    const previousLocationState = lastSyncedLocationRef.current;
    const didNavigationChange = previousLocationState.dashboardId !== nextLocationState.dashboardId
      || previousLocationState.tabId !== nextLocationState.tabId
      || previousLocationState.customView !== nextLocationState.customView;

    // Leaving the landing (empty previous dashboard → real dashboard) should push,
    // so the back button returns to landing.
    const leavingLanding = hasSyncedUrlRef.current === false
      && previousLocationState.dashboardId === ''
      && nextLocationState.dashboardId !== '';

    const shouldReplace = (!hasSyncedUrlRef.current && !leavingLanding)
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
    activeTabConfig?.customView,
    activeTabConfig?.globalFilterField,
    activeTabConfig?.secondaryGlobalFilterField,
    currentGlobalFilter,
    currentSecondaryGlobalFilter,
    currentCustomTabState,
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
    if (!searchEntry?.dashboardId) {
      return;
    }

    handleNavigation(searchEntry.dashboardId, searchEntry.tabId || null);
  }, [handleNavigation]);

  const handleGoHome = useCallback(() => {
    setActiveDashboard('');
    setActiveTab('');
    const nextUrl = window.location.pathname;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }
    lastSyncedLocationRef.current = {
      dashboardId: '',
      tabId: '',
      globalFilterField: null,
      globalFilterValue: null,
      secondaryGlobalFilterField: null,
      secondaryGlobalFilterValue: null,
      customView: null,
      customState: null
    };
  }, []);

  const requestedView = resolveRequestedView(window.location.search);
  const isBootLanding = !configLoaded && requestedView === 'landing';
  const isLanding = isBootLanding || (configLoaded && dashboards.length > 0 && !activeDashboard);

  const activeBrand = activeDashboardConfig?.brand || undefined;

  return (
    <div className={`dashboard${isLanding ? ' dashboard--landing' : ''}`} data-brand={activeBrand}>
      <Header
        dashboardName={getActiveDashboardName()}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        showIndexingAlert={showIndexingAlert}
        indexingMessage={indexingMessage}
        searchIndex={searchIndex}
        onSearchSelect={handleSearchSelect}
        searchEnabled={!isLanding && configLoaded && searchIndex.length > 0}
        resourceLinks={isLanding ? [] : undefined}
        searchSectors={dashboards.filter(d => d.id !== 'overview')}
        variant={isLanding ? 'landing' : 'default'}
        onHome={handleGoHome}
        onToggleSidebar={isLanding ? null : toggleSidebar}
        sidebarCollapsed={sidebarCollapsed && !mobileExpanded}
      />

      {isLanding ? (
        <Landing
          dashboards={dashboards}
          onNavigate={handleNavigation}
          isDarkMode={isDarkMode}
          isBootLoading={isBootLanding}
        />
      ) : (
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

          <div className="dashboard-content">
            {!configLoaded ? (
              <div className="loading-indicator">Initializing dashboard...</div>
            ) : activeDashboard && activeTab ? (
              <div className="tab-content">
                {activeTabConfig?.customView === 'validatorExplorer' ? (
                  <Suspense fallback={<div className="loading-indicator">Loading…</div>}>
                    <ValidatorExplorer
                      isDarkMode={isDarkMode}
                      tabConfig={activeTabConfig}
                      dashboard={dashboards.find((d) => d.id === activeDashboard) || null}
                      dashboardPalette={activeDashboardPalette}
                      explorerState={currentCustomTabState}
                      onExplorerStateChange={handleCustomTabStateChange}
                    />
                  </Suspense>
                ) : activeTabConfig?.customView === 'accountPortfolio' ? (
                  <Suspense fallback={<div className="loading-indicator">Loading…</div>}>
                    <AccountPortfolio
                      isDarkMode={isDarkMode}
                      tabConfig={activeTabConfig}
                      dashboard={dashboards.find((d) => d.id === activeDashboard) || null}
                      globalFilterValue={currentGlobalFilter}
                      onGlobalFilterChange={handleGlobalFilterChange}
                      portfolioState={currentCustomTabState}
                      onPortfolioStateChange={handleCustomTabStateChange}
                    />
                  </Suspense>
                ) : !activeTabConfigsLoaded ? (
                  <div className="loading-indicator">Loading metrics...</div>
                ) : (
                  <MetricGrid
                    metrics={tabMetrics}
                    isDarkMode={isDarkMode}
                    tabConfig={activeTabConfig}
                    dashboard={dashboards.find((d) => d.id === activeDashboard) || null}
                    globalFilterValue={currentGlobalFilter}
                    onGlobalFilterChange={handleGlobalFilterChange}
                    secondaryGlobalFilterValue={currentSecondaryGlobalFilter}
                    onSecondaryGlobalFilterChange={handleSecondaryGlobalFilterChange}
                    dashboardPalette={activeDashboardPalette}
                  />
                )}
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
      )}
    </div>
  );
};

export default Dashboard;
