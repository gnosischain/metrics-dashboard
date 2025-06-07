import dashboardsService from '../services/dashboards';

// Default dashboard configuration as a fallback
const DEFAULT_CONFIG = `Overview:
  name: Overview
  order: 1
  icon: "📊"
  iconClass: "chart-line"
  metrics:
    - id: under_construction
      gridRow: 2
      gridColumn: 1 / span 12
      minHeight: 500px

Financials:
  name: Financials
  order: 2
  icon: "💰"
  iconClass: "dollar-sign"
  metrics:
    - id: under_construction
      gridRow: 2
      gridColumn: 1 / span 12
      minHeight: 500px`;

/**
 * Dashboard configuration utility
 */
class DashboardConfig {
  constructor() {
    this.isLoaded = false;
    this.configPath = '/dashboard.yml';
  }

  /**
   * Load the dashboard configuration
   * @returns {Promise<boolean>} Success status
   */
  async loadConfig() {
    // Skip if already loaded
    if (this.isLoaded) {
      return true;
    }
    
    try {
      // Try to fetch the configuration file
      const response = await fetch(this.configPath);
      
      if (response.ok) {
        const yamlContent = await response.text();
        console.log('Loaded dashboard.yml content:', yamlContent.substring(0, 200) + '...');
        const success = dashboardsService.loadFromYaml(yamlContent);
        this.isLoaded = success;
        console.log('Successfully loaded dashboard configuration from file');
        return success;
      } else {
        console.warn(`Could not load dashboard config from ${this.configPath} (status: ${response.status}), using default`);
        this.useDefaultConfig();
        return true;
      }
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
      this.useDefaultConfig();
      return true;
    }
  }

  /**
   * Use the default configuration
   */
  useDefaultConfig() {
    console.log('Using default dashboard configuration');
    console.log('Default config content:', DEFAULT_CONFIG);
    const success = dashboardsService.loadFromYaml(DEFAULT_CONFIG);
    console.log('Default config loaded successfully:', success);
    this.isLoaded = true;
  }
}

// Create and export the service instance
const dashboardConfigInstance = new DashboardConfig();
export default dashboardConfigInstance;