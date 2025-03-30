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
   * Transform raw data into a format usable by charts
   * @param {Array} data - Raw data from API
   * @param {string} metricId - ID of the metric
   * @returns {Array|Object} - Transformed data for charts
   */
  transformData(data, metricId) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const firstRow = data[0];
    
    // Special handling for dataSize metric (complex multi-series data)
    if (metricId === 'dataSize') {
      const dateField = firstRow.hour ? 'hour' : 'date';
      
      // Get all keys except date/hour as potential series
      const seriesKeys = Object.keys(firstRow).filter(key => 
        key !== dateField && key !== 'value'
      );
      
      if (seriesKeys.length > 0) {
        // Extract labels (dates or hours)
        const labels = data.map(item => {
          const dateTime = item[dateField];
          // If it's a full datetime format, extract just the date and hour
          if (dateTime && dateTime.includes(' ')) {
            const [date, time] = dateTime.split(' ');
            return time.substring(0, 5); // Return 'HH:MM' format
          }
          return dateTime;
        });
        
        // Create datasets for each series
        const datasets = seriesKeys.map(series => ({
          label: series,
          data: data.map(item => item[series] !== undefined ? parseFloat(item[series]) : 0)
        }));
        
        return { labels, datasets };
      }
    }
    
    // Standard date/value format
    if ((firstRow.date || firstRow.hour) && 
        (firstRow.value !== undefined || typeof firstRow.value === 'number' || typeof firstRow.value === 'string')) {
      return data.map(item => ({
        date: item.date || (item.hour ? item.hour.split(' ')[0] : ''),
        value: item.value !== undefined ? parseFloat(item.value) : 0
      }));
    }
    
    // If we can't determine a format, return as-is
    return data;
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
      
      console.log(`Fetching ${metricId} for range ${range} (${dateRange.from} to ${dateRange.to})`);
      
      const result = await apiService.fetchMetric(metricId, {
        range,
        from: dateRange.from,
        to: dateRange.to
      });
      
      // Validate the result
      if (!Array.isArray(result) || result.length === 0) {
        console.warn(`No data received for ${metricId}`);
        return [];
      }
      
      // Transform the data for visualization
      const transformedData = this.transformData(result, metricId);
      return transformedData;
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
      const results = await apiService.fetchAllMetrics({
        range,
        from: dateRange.from,
        to: dateRange.to
      });
      
      // Transform each metric's data
      const transformedResults = {};
      
      for (const metricId in results) {
        if (Object.prototype.hasOwnProperty.call(results, metricId)) {
          transformedResults[metricId] = this.transformData(results[metricId], metricId);
        }
      }
      
      return transformedResults;
    } catch (error) {
      console.error('Error in fetchAllMetricsData:', error);
      return {}; // Return empty object instead of throwing
    }
  }
}

export default new MetricsService();