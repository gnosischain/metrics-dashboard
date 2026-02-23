import yaml from 'js-yaml';
import metricsService from './metrics';
import { resolveDashboardPalette } from '../utils/dashboardPalettes';

/**
 * Service for handling dashboard configuration and layouts
 */
class DashboardService {
  constructor() {
    this.dashboards = [];
    this.isLoaded = false;
  }

  /**
   * Load dashboard configuration from YAML
   * @param {string} yamlContent - YAML content
   * @returns {boolean} Success status
   */
  loadFromYaml(yamlContent) {
    try {
      console.log('DashboardService: Starting YAML parsing...');
      console.log('YAML content preview:', yamlContent.substring(0, 300));
      
      // Try to parse the YAML document
      const parsedYaml = yaml.load(yamlContent);
      console.log('DashboardService: YAML parsed successfully:', parsedYaml);
      
      this.dashboards = [];
      
      // Process as a collection of dashboards
      // Each top-level key could be a dashboard identifier
      Object.entries(parsedYaml).forEach(([key, config]) => {
      console.log('DashboardService: Processing dashboard:', { key, config });
        // Process the dashboard configuration
        this.processConfig(key, config);
      });
      
      // Sort dashboards by order
      this.dashboards.sort((a, b) => a.order - b.order);
      
      console.log('DashboardService: Loaded dashboards from YAML configuration:', this.dashboards.length);
      console.log('DashboardService: Final dashboards:', this.dashboards.map(d => ({id: d.id, name: d.name, tabCount: d.tabs?.length || 0})));
      
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('DashboardService: Error loading dashboard configuration:', error);
      return false;
    }
  }
  
  /**
   * Process a dashboard configuration object
   * @param {string} key - Dashboard key from YAML
   * @param {Object} dashboardConfig - Dashboard configuration object
   */
  processConfig(key, dashboardConfig) {
      console.log('DashboardService: Processing config:', { key, dashboardConfig });
    
    // Skip if no valid dashboard found
    if (!dashboardConfig || !dashboardConfig.name) {
      console.warn('DashboardService: Invalid dashboard configuration for key (missing name):', key);
      return;
    }
    
    // Create dashboard object with icon support
    const dashboard = {
      id: key.toLowerCase().replace(/\s+/g, '-'),
      name: dashboardConfig.name,
      order: dashboardConfig.order || 999,
      icon: dashboardConfig.icon || '', // Emoji fallback
      iconClass: dashboardConfig.iconClass || '', // Icon class for SVG icon
      palette: resolveDashboardPalette(dashboardConfig.palette)
    };
    
    console.log('DashboardService: Created dashboard object:', dashboard);
    
    // Check if this is a dashboard with direct metrics (no tabs)
    if (Array.isArray(dashboardConfig.metrics)) {
      console.log('DashboardService: Dashboard has direct metrics (no tabs):', key);
      
      // Create a single default tab with the metrics
      dashboard.tabs = [{
        id: 'main',
        name: dashboard.name, // Use the dashboard name for the tab
        order: 1,
        metrics: dashboardConfig.metrics.map(metric => {
          console.log('DashboardService: Processing metric:', metric);
          
          // Get base metric config (may be undefined for pseudo-metrics like global_filter)
          const metricConfig = metricsService.getMetricConfig(metric.id);
          
          // Return metric with grid positioning properties
          return {
            ...metricConfig,
            id: metric.id,
            gridRow: metric.gridRow,
            gridColumn: metric.gridColumn,
            minHeight: metric.minHeight
          };
        }),
        // Flag to indicate this is a default tab (no tabs UI)
        isDefaultTab: true
      }];
      
      // Flag to indicate this dashboard has no tabs UI
      dashboard.hasDefaultTab = true;
      console.log('DashboardService: Dashboard configured with default tab:', key);
    } 
    // Handle dashboards with explicit tabs
    else if (Array.isArray(dashboardConfig.tabs)) {
      console.log('DashboardService: Dashboard has explicit tabs:', { key, count: dashboardConfig.tabs.length });
      
      dashboard.tabs = dashboardConfig.tabs.map(tab => {
        console.log('DashboardService: Processing tab:', tab);
        
        return {
          id: tab.name.toLowerCase().replace(/\s+/g, '-'),
          name: tab.name,
          order: tab.order || 999,
          icon: tab.icon || '', // Emoji fallback for tab
          iconClass: tab.iconClass || '', // Icon class for tab SVG icon
          globalFilterField: tab.globalFilterField || null, // Preserve global filter field if defined
          globalFilterLabel: tab.globalFilterLabel || null, // Optional custom label for the filter
          unitToggle: tab.unitToggle || false, // Enable unit toggle (Native/USD) for this tab
          defaultUnit: tab.defaultUnit || 'native', // Default unit selection
          searchable: tab.searchable || false, // Enable searchable filter input
          searchPlaceholder: tab.searchPlaceholder || '', // Placeholder for search input
          metrics: (tab.metrics || []).map(metric => {
            console.log('DashboardService: Processing tab metric:', metric);
            
            // Get base metric config (may be undefined for pseudo-metrics like global_filter)
            const metricConfig = metricsService.getMetricConfig(metric.id);
            
            // Return metric with grid positioning properties
            return {
              ...metricConfig,
              id: metric.id,
              gridRow: metric.gridRow,
              gridColumn: metric.gridColumn,
              minHeight: metric.minHeight
            };
          })
        };
      });
      
      // Sort tabs by order
      dashboard.tabs.sort((a, b) => a.order - b.order);
      console.log('DashboardService: Dashboard tabs processed:', { key, tabs: dashboard.tabs.map(t => t.name) });
    }
    // No metrics or tabs defined
    else {
      dashboard.tabs = [];
      console.warn('DashboardService: Dashboard has no tabs or metrics defined:', dashboardConfig.name);
    }
    
    console.log('DashboardService: Adding dashboard to collection:', key);
    this.dashboards.push(dashboard);
  }

