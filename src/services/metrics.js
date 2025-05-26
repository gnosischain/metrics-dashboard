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
      valueField: 'value',
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
   * Transform data for Sankey diagrams
   * @param {Array} data - Raw data with source, target, value columns
   * @param {Object} metricConfig - Metric configuration
   * @returns {Object} - {nodes: [], links: []} format for D3 Sankey
   */
  transformSankeyData(data, metricConfig) {
    console.log('=== SANKEY TRANSFORM DEBUG ===');
    console.log('Raw data received:', data);
    console.log('Metric config:', metricConfig);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('transformSankeyData: Empty or invalid data');
      return { nodes: [], links: [] };
    }

    // Extract source and target field names from config or use defaults
    const sourceField = metricConfig.sourceField || 'source';
    const targetField = metricConfig.targetField || 'target';
    const valueField = metricConfig.valueField || 'total_value';

    console.log('Field mapping:', { sourceField, targetField, valueField });

    // Validate that required fields exist
    const firstItem = data[0];
    console.log('First data item:', firstItem);
    console.log('Has source field?', firstItem[sourceField] !== undefined);
    console.log('Has target field?', firstItem[targetField] !== undefined);
    console.log('Has value field?', firstItem[valueField] !== undefined);

    if (!firstItem[sourceField] || !firstItem[targetField] || firstItem[valueField] === undefined) {
      console.error('Sankey data missing required fields:', { sourceField, targetField, valueField });
      console.error('Available fields:', Object.keys(firstItem));
      return { nodes: [], links: [] };
    }

    // Extract unique nodes from sources and targets
    const nodeSet = new Set();
    data.forEach(d => {
      console.log(`Processing: ${d[sourceField]} -> ${d[targetField]} (${d[valueField]})`);
      nodeSet.add(d[sourceField]);
      nodeSet.add(d[targetField]);
    });

    // Create nodes array
    const nodes = Array.from(nodeSet).map(name => ({ 
      id: name, 
      name: name 
    }));

    // Create links array
    const links = data.map(d => ({
      source: d[sourceField],
      target: d[targetField],
      value: parseFloat(d[valueField] || 0)
    })).filter(link => link.value > 0);

    const result = { nodes, links };
    console.log('Sankey transformation result:', result);
    console.log(`Generated ${nodes.length} nodes and ${links.length} links`);
    console.log('=== END SANKEY TRANSFORM DEBUG ===');

    return result;
  }

  /**
  * Transform data for Network graphs with enhanced temporal support
  * @param {Array} data - Raw data with node and link information
  * @param {Object} metricConfig - Metric configuration
  * @returns {Object} - {nodes: [], links: []} format for D3 Network
  */
  transformNetworkData(data, metricConfig) {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('transformNetworkData: Empty or invalid data');
      return { nodes: [], links: [] };
    }

    console.log('Transforming Network data with temporal features:', data.slice(0, 3));

    // Configuration for field mapping
    const sourceIdField = metricConfig.sourceIdField || 'source_id';
    const sourceNameField = metricConfig.sourceNameField || 'source_name';
    const sourceGroupField = metricConfig.sourceGroupField || 'source_group';
    const targetIdField = metricConfig.targetIdField || 'target_id';
    const targetNameField = metricConfig.targetNameField || 'target_name';
    const targetGroupField = metricConfig.targetGroupField || 'target_group';
    const valueField = metricConfig.valueField || 'value';
    const dateField = metricConfig.dateField || 'date'; // NEW: For temporal features

    // Extract unique nodes with aggregated values
    const nodeMap = new Map();
    const nodeValueMap = new Map(); // Track total values per node
    
    data.forEach(d => {
      const sourceId = d[sourceIdField];
      const targetId = d[targetIdField];
      const value = parseFloat(d[valueField] || 0);
      
      // Add source node
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, {
          id: sourceId,
          name: d[sourceNameField] || sourceId,
          group: d[sourceGroupField] || 'default',
          size: metricConfig.defaultNodeSize || 8,
          type: 'source'
        });
        nodeValueMap.set(sourceId, 0);
      }
      
      // Add target node
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, {
          id: targetId,
          name: d[targetNameField] || targetId,
          group: d[targetGroupField] || 'default',
          size: metricConfig.defaultNodeSize || 8,
          type: 'target'
        });
        nodeValueMap.set(targetId, 0);
      }
      
      // Accumulate values for node sizing
      nodeValueMap.set(sourceId, nodeValueMap.get(sourceId) + value);
      nodeValueMap.set(targetId, nodeValueMap.get(targetId) + value);
    });

    // Convert to arrays
    const nodes = Array.from(nodeMap.values());
    
    // Create links with temporal information
    const links = data.map(d => {
      const link = {
        source: d[sourceIdField],
        target: d[targetIdField],
        value: parseFloat(d[valueField] || 1)
      };
      
      // Add date information if available
      if (d[dateField]) {
        link.date = d[dateField];
      }
      
      // Add any additional fields that might be useful
      if (d.token_address) {
        link.token = d.token_address;
      }
      
      return link;
    }).filter(link => link.value > 0);

    // Calculate node sizes based on total transaction volume if enabled
    if (metricConfig.calculateNodeSize) {
      const maxValue = Math.max(...Array.from(nodeValueMap.values()));
      const minSize = 6;
      const maxSize = 25;
      
      nodes.forEach(node => {
        const nodeValue = nodeValueMap.get(node.id) || 0;
        // Logarithmic scaling for better visual distribution
        const normalizedValue = nodeValue > 0 ? Math.log(nodeValue + 1) / Math.log(maxValue + 1) : 0;
        node.size = minSize + (normalizedValue * (maxSize - minSize));
        node.totalValue = nodeValue; // Store for tooltip display
      });
    }

    // Sort links by date if available (for potential animation features)
    if (links.some(l => l.date)) {
      links.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
    }

    // Add network statistics
    const networkStats = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      totalVolume: links.reduce((sum, l) => sum + l.value, 0),
      uniqueTokens: [...new Set(nodes.map(n => n.group))].length,
      dateRange: null
    };

    // Calculate date range if temporal data exists
    const datesWithData = links.filter(l => l.date).map(l => new Date(l.date));
    if (datesWithData.length > 0) {
      networkStats.dateRange = {
        min: new Date(Math.min(...datesWithData)),
        max: new Date(Math.max(...datesWithData))
      };
    }

    console.log(`Network transformation complete: ${nodes.length} nodes, ${links.length} links`);
    console.log('Network stats:', networkStats);

    return { 
      nodes, 
      links, 
      stats: networkStats 
    };
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

    const labelField = metricConfig.labelField || Object.keys(data[0]).find(key => typeof data[0][key] === 'string' && key !== 'date');
    const valueField = metricConfig.valueField || 'value';

    if (!labelField || !data[0][labelField] === undefined) {
      console.warn(`No label field found or available in data for horizontal bar chart: ${metricConfig.id}`);
      return data.map(item => ({ category: 'Unknown', value: parseFloat(item[valueField] || 0) }));
    }

    const sortedData = [...data].sort((a, b) => {
      const valueA = parseFloat(a[valueField] || 0);
      const valueB = parseFloat(b[valueField] || 0);
      return valueB - valueA;
    });

    return sortedData.map(item => ({
      category: item[labelField],
      value: parseFloat(item[valueField] || 0)
    }));
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
    const isTimeSeries = metricConfig.isTimeSeries;

    // Determine the date field
    const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
    const dateField = dateFields.find(field => data[0][field] !== undefined);

    if (!dateField) {
      console.error('No date field found in data for stacked area chart');
      return { labels: [], datasets: [] };
    }

    console.log(`Transforming stacked area data with labelField: ${labelField}, dateField: ${dateField}, valueField: ${valueField}, isTimeSeries: ${isTimeSeries}`);
    console.log(`Sample raw data:`, data.slice(0, 3));

    // Extract unique dates and labels
    const uniqueDates = [...new Set(data.map(item => {
      const date = item[dateField];
      return typeof date === 'string' && date.includes(' ') ? date.split(' ')[0] : date;
    }))].sort();

    const uniqueLabels = [...new Set(data.map(item => item[labelField]))].filter(Boolean).sort();

    console.log(`Found ${uniqueDates.length} unique dates and ${uniqueLabels.length} unique labels`);
    console.log(`Unique dates sample:`, uniqueDates.slice(0, 5));
    console.log(`Unique labels:`, uniqueLabels);

    // Generate colors for datasets
    const colors = metricConfig.color 
      ? Array(uniqueLabels.length).fill(metricConfig.color)
      : generateColorPalette(uniqueLabels.length);

    // Create a 2D map of [date][label] -> value
    const dataMap = {};
    uniqueDates.forEach(date => {
      dataMap[date] = {};
      uniqueLabels.forEach(label => {
        dataMap[date][label] = 0;
      });
    });

    // Fill in the actual values
    data.forEach(item => {
      const date = typeof item[dateField] === 'string' && item[dateField].includes(' ')
        ? item[dateField].split(' ')[0]
        : item[dateField];
      
      const label = item[labelField];
      const value = parseFloat(item[valueField] || 0);

      if (dataMap[date] && label && !isNaN(value)) {
        dataMap[date][label] = (dataMap[date][label] || 0) + value;
      }
    });

    // Debug: Check if we have data in our map
    const sampleDate = uniqueDates[0];
    console.log(`Sample data for date ${sampleDate}:`, dataMap[sampleDate]);

    // Convert to Chart.js datasets format
    const datasets = uniqueLabels.map((label, index) => {
      const dataPoints = uniqueDates.map(date => dataMap[date][label] || 0);

      const dataset = {
        label,
        data: dataPoints,
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 1.5,
        fill: true,
      };

      return dataset;
    });

    console.log(`Created ${datasets.length} datasets with ${uniqueDates.length} points each`);
    console.log(`Sample dataset:`, {
      label: datasets[0]?.label,
      dataLength: datasets[0]?.data?.length,
      sampleData: datasets[0]?.data?.slice(0, 5)
    });

    const result = {
      labels: uniqueDates,
      datasets
    };

    console.log(`Final stacked area result:`, {
      labelsCount: result.labels.length,
      datasetsCount: result.datasets.length,
      sampleLabels: result.labels.slice(0, 5)
    });

    return result;
  }

  /**
   * Transform raw data into a format usable by charts
   * @param {Array} data - Raw data from API
   * @param {string} metricId - ID of the metric
   * @returns {Array|Object} - Transformed data for charts
   */
  transformData(data, metricId) {
    const metricConfig = this.getMetricConfig(metricId);
    
    console.log(`MetricsService[${metricId}]: transformData called with chartType: ${metricConfig.chartType}`);

    // Handle table charts FIRST - pass data through without transformation
    if (metricConfig.chartType === 'table') {
      console.log(`MetricsService[${metricId}]: Passing table data through without transformation`);
      
      if (!Array.isArray(data)) {
        console.warn(`MetricsService[${metricId}]: Expected array data for table, got:`, typeof data);
        return [];
      }
      
      console.log(`MetricsService[${metricId}]: Table data ready - ${data.length} rows`);
      return data;
    }

    // Handle D3 chart types
    if (metricConfig.chartType === 'sankey') {
      console.log(`MetricsService[${metricId}]: Transforming for Sankey chart`);
      return this.transformSankeyData(data, metricConfig);
    }

    if (metricConfig.chartType === 'network') {
      console.log(`MetricsService[${metricId}]: Transforming for Network chart`);
      return this.transformNetworkData(data, metricConfig);
    }

    // Determine if this is a stacked area chart
    const isStackedArea = metricConfig.chartType === 'area' && 
                          (metricConfig.stackedArea === true || metricConfig.stacked === true);

    // If EnhancedChart is meant to handle filtering and sub-label stacking, pass raw data
    if (metricConfig.enableFiltering && metricConfig.labelField && metricConfig.subLabelField) {
        console.log(`MetricsService[${metricId}]: Passing raw data to EnhancedChart (filtering enabled with subLabelField).`);

        // Basic validation of raw data structure
        if (!Array.isArray(data)) {
            console.error(`MetricsService[${metricId}]: Expected raw data to be an array, but got:`, typeof data);
            return [];
        }
        if (data.length > 0) {
            const firstRow = data[0];
            const requiredFields = [metricConfig.labelField, metricConfig.subLabelField, metricConfig.valueField || 'value'];
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
        return data;
    }

    // Special case for stacked area charts (without EnhancedChart filtering)
    if (isStackedArea && metricConfig.labelField) {
        console.log(`MetricsService[${metricId}]: Applying stacked area chart transformation for ${metricId}.`);
        return this.transformStackedAreaData(data, metricConfig);
    }

    // Standard Transformation Logic
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
        console.log(`MetricsService[${metricId}]: Passing data as-is for simple chart type ${metricConfig.chartType}.`);
        result = data;
    } else {
        // Handle Time Series Charts (Line, Bar, Stacked Bar without filtering handled above)
        const dateFields = ['date', 'hour', 'timestamp', 'time', 'day'];
        const dateField = dateFields.find(field => firstRow[field] !== undefined) || '';

        if (!dateField) {
            console.warn(`MetricsService[${metricId}]: No date field found for time series transformation.`);
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
                      result = data;
                }
            }
        }
    }

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
              labelDataMap.set(dateKey, (labelDataMap.get(dateKey) || 0) + parseFloat(item[valueField] || 0));
          }
      });

      const values = uniqueDates.map(date => labelDataMap.get(date) ?? null);

      return {
        label: label,
        data: values,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1.5,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: metricConfig.fill ?? (metricConfig.chartType === 'area'),
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
        data: data.map(item => parseFloat(item[series] || 0)),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
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
  transformSingleValueData(data) {
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }

    if (data && typeof data === 'object' && data.value !== undefined) {
      return [data];
    }

    if (typeof data === 'number') {
      return [{ value: data }];
    }

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
          _primaryLabel: primaryLabel,
          _secondaryLabel: secondaryLabel
        });
      });
    });

    return {
      labels: dates,
      datasets: datasets,
      _hasLabelSubLabelStructure: true
    };
  }
}

export default new MetricsService();