import dashboardsService from '../services/dashboards';
import alertsService from '../services/alerts';
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

    const entries = Object.entries(parsedMain);

    // Resolve every sector's source YAML in parallel. Previously this was a
    // serial `for...of await` which on a cold dev cache meant 13 sequential
    // ~1–2s fetches (~20–25s blocking first paint). Parallel reduces it to
    // ~max(perFetch).
    const resolvedEntries = await Promise.all(entries.map(async ([sectorKey, sectorConfig]) => {
      if (!sectorConfig || typeof sectorConfig !== 'object' || Array.isArray(sectorConfig)) {
        console.warn(`Skipping invalid sector config for "${sectorKey}"`);
        return null;
      }

      const hasInlineLayout =
        Array.isArray(sectorConfig.metrics) || Array.isArray(sectorConfig.tabs);
      const sourcePath =
        typeof sectorConfig.source === 'string' ? sectorConfig.source.trim() : '';

      if (!sourcePath) {
        const inlineConfig = { ...sectorConfig };
        delete inlineConfig.source;
        return [sectorKey, inlineConfig];
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

        return [sectorKey, mergedConfig];
      } catch (error) {
        if (hasInlineLayout) {
          console.warn(
            `Failed to load source for "${sectorKey}" from ${sourcePath}; using inline layout instead.`,
            error
          );
          const fallbackConfig = { ...sectorConfig };
          delete fallbackConfig.source;
          return [sectorKey, fallbackConfig];
        }
        console.warn(
          `Failed to load source for "${sectorKey}" from ${sourcePath}; skipping this sector.`,
          error
        );
        return null;
      }
    }));

    const resolvedConfig = {};
    resolvedEntries.forEach((entry) => {
      if (entry) resolvedConfig[entry[0]] = entry[1];
    });

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
    if (this.isLoaded) {
      return true;
    }
    // Dedup overlapping calls — StrictMode mounts effects twice and a
    // remount during the first load would otherwise re-issue every YAML
    // fetch in parallel with the in-flight one.
    if (this._loadPromise) {
      return this._loadPromise;
    }

    this._loadPromise = (async () => {
      try {
        const [mainYamlContent, alertsYamlSettled] = await Promise.all([
          this.fetchYamlFile(this.configPath),
          this.fetchYamlFile('/alerts.yml').catch((err) => ({ __error: err }))
        ]);
        console.log('Loaded dashboard.yml content:', mainYamlContent.substring(0, 200) + '...');

        const resolvedYamlContent = await this.resolveSourceConfigs(mainYamlContent);
        const success = dashboardsService.loadFromYaml(resolvedYamlContent);
        this.isLoaded = success;
        console.log('Successfully loaded dashboard configuration from file');

        if (alertsYamlSettled && typeof alertsYamlSettled === 'string') {
          try {
            alertsService.loadFromYaml(alertsYamlSettled);
          } catch (err) {
            console.warn('Failed to parse alerts.yml; continuing without alerts.', err);
          }
        } else if (alertsYamlSettled?.__error) {
          console.warn('No alerts.yml found or failed to load; continuing without alerts.', alertsYamlSettled.__error);
        }

        return success;
      } catch (error) {
        console.error('Error loading dashboard configuration:', error);
        this.useDefaultConfig();
        return true;
      } finally {
        this._loadPromise = null;
      }
    })();

    return this._loadPromise;
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
