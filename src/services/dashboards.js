import yaml from 'js-yaml';
import metricsService from './metrics';

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
      // Try to parse the YAML document
      const parsedYaml = yaml.load(yamlContent);
      
      this.dashboards = [];
      
      // Process as a collection of dashboards
      // Each top-level key could be a dashboard identifier
      Object.entries(parsedYaml).forEach(([key, config]) => {
        // Process the dashboard configuration
        this.processConfig(key, config);
      });
      
      // Sort dashboards by order
      this.dashboards.sort((a, b) => a.order - b.order);
      
      console.log(`Loaded ${this.dashboards.length} dashboards from YAML configuration`);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
      return false;
    }
  }
  
  /**
   * Process a dashboard configuration object
   * @param {string} key - Dashboard key from YAML
   * @param {Object} dashboardConfig - Dashboard configuration object
   */
  processConfig(key, dashboardConfig) {
    // Skip if no valid dashboard found
    if (!dashboardConfig || !dashboardConfig.name) {
      console.warn(`Invalid dashboard configuration for key: ${key}`);
      return;
    }
    
    // Create dashboard object
    const dashboard = {
      id: key.toLowerCase().replace(/\s+/g, '-'),
      name: dashboardConfig.name,
      order: dashboardConfig.order || 999,
    };
    
    // Check if this is a dashboard with direct metrics (no tabs)
    if (Array.isArray(dashboardConfig.metrics)) {
      // Create a single default tab with the metrics
      dashboard.tabs = [{
        id: 'main',
        name: dashboard.name, // Use the dashboard name for the tab
        order: 1,
        metrics: dashboardConfig.metrics.map(metric => {
          // Get base metric config
          const metricConfig = metricsService.getMetricConfig(metric.id);
          
          // Return metric with grid positioning properties
          return {
            ...metricConfig,
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
    } 
    // Handle dashboards with explicit tabs
    else if (Array.isArray(dashboardConfig.tabs)) {
      dashboard.tabs = dashboardConfig.tabs.map(tab => ({
        id: tab.name.toLowerCase().replace(/\s+/g, '-'),
        name: tab.name,
        order: tab.order || 999,
        metrics: (tab.metrics || []).map(metric => {
          // Get base metric config
          const metricConfig = metricsService.getMetricConfig(metric.id);
          
          // Return metric with grid positioning properties
          return {
            ...metricConfig,
            gridRow: metric.gridRow,
            gridColumn: metric.gridColumn,
            minHeight: metric.minHeight
          };
        })
      }));
      
      // Sort tabs by order
      dashboard.tabs.sort((a, b) => a.order - b.order);
    }
    // No metrics or tabs defined
    else {
      dashboard.tabs = [];
      console.warn(`Dashboard "${dashboardConfig.name}" has no tabs or metrics defined.`);
    }
    
    this.dashboards.push(dashboard);
  }

  /**
   * Get all available dashboards
   * @returns {Array} List of dashboards
   */
  getAllDashboards() {
    return this.dashboards;
  }

  /**
   * Get dashboard by ID
   * @param {string} dashboardId - Dashboard ID
   * @returns {Object|null} Dashboard object or null if not found
   */
  getDashboard(dashboardId) {
    return this.dashboards.find(dashboard => dashboard.id === dashboardId) || null;
  }

  /**
   * Get dashboard tabs
   * @param {string} dashboardId - Dashboard ID
   * @returns {Array} List of tabs
   */
  getDashboardTabs(dashboardId) {
    const dashboard = this.getDashboard(dashboardId);
    return dashboard ? dashboard.tabs : [];
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
    
    return dashboard.tabs.find(tab => tab.id === tabId) || null;
  }

  /**
   * Get metrics for a specific tab
   * @param {string} dashboardId - Dashboard ID
   * @param {string} tabId - Tab ID
   * @returns {Array} List of metrics
   */
  getTabMetrics(dashboardId, tabId) {
    const tab = this.getTab(dashboardId, tabId);
    return tab ? tab.metrics : [];
  }
}

export default new DashboardService();