import api from './api';
import queries from '../queries';

class MetricsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get metric configuration by ID
   * @param {string} metricId - The metric ID
   * @returns {Object} The metric configuration
   */
  getMetricConfig(metricId) {
    return queries.find(q => q.id === metricId);
  }

  /**
   * Get all available metrics
   * @returns {Array} Array of metric configurations
   */
  getAllMetrics() {
    return queries;
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

    // Backwards-compatible cache key:
    // - Without params: key is metricId (existing behavior)
    // - With params: include them so different ranges/filters don't collide
    const cacheKey =
      Object.keys(normalizedParams).length === 0
        ? metricId
        : `${metricId}|${Object.entries(normalizedParams)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${String(v)}`)
            .join('&')}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Get metric configuration to check if it's a text widget
      const metricConfig = this.getMetricConfig(metricId);
      
      // For text widgets with static content, return the content directly
      if (metricConfig && metricConfig.chartType === 'text' && metricConfig.content) {
        const data = {
          content: metricConfig.content
        };
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        return data;
      }
      
      // For other widgets, fetch from API
      const response = await api.get(`/metrics/${metricId}`, normalizedParams);

      // The API returns the data directly for a specific metric
      const data = {
        data: response
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching metric ${metricId}:`, error);
      
      // If we have cached data, return it even if expired
      if (cached) {
        console.warn(`Using expired cache for metric ${metricId}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  /**
   * Clear cache for a specific metric or all metrics
   * @param {string} metricId - Optional metric ID to clear specific cache
   */
  clearCache(metricId = null) {
    if (metricId) {
      this.cache.delete(metricId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get metrics grouped by category
   * @returns {Object} Metrics grouped by category
   */
  getMetricsByCategory() {
    return queries.reduce((acc, metric) => {
      const category = metric.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(metric);
      return acc;
    }, {});
  }
}

// Create and export singleton instance
const metricsService = new MetricsService();
export default metricsService;