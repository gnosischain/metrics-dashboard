import api from './api';
import queries from '../queries';

class MetricsService {
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

      // The API returns the data directly for a specific metric
      return {
        data: response
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
