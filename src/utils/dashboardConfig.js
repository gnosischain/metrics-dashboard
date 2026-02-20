import dashboardsService from '../services/dashboards';
import yaml from 'js-yaml';

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
   * Fetch a YAML file from the public assets.
   * @param {string} path - Public path to YAML file
   * @returns {Promise<string>} YAML file content
   */
  async fetchYamlFile(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path} (status: ${response.status})`);
    }
    return response.text();
  }

  /**
   * Resolve per-sector `source` files into a single merged YAML string.
   * Keeps backwards compatibility for inline metrics/tabs.
   * @param {string} mainYamlContent
   * @returns {Promise<string>}
   */
  async resolveSourceConfigs(mainYamlContent) {
    const parsedMain = yaml.load(mainYamlContent);
    if (!parsedMain || typeof parsedMain !== 'object' || Array.isArray(parsedMain)) {
      throw new Error('Invalid dashboard.yml format: expected a top-level mapping');
    }

    const resolvedConfig = {};

    for (const [sectorKey, sectorConfig] of Object.entries(parsedMain)) {
      if (!sectorConfig || typeof sectorConfig !== 'object' || Array.isArray(sectorConfig)) {
        console.warn(`Skipping invalid sector config for "${sectorKey}"`);
        continue;
      }

      const hasInlineLayout =
        Array.isArray(sectorConfig.metrics) || Array.isArray(sectorConfig.tabs);
      const sourcePath =
        typeof sectorConfig.source === 'string' ? sectorConfig.source.trim() : '';

      // Backwards compatibility: keep existing inline config when no source is defined.
      if (!sourcePath) {
        const inlineConfig = { ...sectorConfig };
        delete inlineConfig.source;
        resolvedConfig[sectorKey] = inlineConfig;
        continue;
      }

      try {
        const sourceYamlContent = await this.fetchYamlFile(sourcePath);
        const sourceConfig = yaml.load(sourceYamlContent);
        const sourceMetrics = Array.isArray(sourceConfig?.metrics) ? sourceConfig.metrics : null;
        const sourceTabs = Array.isArray(sourceConfig?.tabs) ? sourceConfig.tabs : null;

        if (!sourceMetrics && !sourceTabs) {
          throw new Error(`No metrics or tabs found in ${sourcePath}`);
        }

        const mergedConfig = { ...sectorConfig };
        delete mergedConfig.source;

        if (sourceMetrics) {
          mergedConfig.metrics = sourceMetrics;
          delete mergedConfig.tabs;
        }

        if (sourceTabs) {
          mergedConfig.tabs = sourceTabs;
          delete mergedConfig.metrics;
        }

        resolvedConfig[sectorKey] = mergedConfig;
      } catch (error) {
        if (hasInlineLayout) {
          console.warn(
            `Failed to load source for "${sectorKey}" from ${sourcePath}; using inline layout instead.`,
            error
          );
          const fallbackConfig = { ...sectorConfig };
          delete fallbackConfig.source;
          resolvedConfig[sectorKey] = fallbackConfig;
        } else {
          console.warn(
            `Failed to load source for "${sectorKey}" from ${sourcePath}; skipping this sector.`,
            error
          );
        }
      }
    }

    return yaml.dump(resolvedConfig, {
      noRefs: true,
      lineWidth: -1,
      sortKeys: false
    });
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
      const mainYamlContent = await this.fetchYamlFile(this.configPath);
      console.log('Loaded dashboard.yml content:', mainYamlContent.substring(0, 200) + '...');

      const resolvedYamlContent = await this.resolveSourceConfigs(mainYamlContent);
      const success = dashboardsService.loadFromYaml(resolvedYamlContent);
      this.isLoaded = success;
      console.log('Successfully loaded dashboard configuration from file');
      return success;
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
