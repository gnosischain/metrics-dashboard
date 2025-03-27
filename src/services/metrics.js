import apiService from './api';
import { getDateRange } from '../utils/dates';
import queries from '../queries';

/**
 * Service for handling metrics data and configuration
 */
class MetricsService {
  /**
   * Available metrics configuration loaded from individual files
   */
  metrics = queries;

  constructor() {
    console.log('Metrics Service initialized with', this.metrics.length, 'metrics');
  }

  /**
   * Get metric configuration by ID
   * @param {string} metricId - ID of the metric
   * @returns {Object} Metric configuration
   */
  getMetricConfig(metricId) {
    const metric = this.metrics.find(metric => metric.id === metricId);
    if (!metric) {
      console.error(`Metric configuration not found for ID: ${metricId}`);
    }
    return metric || {
      id: metricId,
      name: metricId,
      description: 'Unknown metric',
      format: 'formatNumber',
      chartType: 'line',
      color: '#999999'
    };
  }

  /**
   * Get all metrics configurations
   * @returns {Array} Array of metric configurations
   */
  getAllMetricsConfig() {
    return this.metrics;
  }

  /**
   * Fetch data for a specific metric
   * @param {string} metricId - ID of the metric to fetch
   * @param {string} range - Date range code (e.g., '7d', '30d')
   * @returns {Promise} Metric data
   */
  async fetchMetricData(metricId, range = '7d') {
    try {
      const dateRange = getDateRange(range);
      
      const result = await apiService.fetchMetric(metricId, {
        range,
        from: dateRange.from,
        to: dateRange.to
      });
      
      // Validate data structure
      if (!Array.isArray(result)) {
        console.error(`Invalid data format for ${metricId}:`, result);
        return [];
      }
      
      // Make sure all data points have date and value
      return result.filter(item => 
        item && typeof item.date !== 'undefined' && typeof item.value !== 'undefined'
      );
    } catch (error) {
      console.error(`Error in fetchMetricData for ${metricId}:`, error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Fetch data for all metrics
   * @param {string} range - Date range code (e.g., '7d', '30d')
   * @returns {Promise} All metrics data
   */
  async fetchAllMetricsData(range = '7d') {
    try {
      const dateRange = getDateRange(range);
      return apiService.fetchAllMetrics({
        range,
        from: dateRange.from,
        to: dateRange.to
      });
    } catch (error) {
      console.error('Error in fetchAllMetricsData:', error);
      return {}; // Return empty object instead of throwing
    }
  }
}

export default new MetricsService();