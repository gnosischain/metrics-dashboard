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
      // Parse YAML document sections (separated by '##' headers)
      const dashboardSections = yamlContent.split('## ').filter(section => section.trim());
      
      this.dashboards = [];
      
      // Process each dashboard section
      dashboardSections.forEach(section => {
        try {
          // Add the removed '##' prefix back to make it valid YAML
          const yamlSection = '## ' + section;
          const dashboardConfig = yaml.load(yamlSection);
          
          // Skip if no valid dashboard found
          if (!dashboardConfig || !dashboardConfig.name) return;
          
          // Extract dashboard properties from the first line comment
          const headerMatch = section.match(/^([^:]+):/);
          if (headerMatch) {
            const dashboardId = headerMatch[1].trim();
            
            // Create dashboard object
            const dashboard = {
              id: dashboardId.toLowerCase().replace(/\s+/g, '-'),
              name: dashboardConfig.name,
              order: dashboardConfig.order || 999,
              tabs: (dashboardConfig.tabs || []).map(tab => ({
                id: tab.name.toLowerCase().replace(/\s+/g, '-'),
                name: tab.name,
                order: tab.order || 999,
                metrics: (tab.metrics || []).map(metric => {
                  // Get base metric config
                  const metricConfig = metricsService.getMetricConfig(metric.id);
                  
                  // Return metric with grid positioning properties
                  return {
                    ...metricConfig,
                    // Grid positioning properties
                    gridRow: metric.gridRow,
                    gridColumn: metric.gridColumn,
                    minHeight: metric.minHeight
                  };
                })
              }))
            };
            
            // Sort tabs by order
            dashboard.tabs.sort((a, b) => a.order - b.order);
            
            this.dashboards.push(dashboard);
          }
        } catch (sectionError) {
          console.error('Error parsing dashboard section:', sectionError);
        }
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