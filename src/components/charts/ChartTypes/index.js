/**
 * Chart Types Index - The "ECharts Chart Types Export" file
 * Location: src/components/charts/ChartTypes/index.js
 * * This file exports all available chart types and provides utilities
 * for the ECharts integration system.
 */

// Import all chart type components
import { LineChart } from './LineChart';
import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { SankeyChart } from './SankeyChart';
import { RadarChart } from './RadarChart';
import { BoxplotChart } from './BoxplotChart';
import { HeatmapChart } from './HeatmapChart';
import { GraphChart } from './GraphChart';
import { SunburstChart } from './SunburstChart';

// Export individual chart components
export {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  SankeyChart,
  RadarChart,
  BoxplotChart,
  HeatmapChart,
  GraphChart,
  SunburstChart
};

/**
 * Chart types registry
 * Maps chart type strings to their corresponding chart components
 */
export const CHART_TYPES = {
  // Basic chart types
  line: LineChart,
  area: AreaChart,
  bar: BarChart,
  pie: PieChart,
  
  // Advanced chart types
  sankey: SankeyChart,
  radar: RadarChart,
  boxplot: BoxplotChart,
  heatmap: HeatmapChart,
  graph: GraphChart,
  sunburst: SunburstChart,
  
  // Aliases for compatibility with existing configs
  'line-chart': LineChart,
  'area-chart': AreaChart,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'radar-chart': RadarChart,
  'sankey-diagram': SankeyChart,
  'sankey-chart': SankeyChart,
  'network': GraphChart,
  'network-graph': GraphChart,
  'graph-chart': GraphChart,
  'hierarchy': SunburstChart,
  'sunburst-chart': SunburstChart,
  'boxplot-chart': BoxplotChart,
  'heatmap-chart': HeatmapChart,
  
  // Legacy D3 compatibility mappings
  'd3Line': LineChart,
  'd3StackedArea': AreaChart,
  'd3Bar': BarChart,
  'd3HorizontalBar': BarChart,
  'd3Pie': PieChart,
  'd3Sankey': SankeyChart,
  'd3Radar': RadarChart,
  'd3Network': GraphChart,
  'd3Sunburst': SunburstChart
};

/**
 * Get chart component by type
 * @param {string} chartType - Chart type identifier
 * @returns {Object|null} Chart component class or null if not found
 */
export const getChartComponent = (chartType) => {
  if (!chartType) {
    console.warn('getChartComponent: No chart type provided');
    return null;
  }

  const normalizedType = chartType.toLowerCase().trim();
  const component = CHART_TYPES[normalizedType];
  
  if (!component) {
    console.warn(`getChartComponent: Unsupported chart type "${chartType}"`);
    // Return a fallback to LineChart for unknown types
    return LineChart;
  }
  
  return component;
};

/**
 * Get all available chart types
 * @returns {Array<string>} Array of chart type names
 */
export const getAvailableChartTypes = () => {
  return Object.keys(CHART_TYPES);
};

/**
 * Check if a chart type is supported
 * @param {string} chartType - Chart type identifier
 * @returns {boolean} Whether the chart type is supported
 */
export const isChartTypeSupported = (chartType) => {
  if (!chartType) return false;
  const normalizedType = chartType.toLowerCase().trim();
  return normalizedType in CHART_TYPES;
};

/**
 * Get chart type metadata
 * @param {string} chartType - Chart type identifier
 * @returns {Object} Chart type metadata
 */
export const getChartTypeInfo = (chartType) => {
  const component = getChartComponent(chartType);
  
  if (!component) {
    return {
      type: chartType,
      supported: false,
      category: 'unknown'
    };
  }

  // Determine category
  let category = 'basic';
  const chartTypeLower = chartType.toLowerCase();
  if (['sankey', 'radar', 'boxplot', 'heatmap', 'graph', 'sunburst'].some(type => chartTypeLower.includes(type))) {
    category = 'advanced';
  }

  return {
    type: chartType,
    supported: true,
    category,
    component
  };
};

/**
 * Chart configuration validator
 * @param {Object} config - Chart configuration
 * @param {string} chartType - Chart type
 * @returns {Object} Validation result
 */
export const validateChartConfig = (config, chartType) => {
  const errors = [];
  const warnings = [];

  if (!config) {
    errors.push('Chart configuration is required');
    return { valid: false, errors, warnings };
  }

  // Type-specific validation
  switch (chartType?.toLowerCase()) {
    case 'line':
    case 'area':
      if (!config.xField && !config.dateField) {
        warnings.push('xField or dateField should be specified for time series charts');
      }
      if (!config.yField && !config.valueField) {
        warnings.push('yField or valueField should be specified');
      }
      break;
      
    case 'pie':
      if (!config.nameField) {
        warnings.push('nameField should be specified for pie charts');
      }
      if (!config.valueField) {
        warnings.push('valueField should be specified for pie charts');
      }
      break;
      
    case 'sankey':
      if (!config.sourceField || !config.targetField) {
        errors.push('sourceField and targetField are required for sankey charts');
      }
      break;
    default:
      // No specific validation for other types yet
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Default export for convenience
const chartTypesUtils = {
  getChartComponent,
  getAvailableChartTypes,
  isChartTypeSupported,
  getChartTypeInfo,
  validateChartConfig,
  CHART_TYPES
};

export default chartTypesUtils;