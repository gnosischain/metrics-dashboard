import dashboardsService from '../services/dashboards';

// Default dashboard configuration as a fallback
const DEFAULT_CONFIG = `## Network Dashboard
name: Network
order: 1
tabs:
  - name: Overview
    order: 1
    metrics:
      - id: 01_network_1000
        size: small
        vSize: large
      - id: 01_network_1100
        size: large
        vSize: large
`;

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
        const success = dashboardsService.loadFromYaml(yamlContent);
        this.isLoaded = success;
        console.log('Loaded dashboard configuration from file');
        return success;
      } else {
        console.warn(`Could not load dashboard config from ${this.configPath}, using default`);
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
    dashboardsService.loadFromYaml(DEFAULT_CONFIG);
    this.isLoaded = true;
  }
}

export default new DashboardConfig();