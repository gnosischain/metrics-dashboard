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
      valueField: 'value', // Default value field
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
    const labelField = metricConfig.labelField || Object.keys(data[0]).find(key => typeof data[0][key] === 'string' && key !== 'date'); // Avoid picking date as label
    const valueField = metricConfig.valueField || 'value';

    if (!labelField || !data[0][labelField] === undefined) {
      console.warn(`No label field found or available in data for horizontal bar chart: ${metricConfig.id}`);
      return data.map(item => ({ category: 'Unknown', value: parseFloat(item[valueField] || 0) })); // Fallback
    }

    // Sort data by value in descending order (if not already sorted)
    const sortedData = [...data].sort((a, b) => {
      const valueA = parseFloat(a[valueField] || 0);
      const valueB = parseFloat(b[valueField] || 0);
      return valueB - valueA;
    });

    // Transform the data for horizontal bar charts
    return sortedData.map(item => ({
      category: item[labelField], // Use the label field as the category (y-axis)
      value: parseFloat(item[valueField] || 0) // This will be the value (x-axis)
    }));
  }


  /**
   * Transform raw data into a format usable by charts
   * @param {Array} data - Raw data from API
   * @param {string} metricId - ID of the metric
   * @returns {Array|Object} - Transformed data for charts
   */
  transformData(data, metricId) {
    const metricConfig = this.getMetricConfig(metricId);

    // Determine if this is a stacked area chart
    const isStackedArea = metricConfig.chartType === 'area' && 
                          (metricConfig.stackedArea === true || metricConfig.stacked === true);

    // --- >>> CRITICAL CHECK <<< ---
    // If EnhancedChart is meant to handle filtering and sub-label stacking, pass raw data
    if (metricConfig.enableFiltering && metricConfig.labelField && metricConfig.subLabelField) {
        console.log(`MetricsService[${metricId}]: Passing raw data to EnhancedChart (filtering enabled with subLabelField).`);

        // Basic validation of raw data structure
        if (!Array.isArray(data)) {
            console.error(`MetricsService[${metricId}]: Expected raw data to be an array, but got:`, typeof data);
            return []; // Return empty array if raw data isn't an array
        }
        if (data.length > 0) {
             const firstRow = data[0];
             const requiredFields = [metricConfig.labelField, metricConfig.subLabelField, metricConfig.valueField || 'value'];
             // Also check for a date field
             const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
             const hasDateField = dateFields.some(field => firstRow[field] !== undefined);
             if (!hasDateField) {
                 console.warn(`MetricsService[${metricId}]: Raw data for EnhancedChart seems to be missing a date field.`);
             }
             requiredFields.forEach(field => {
                 if (firstRow[field] === undefined) {
                     console.warn(`MetricsService[${metricId}]: Raw data for EnhancedChart is missing expected field '${field}'.`);
                 }
             });
         } else {
             console.log(`MetricsService[${metricId}]: Raw data array is empty.`);
         }
        return data; // Return raw data directly
    }
    // --- End Critical Check ---

    // Special case for stacked area charts
    if (isStackedArea && metricConfig.labelField) {
        console.log(`MetricsService[${metricId}]: Applying stacked area chart transformation for ${metricId}.`);
        return this.transformStackedAreaData(data, metricConfig);
    }

    // --- Standard Transformation Logic (if not handled by EnhancedChart) ---
    console.log(`MetricsService[${metricId}]: Applying standard transformation.`);

    if (!Array.isArray(data) || data.length === 0) {
        console.warn(`MetricsService[${metricId}]: Received empty or invalid data for standard transformation.`);
        return [];
    }

    const firstRow = data[0];
    let result;

    // Handle specific chart types first
    if (metricConfig.chartType === 'horizontalBar') {
        result = this.transformHorizontalBarData(data, metricConfig);
    } else if (metricConfig.chartType === 'pie' || metricConfig.chartType === 'map' || metricConfig.chartType === 'numberDisplay') {
        // These types often need simpler category/value or just value.
        // Let the Chart component handle internal structuring for these simpler types.
        // We just ensure the data is an array.
        console.log(`MetricsService[${metricId}]: Passing data as-is for simple chart type ${metricConfig.chartType}.`);
        result = data; // Assume Chart component can handle this structure
    } else {
        // Handle Time Series Charts (Line, Bar, Stacked Bar without filtering handled above)

        // Determine the date field
        const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
        const dateField = dateFields.find(field => firstRow[field] !== undefined) || '';

        if (!dateField) {
            console.warn(`MetricsService[${metricId}]: No date field found for time series transformation.`);
            // Fallback? Maybe return raw data if no other structure applies
            result = data;
        } else {
             // Handle labelField (for multi-line etc., but NOT the EnhancedChart case)
             if (metricConfig.labelField && firstRow[metricConfig.labelField] !== undefined) {
                 console.log(`MetricsService[${metricId}]: Transforming standard labeled data (multi-line).`);
                 result = this.transformLabeledData(data, dateField, metricConfig);
             }
             // Handle multi-series (columns other than date/value)
             else {
                 const seriesKeys = Object.keys(firstRow).filter(key =>
                     key !== dateField && key !== 'value' && !dateFields.includes(key)
                 );
                 if (seriesKeys.length > 0 && firstRow.value === undefined) {
                     console.log(`MetricsService[${metricId}]: Transforming standard multi-series data.`);
                     result = this.transformMultiSeriesData(data, dateField, metricConfig, seriesKeys);
                 }
                 // Handle standard date/value
                 else if (firstRow.value !== undefined) {
                     console.log(`MetricsService[${metricId}]: Transforming standard date/value data.`);
                     result = data.map(item => {
                         let dateValue = item[dateField];
                         if (typeof dateValue === 'string' && dateValue.includes(' ')) {
                             dateValue = dateValue.split(' ')[0];
                         }
                         return {
                             date: dateValue,
                             value: parseFloat(item.value || 0)
                         };
                     });
                 } else {
                      console.warn(`MetricsService[${metricId}]: Could not determine standard format. Returning raw.`);
                      result = data; // Fallback
                 }
             }
        }
    }

    return result;
  }

  /**
   * Transform data specifically for stacked area charts
   * @param {Array} data - Raw data from API
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} - Transformed data for stacked area charts
   */
  transformStackedAreaData(data, metricConfig) {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('Empty or invalid data for stacked area chart');
      return { labels: [], datasets: [] };
    }

    const labelField = metricConfig.labelField;
    const valueField = metricConfig.valueField || 'value';

    // Determine the date field
    const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
    const dateField = dateFields.find(field => data[0][field] !== undefined);

    if (!dateField) {
      console.error('No date field found in data for stacked area chart');
      return { labels: [], datasets: [] };
    }

    console.log(`Transforming stacked area data with labelField: ${labelField}, dateField: ${dateField}, valueField: ${valueField}`);

    // Extract unique dates and labels
    const uniqueDates = [...new Set(data.map(item => {
      const date = item[dateField];
      return typeof date === 'string' && date.includes(' ') ? date.split(' ')[0] : date;
    }))].sort();

    const uniqueLabels = [...new Set(data.map(item => item[labelField]))].sort();

    console.log(`Found ${uniqueDates.length} unique dates and ${uniqueLabels.length} unique labels`);

    // Generate colors for datasets
    const colors = metricConfig.color 
      ? Array(uniqueLabels.length).fill(metricConfig.color)
      : generateColorPalette(uniqueLabels.length);

    // Create a 2D map of [date][label] -> value
    const dataMap = {};
    uniqueDates.forEach(date => {
      dataMap[date] = {};
      uniqueLabels.forEach(label => {
        dataMap[date][label] = 0; // Initialize with zeros
      });
    });

    // Fill in the actual values
    data.forEach(item => {
      const date = typeof item[dateField] === 'string' && item[dateField].includes(' ')
        ? item[dateField].split(' ')[0]
        : item[dateField];
      
      const label = item[labelField];
      const value = parseFloat(item[valueField] || 0);

      // Add to existing value (in case of multiple entries for same date/label)
      if (dataMap[date] && label) {
        dataMap[date][label] = (dataMap[date][label] || 0) + value;
      }
    });

    // Convert to Chart.js datasets format
    const datasets = uniqueLabels.map((label, index) => {
      return {
        label,
        data: uniqueDates.map(date => dataMap[date][label] || 0),
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 1.5,
        fill: true, // Always true for stacked areas
      };
    });

    // Log output for debugging
    console.log(`Created ${datasets.length} datasets with ${uniqueDates.length} points each`);

    return {
      labels: uniqueDates,
      datasets
    };
  }

  /**
   * Transform data with a label field into a multi-line chart format
   * (Used for standard multi-line charts, not the EnhancedChart filtering case)
   * @param {Array} data - Raw data
   * @param {string} dateField - Name of the date field
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} Transformed data for chart
   */
   transformLabeledData(data, dateField, metricConfig) {
    const labelField = metricConfig.labelField;
    const valueField = metricConfig.valueField || 'value';

    // Validate required fields in data
    if (data.length === 0 || data[0][dateField] === undefined || data[0][labelField] === undefined || data[0][valueField] === undefined) {
        console.error(`MetricsService[${metricConfig.id}]: Data missing required fields for labeled transformation (date: ${dateField}, label: ${labelField}, value: ${valueField}).`);
        return { labels: [], datasets: [] };
    }

    // Get unique labels and dates
    const uniqueLabels = [...new Set(data.map(item => item[labelField]))].sort();
    const uniqueDates = [...new Set(data.map(item => {
      const dateValue = item[dateField];
      return typeof dateValue === 'string' && dateValue.includes(' ') ? dateValue.split(' ')[0] : dateValue;
    }))].sort();

    // Generate colors
    const colors = Array.isArray(metricConfig.color)
      ? metricConfig.color
      : generateColorPalette(uniqueLabels.length);

    // Create datasets
    const datasets = uniqueLabels.map((label, index) => {
      const labelDataMap = new Map();
      data.forEach(item => {
          if (item[labelField] === label) {
              const dateKey = typeof item[dateField] === 'string' && item[dateField].includes(' ') ? item[dateField].split(' ')[0] : item[dateField];
              // Aggregate if multiple values for same label/date (e.g., sum)
              labelDataMap.set(dateKey, (labelDataMap.get(dateKey) || 0) + parseFloat(item[valueField] || 0));
          }
      });

      const values = uniqueDates.map(date => labelDataMap.get(date) ?? null); // Use null for missing points

      return {
        label: label,
        data: values,
        backgroundColor: colors[index % colors.length], // Assign color
        borderColor: colors[index % colors.length],
        borderWidth: 1.5,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: metricConfig.fill ?? (metricConfig.chartType === 'area'), // Handle fill based on config or area type
      };
    });

    return {
      labels: uniqueDates,
      datasets
    };
  }


  /**
   * Transform multi-series data (like client distribution from columns)
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
      if (dateTime && typeof dateTime === 'string') {
        if (dateTime.includes(' ')) {
          const [date, time] = dateTime.split(' ');
          return dateField === 'hour' ? time.substring(0, 5) : date;
        }
        return dateTime;
      }
      return dateTime ?? 'Unknown Date';
    });

    // Generate colors
    const colors = Array.isArray(metricConfig.color)
      ? metricConfig.color
      : generateColorPalette(seriesKeys.length);

    // Create datasets
    const datasets = seriesKeys.map((series, index) => {
      const color = colors[index % colors.length];
      return {
        label: series,
        data: data.map(item => parseFloat(item[series] || 0)), // Default to 0 if undefined
        backgroundColor: color, // Use solid color for stacked bars usually
        borderColor: color,
        borderWidth: 1,
         // stack: 'a' // Assign to a stack group if needed for Chart.js v3+ options
      };
    });

    return { labels, datasets };
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
      return []; // Return empty array on error
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

  /**
   * Transform data with label and sublabel fields
   * @param {Array} data - Raw data
   * @param {string} labelField - Name of the primary label field
   * @param {string} subLabelField - Name of the secondary label field
   * @param {string} valueField - Name of the value field
   * @returns {Object} Data transformed for Chart.js
   */
  transformLabelSubLabelData(data, labelField, subLabelField, valueField = 'value') {
    if (!Array.isArray(data) || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Check if the data has the required fields
    if (!data[0][labelField] || !data[0][subLabelField] || !data[0][valueField]) {
      console.error('Data missing required fields for label/sublabel transformation',
        { labelField, subLabelField, valueField });
      return data;
    }

    // Identify the date field
    const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
    const dateField = dateFields.find(field => data[0][field] !== undefined);

    if (!dateField) {
      console.error('No date field found for label/sublabel transformation');
      return data;
    }

    // Group by date and sublabel
    const groupedByDate = {};

    data.forEach(item => {
      const date = item[dateField];
      const label = item[labelField];
      const sublabel = item[subLabelField];

      // Create a composite label that combines primary and secondary
      const compositeKey = `${label}-${sublabel}`;

      if (!groupedByDate[date]) {
        groupedByDate[date] = {};
      }

      groupedByDate[date][compositeKey] = parseFloat(item[valueField] || 0);
    });

    // Extract unique dates and composite labels
    const dates = Object.keys(groupedByDate).sort();
    const allLabels = [...new Set(data.map(item => `${item[labelField]}-${item[subLabelField]}`))];

    // Create a nested structure by primary label
    const labelGroups = {};
    allLabels.forEach(compositeKey => {
      const [primaryLabel, secondaryLabel] = compositeKey.split('-');

      if (!labelGroups[primaryLabel]) {
        labelGroups[primaryLabel] = [];
      }

      labelGroups[primaryLabel].push(secondaryLabel);
    });

    // Create datasets grouped by primary label
    const datasets = [];

    Object.entries(labelGroups).forEach(([primaryLabel, secondaryLabels]) => {
      secondaryLabels.forEach(secondaryLabel => {
        const compositeKey = `${primaryLabel}-${secondaryLabel}`;

        datasets.push({
          label: `${primaryLabel} ${secondaryLabel}`,
          data: dates.map(date => groupedByDate[date][compositeKey] || 0),
          // Store the primary label for filtering
          _primaryLabel: primaryLabel,
          // Store the secondary label for tooltips/legends
          _secondaryLabel: secondaryLabel
        });
      });
    });

    return {
      labels: dates,
      datasets: datasets,
      // Add a hint that this data has been processed for label/sublabel filtering
      _hasLabelSubLabelStructure: true
    };
  }
}

export default new MetricsService();