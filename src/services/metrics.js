import api from './api';
import queries from '../queries';

class MetricsService {
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

      // Single-row object payload
      return [response];
    }

    return [];
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

    try {
      // Get metric configuration to check if it's a text widget
      const metricConfig = this.getMetricConfig(metricId);
      
      // For text widgets with static content, return the content directly
      if (metricConfig && metricConfig.chartType === 'text' && metricConfig.content) {
        return {
          content: metricConfig.content
        };
      }
      
      // For other widgets, fetch from API
      const response = await api.get(`/metrics/${metricId}`, normalizedParams);

      // Normalize all metric responses into an array for widget consumers.
      const normalizedRows = this.normalizeMetricRows(response);

      return {
        data: normalizedRows
      };
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
