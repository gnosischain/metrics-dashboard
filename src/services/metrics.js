import apiService from './api';
import queries from '../queries';

/**
 * Service for handling metrics data and configuration
 */
class MetricsService {
  /**
   * Available metrics configuration loaded through dynamic import
   */
  metrics = queries;

  /**
   * Cache for transformed data to prevent excessive re-computation
   */
  dataCache = new Map();

  constructor() {
    console.log('Metrics Service initialized with', this.metrics.length, 'metrics');
    // Apply default values to metrics that don't have them
    this.applyDefaultValues();
  }

  /**
   * Apply default values to metrics that don't have tab or size
   */
  applyDefaultValues() {
    this.metrics = this.metrics.map(metric => ({
      ...metric,
      tab: metric.tab || 'General',
      size: metric.size || 'medium',
      vSize: metric.vSize || 'medium'
    }));
  }

  /**
   * Get all unique tabs from metrics
   * @returns {Array} Array of tab names
   */
  getAllTabs() {
    return [...new Set(this.metrics.map(metric => metric.tab || 'General'))].sort();
  }

  /**
   * Get metrics for a specific tab
   * @param {string} tabName - Name of the tab
   * @returns {Array} Array of metrics for the tab
   */
  getMetricsForTab(tabName) {
    return this.metrics.filter(metric => (metric.tab || 'General') === tabName);
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
    // Ensure essential defaults even if config is missing
    return metric || {
      id: metricId,
      name: metricId,
      description: 'Unknown metric',
      format: 'formatNumber',
      chartType: 'line',
      color: '#999999',
      tab: 'General',
      size: 'medium',
      vSize: 'medium',
      xField: 'date',
      yField: 'value',
      enableFiltering: false,
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
   * Transform data for visualization components
   * @param {Array} data - Raw data from API
   * @param {string} metricId - Metric ID for configuration lookup
   * @returns {Object|Array} Transformed data ready for visualization
   */
  transformData(data, metricId) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`MetricsService[${metricId}]: No data to transform`);
      return [];
    }

    const metricConfig = this.getMetricConfig(metricId);

    console.log(`MetricsService[${metricId}]: Transforming data - Type: ${metricConfig.chartType}, Data type: ${typeof data}, Is Array: ${Array.isArray(data)}, Length: ${Array.isArray(data) ? data.length : 'N/A'}`);

    // Handle non-array data for special cases
    if (!Array.isArray(data)) {
      console.log(`MetricsService[${metricId}]: Non-array data received:`, typeof data, data);
      
      // For text widgets, return string content
      if (metricConfig.chartType === 'text') {
        return typeof data === 'string' ? data : String(data);
      }
      
      // For number widgets, return number
      if (metricConfig.chartType === 'number' || metricConfig.chartType === 'numberDisplay') {
        return typeof data === 'number' ? data : parseFloat(data) || 0;
      }
      
      // For other chart types, try to convert to array
      if (typeof data === 'object' && data !== null) {
        const result = Object.entries(data).map(([key, value]) => ({
          name: key,
          value: value
        }));
        console.log(`MetricsService[${metricId}]: Converted object to array format:`, result);
        return result;
      } else {
        const result = [{ name: 'Value', value: data }];
        console.log(`MetricsService[${metricId}]: Converted single value to array:`, result);
        return result;
      }
    }

    // For array data, log the structure
    if (data.length > 0) {
      const firstRow = data[0];
      console.log(`MetricsService[${metricId}]: First row structure:`, Object.keys(firstRow));
      console.log(`MetricsService[${metricId}]: Sample data:`, data.slice(0, 2));
    }

    // Special handling for text widgets
    if (metricConfig.chartType === 'text') {
      console.log(`MetricsService[${metricId}]: Processing text widget`);
      
      // If data has content field, use it; otherwise use the configured content
      if (Array.isArray(data) && data[0] && data[0].content) {
        return data[0].content;
      } else if (metricConfig.content) {
        return metricConfig.content;
      } else {
        return 'No content available';
      }
    }

    // Special handling for number widgets
    if (metricConfig.chartType === 'number' || metricConfig.chartType === 'numberDisplay') {
      console.log(`MetricsService[${metricId}]: Processing number widget`);
      
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'number') {
          return firstItem;
        } else if (firstItem.value !== undefined) {
          return parseFloat(firstItem.value) || 0;
        } else {
          const numericValue = Object.values(firstItem).find(val => typeof val === 'number');
          return numericValue || 0;
        }
      }
      
      return typeof data === 'number' ? data : 0;
    }

    // For all chart types (ECharts, tables, networks, etc.), pass raw array data
    console.log(`MetricsService[${metricId}]: Passing raw array data for chart type: ${metricConfig.chartType}`);
    console.log(`MetricsService[${metricId}]: Final data - Length: ${data.length}, Sample:`, data.slice(0, 2));
    
    return data;
  }

  /**
   * Transform data for Sankey charts (kept for backward compatibility)
   * @param {Array} data - Raw data
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} Sankey chart data
   */
  transformSankeyData(data, metricConfig) {
    const sourceField = metricConfig.sourceField || 'source';
    const targetField = metricConfig.targetField || 'target';
    const valueField = metricConfig.valueField || 'value';

    // Extract unique nodes
    const nodes = new Set();
    data.forEach(item => {
      nodes.add(item[sourceField]);
      nodes.add(item[targetField]);
    });

    // Create node array
    const nodeArray = Array.from(nodes).map(name => ({ name }));

    // Create links array
    const links = data.map(item => ({
      source: item[sourceField],
      target: item[targetField],
      value: parseFloat(item[valueField] || 0)
    }));

    return {
      nodes: nodeArray,
      links: links
    };
  }

  /**
   * Transform data for Network charts (kept for backward compatibility)
   * @param {Array} data - Raw data
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} Network chart data
   */
  transformNetworkData(data, metricConfig) {
    // Similar to Sankey but with different structure
    return this.transformSankeyData(data, metricConfig);
  }

  /**
   * Clear data cache
   */
  clearCache() {
    console.log("MetricsService: Clearing data cache.");
    this.dataCache.clear();
  }

  /**
   * Fetch data for a specific metric
   * @param {string} metricId - ID of the metric to fetch
   * @returns {Promise} Metric data
   */
  async fetchMetricData(metricId) {
    try {
      console.log(`MetricsService[${metricId}]: Fetching data...`);
      const result = await apiService.fetchMetric(metricId);

      // Transform the data for visualization
      const transformedData = this.transformData(result, metricId);
      console.log(`MetricsService[${metricId}]: Data fetched and processed.`);
      return transformedData;
    } catch (error) {
      console.error(`MetricsService[${metricId}]: Error fetching or transforming data:`, error);
      return [];
    }
  }

  /**
   * Fetch data for all metrics
   * @returns {Promise} All metrics data
   */
  async fetchAllMetricsData() {
    try {
      const results = await apiService.fetchAllMetrics();

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
      return {};
    }
  }

  /**
   * Handle single value metrics
   * @param {Array|Object} data - Raw data from API
   * @returns {Array} - Data in a format compatible with Chart component
   */
  handleSingleValueMetrics(data) {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Convert single value or object to array format
    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => ({
        name: key,
        value: value
      }));
    }
    
    return [{ name: 'Value', value: data }];
  }
}

// Create and export the service instance
const metricsService = new MetricsService();
export default metricsService;