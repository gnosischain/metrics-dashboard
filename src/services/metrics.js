import apiService from './api';
import queries from '../queries';
import { generateColorPalette } from '../utils/colors';

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
      vSize: metric.vSize || 'medium' // Add default vertical size
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
    return metric || {
      id: metricId,
      name: metricId,
      description: 'Unknown metric',
      format: 'formatNumber',
      chartType: 'line',
      color: '#999999',
      tab: 'General',
      size: 'medium',
      vSize: 'medium'
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
   * Transform data for horizontal bar charts
   * @param {Array} data - Raw data
   * @param {Object} metricConfig - Metric configuration
   * @returns {Array} Transformed data for horizontal bar charts
   */
  transformHorizontalBarData(data, metricConfig) {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    // Get field configuration with defaults
    const labelField = metricConfig.labelField || Object.keys(data[0]).find(key => typeof data[0][key] === 'string');
    const valueField = metricConfig.valueField || 'value';
    
    if (!labelField || !data[0][labelField]) {
      console.warn('No label field found for horizontal bar chart');
      return data;
    }
    
    // Sort data by value in descending order (if not already sorted)
    const sortedData = [...data].sort((a, b) => {
      const valueA = parseFloat(a[valueField] || 0);
      const valueB = parseFloat(b[valueField] || 0);
      return valueB - valueA;
    });
    
    // Transform the data for horizontal bar charts
    return sortedData.map(item => ({
      // Use the label field as the category (y-axis)
      category: item[labelField], 
      // This will be the value (x-axis)
      value: parseFloat(item[valueField] || 0)
    }));
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

    // Generate a cache key
    const cacheKey = `${metricId}-${JSON.stringify(data).length}`;
    
    // Check if we have a cached result
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey);
    }

    const firstRow = data[0];
    const metricConfig = this.getMetricConfig(metricId);
    
    // Handle horizontal bar chart data specifically
    if (metricConfig.chartType === 'horizontalBar') {
      return this.transformHorizontalBarData(data, metricConfig);
    }
    
    // Determine the date field - could be date, hour, timestamp, time, etc.
    const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
    const dateField = dateFields.find(field => firstRow[field] !== undefined) || '';
    
    if (!dateField) {
      console.warn(`No date field found for metric ${metricId}`);
      return data; // Return as is if no date field found
    }
    
    let result;
    
    // Handle labelField if specified in the metric config
    if (metricConfig.labelField && firstRow[metricConfig.labelField] !== undefined) {
      result = this.transformLabeledData(data, dateField, metricConfig);
    } else {
      // Check if this is a multi-series dataset (has columns other than date and value)
      const seriesKeys = Object.keys(firstRow).filter(key => 
        key !== dateField && key !== 'value' && !dateFields.includes(key)
      );
      
      if (seriesKeys.length > 0 && !firstRow.hasOwnProperty('value')) {
        // Multi-series data (like client distribution)
        result = this.transformMultiSeriesData(data, dateField, metricConfig, seriesKeys);
      } else {
        // Standard date/value format
        if (firstRow.hasOwnProperty('value') || typeof firstRow.value === 'number' || typeof firstRow.value === 'string') {
          result = data.map(item => {
            let dateValue = item[dateField];
            
            // If the date has a time component, handle it appropriately
            if (typeof dateValue === 'string' && dateValue.includes(' ')) {
              dateValue = dateValue.split(' ')[0]; // Get just the date part
            }
            
            return {
              date: dateValue,
              value: item.value !== undefined ? parseFloat(item.value) : 0
            };
          });
        } else {
          // If we can't determine a format, return as-is
          result = data;
        }
      }
    }
    
    // Cache the result (limit the cache size)
    if (this.dataCache.size > 100) {
      // Remove old entries if cache gets too large
      const oldestKey = this.dataCache.keys().next().value;
      this.dataCache.delete(oldestKey);
    }
    this.dataCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Transform data with a label field into a multi-line chart format
   * @param {Array} data - Raw data
   * @param {string} dateField - Name of the date field
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} Transformed data for chart
   */
  transformLabeledData(data, dateField, metricConfig) {
    const labelField = metricConfig.labelField;
    const valueField = metricConfig.valueField || 'value';
    
    // Get unique labels
    const uniqueLabels = [...new Set(data.map(item => item[labelField]))];
    
    // Get unique dates
    const uniqueDates = [...new Set(data.map(item => {
      const dateValue = item[dateField];
      // Handle date-time format if needed
      if (typeof dateValue === 'string' && dateValue.includes(' ')) {
        return dateValue.split(' ')[0];
      }
      return dateValue;
    }))].sort();
    
    // Generate a color palette if colors not specified
    const colors = Array.isArray(metricConfig.color) 
      ? metricConfig.color 
      : generateColorPalette(uniqueLabels.length);
    
    // Create datasets for each label
    const datasets = uniqueLabels.map((label, index) => {
      const labelData = data.filter(item => item[labelField] === label);
      
      // Map the data to match the dates
      const values = uniqueDates.map(date => {
        const matchingItem = labelData.find(item => {
          const itemDate = typeof item[dateField] === 'string' && item[dateField].includes(' ')
            ? item[dateField].split(' ')[0]
            : item[dateField];
          return itemDate === date;
        });
        
        return matchingItem 
          ? parseFloat(matchingItem[valueField]) 
          : null; // Use null for missing data points
      });
      
      return {
        label: label,
        data: values,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length]
      };
    });
    
    return {
      labels: uniqueDates,
      datasets
    };
  }

  /**
   * Transform multi-series data (like client distribution)
   * @param {Array} data - Raw data
   * @param {string} dateField - Name of the date field
   * @param {Object} metricConfig - Metric configuration
   * @param {Array} seriesKeys - Keys for series data
   * @returns {Object} Transformed data for chart
   */
  transformMultiSeriesData(data, dateField, metricConfig, seriesKeys) {
    // Extract labels (dates or hours)
    const labels = data.map(item => {
      const dateTime = item[dateField];
      // Handle different date formats
      if (dateTime && typeof dateTime === 'string') {
        if (dateTime.includes(' ')) {
          // If it has date and time parts
          const [date, time] = dateTime.split(' ');
          // Return just the time part if it's an hour-based metric
          if (dateField === 'hour') {
            return time.substring(0, 5); // Return 'HH:MM' format
          }
          return date; // Otherwise return the date part
        }
        return dateTime;
      }
      return dateTime;
    });
    
    // Generate a color palette if colors not specified
    const colors = Array.isArray(metricConfig.color) 
      ? metricConfig.color 
      : generateColorPalette(seriesKeys.length);
    
    // Create datasets for each series
    const datasets = seriesKeys.map((series, index) => {
      const color = colors[index % colors.length];
      return {
        label: series,
        data: data.map(item => item[series] !== undefined ? parseFloat(item[series]) : 0),
        backgroundColor: color + '80', // Add 50% opacity
        borderColor: color,
        hoverBackgroundColor: color, // Full opacity on hover
        hoverBorderColor: color,
      };
    });
    
    return { labels, datasets };
  }

  /**
   * Clear data cache
   */
  clearCache() {
    this.dataCache.clear();
  }

  /**
   * Fetch data for a specific metric
   * @param {string} metricId - ID of the metric to fetch
   * @returns {Promise} Metric data
   */
  async fetchMetricData(metricId) {
    try {
      console.log(`Fetching ${metricId}`);
      
      const result = await apiService.fetchMetric(metricId);
      
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
      return {}; // Return empty object instead of throwing
    }
  }

  /**
   * Handle single value metrics
   * Ensures that even metrics that return a single value have the proper format
   * @param {Array|Object} data - Raw data from API
   * @returns {Array} - Data in a format compatible with Chart component
   */
  transformSingleValueData(data) {
    // If data is already an array with at least one item, return it
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    
    // If data is a single object with a value property
    if (data && typeof data === 'object' && data.value !== undefined) {
      return [data];
    }
    
    // If data is just a number, wrap it in an object
    if (typeof data === 'number') {
      return [{ value: data }];
    }
    
    // Default case - empty array
    return [];
  }
}

export default new MetricsService();