  /**
   * Get all available dashboards
   * @returns {Array} List of dashboards
   */
  getAllDashboards() {
    console.log('DashboardService: getAllDashboards() returning dashboards:', this.dashboards.length);
    return this.dashboards;
  }

  /**
   * Get dashboard by ID
   * @param {string} dashboardId - Dashboard ID
   * @returns {Object|null} Dashboard object or null if not found
   */
  getDashboard(dashboardId) {
    const dashboard = this.dashboards.find(dashboard => dashboard.id === dashboardId);
    console.log('DashboardService: getDashboard found:', { dashboardId, found: !!dashboard });
    return dashboard || null;
  }

  /**
   * Get dashboard tabs
   * @param {string} dashboardId - Dashboard ID
   * @returns {Array} List of tabs
   */
  getDashboardTabs(dashboardId) {
    const dashboard = this.getDashboard(dashboardId);
    const tabs = dashboard ? dashboard.tabs : [];
    console.log('DashboardService: getDashboardTabs returning tabs:', { dashboardId, count: tabs.length });
    return tabs;
  }

  /**
   * Get tab by ID
   * @param {string} dashboardId - Dashboard ID
   * @param {string} tabId - Tab ID
   * @returns {Object|null} Tab object or null if not found
   */
  getTab(dashboardId, tabId) {
    const dashboard = this.getDashboard(dashboardId);
    if (!dashboard) return null;
    
    const tab = dashboard.tabs.find(tab => tab.id === tabId);
    console.log('DashboardService: getTab found:', { dashboardId, tabId, found: !!tab });
    return tab || null;
  }

  /**
   * Get metrics for a specific tab
   * @param {string} dashboardId - Dashboard ID
   * @param {string} tabId - Tab ID
   * @returns {Array} List of metrics
   */
  getTabMetrics(dashboardId, tabId) {
    const tab = this.getTab(dashboardId, tabId);
    const metrics = tab ? tab.metrics : [];
    console.log('DashboardService: getTabMetrics returning metrics:', { dashboardId, tabId, count: metrics.length });
    return metrics;
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
