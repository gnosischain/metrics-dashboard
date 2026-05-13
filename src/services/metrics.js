import api from './api';
import { queryLoaders, queryIds } from '../queries';

class MetricsService {
  constructor() {
    this.configCache = new Map();
    this.inflight = new Map();
    this.cacheVersion = 0;
    this.listeners = new Set();
    this.allLoaded = false;
  }

  /**
   * Normalize API payloads to a consistent row-array shape.
   * Supports raw arrays and common wrapped formats.
   * @param {any} response
   * @returns {Array}
   */
  normalizeMetricRows(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response.rows)) {
        return response.rows;
      }

      if (Array.isArray(response.result)) {
        return response.result;
      }

      return [response];
    }

    return [];
  }

  /**
   * Get metric configuration by ID. Synchronous — returns undefined if the
   * config has not been loaded yet via `loadMetricConfigs`.
   * @param {string} metricId - The metric ID
   * @returns {Object|undefined} The metric configuration
   */
  getMetricConfig(metricId) {
    if (!metricId) return undefined;
    const cached = this.configCache.get(metricId);
    if (!cached && queryLoaders.has(metricId) && import.meta.env?.VITE_DEBUG_METRICS === 'true') {
      console.warn(`MetricsService: getMetricConfig("${metricId}") called before config loaded`);
    }
    return cached;
  }

  /**
   * Get all loaded metric configurations. Only returns configs that have
   * been resolved so far; callers that need every metric should await
   * `loadAllMetricConfigs()` first.
   * @returns {Array} Array of loaded metric configurations
   */
  getAllMetrics() {
    return Array.from(this.configCache.values());
  }

  /**
   * Lazily load a set of metric configurations into the cache. Idempotent
   * and de-duplicated — already-loaded ids resolve immediately, in-flight
   * loads are awaited rather than re-issued.
   * @param {string[]} ids
   * @returns {Promise<void>}
   */
  async loadMetricConfigs(ids = []) {
    const seen = new Set();
    const pending = [];

    for (const rawId of ids) {
      const id = typeof rawId === 'string' ? rawId : null;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      if (this.configCache.has(id)) continue;
      const loader = queryLoaders.get(id);
      if (!loader) continue;

      let promise = this.inflight.get(id);
      if (!promise) {
        promise = loader()
          .then((config) => {
            if (config) {
              this.configCache.set(id, config);
            }
          })
          .catch((err) => {
            console.error(`MetricsService: failed to load metric config "${id}":`, err);
          })
          .finally(() => {
            this.inflight.delete(id);
          });
        this.inflight.set(id, promise);
      }
      pending.push(promise);
    }

    if (pending.length === 0) {
      return;
    }

    await Promise.all(pending);
    this.cacheVersion += 1;
    this.notifyListeners();
  }

  /**
   * Load every known metric configuration. Used to populate the
   * cross-dashboard search index after the initial render.
   * @returns {Promise<void>}
   */
  async loadAllMetricConfigs() {
    if (this.allLoaded) return;
    await this.loadMetricConfigs(queryIds);
    this.allLoaded = true;
  }

  /**
   * Merge cached configs into a list of layout-only metric entries.
   * Layout fields (gridRow, gridColumn, minHeight, tabGroup, tabLabel)
   * take precedence over fields from the underlying config.
   * @param {Array<{id: string} & object>} layoutEntries
   * @returns {Array}
   */
  resolveTabMetrics(layoutEntries = []) {
    if (!Array.isArray(layoutEntries)) return [];
    return layoutEntries.map((entry) => {
      const config = entry && entry.id ? this.configCache.get(entry.id) : undefined;
      return { ...(config || {}), ...entry };
    });
  }

  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.cacheVersion);
      } catch (err) {
        console.error('MetricsService: listener threw', err);
      }
    });
  }

  /**
   * Get metric data from the API
   * @param {string} metricId - The metric ID
   * @param {Object} params - Optional query params (from/to/filterField/filterValue, etc.)
   * @returns {Promise<Object>} The metric data
   */
  async getMetricData(metricId, params = {}) {
    const normalizedParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );

    try {
      let metricConfig = this.getMetricConfig(metricId);
      if (!metricConfig && queryLoaders.has(metricId)) {
        await this.loadMetricConfigs([metricId]);
        metricConfig = this.getMetricConfig(metricId);
      }

      if (metricConfig && metricConfig.chartType === 'text' && metricConfig.content) {
        return { content: metricConfig.content };
      }

      const response = await api.get(`/metrics/${metricId}`, normalizedParams);
      const normalizedRows = this.normalizeMetricRows(response);

      return response && typeof response === 'object' && !Array.isArray(response)
        ? { ...response, data: normalizedRows }
        : { data: normalizedRows };
    } catch (error) {
      console.error(`Error fetching metric ${metricId}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific metric or all metrics
   * @param {string} metricId - Optional metric ID to clear specific cache
   */
  clearCache(metricId = null) {
    if (metricId) {
      api.clearCacheByEndpoint(`/metrics/${metricId}`);
    } else {
      api.clearCache();
    }
  }

  /**
   * Get loaded metrics grouped by category. Includes only configs already
   * present in the cache.
   * @returns {Object} Metrics grouped by category
   */
  getMetricsByCategory() {
    return this.getAllMetrics().reduce((acc, metric) => {
      const category = metric.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(metric);
      return acc;
    }, {});
  }
}

const metricsService = new MetricsService();
export default metricsService;
