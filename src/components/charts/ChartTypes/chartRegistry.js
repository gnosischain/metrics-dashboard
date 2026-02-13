/**
 * Chart Registry
 * Centralized chart type mapping and lookup helpers.
 * 
 * NOTE: This file intentionally does NOT import EChartsContainer to avoid
 * circular dependencies with ChartTypes index and the container itself.
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
import { Geo2DMapChart } from './Geo2DMapChart';
import { WordCloudChart } from './WordCloudChart';
import { QuantileBandsChart } from './QuantileBandsChart';

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
  map: Geo2DMapChart, // Use standard 2D map
  'geo-map': Geo2DMapChart,
  'network-map': Geo2DMapChart,
  
  // Quantile bands chart - all lowercase keys
  quantilebands: QuantileBandsChart,
  'quantile-bands': QuantileBandsChart,
  
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
  'quantile-bands-chart': QuantileBandsChart,

  wordcloud: WordCloudChart,
  'word-cloud': WordCloudChart,
  'wordcloud-chart': WordCloudChart,
  'word-cloud-chart': WordCloudChart,
};

/**
 * Get a chart component by type string
 * @param {string} type - The chart type identifier
 * @returns {Object|null} The chart component class or null if not found
 */
export function getChartComponent(type) {
  if (!type) {
    console.warn('getChartComponent: No type provided');
    return null;
  }
  
  // Normalize the type string (lowercase, trim)
  const normalizedType = type.toLowerCase().trim();
  
  console.log('getChartComponent: Looking for type:', type, 'normalized:', normalizedType);
  
  // Try exact match first
  if (CHART_TYPES[normalizedType]) {
    console.log('getChartComponent: Found exact match for:', normalizedType);
    return CHART_TYPES[normalizedType];
  }
  
  // Try camelCase version
  const camelCase = normalizedType.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  if (CHART_TYPES[camelCase]) {
    console.log('getChartComponent: Found camelCase match for:', camelCase);
    return CHART_TYPES[camelCase];
  }
  
  // Try without 'Chart' suffix
  const withoutChart = normalizedType.replace(/chart$/i, '').trim();
  if (CHART_TYPES[withoutChart]) {
    console.log('getChartComponent: Found match without chart suffix:', withoutChart);
    return CHART_TYPES[withoutChart];
  }
  
  // Try with '-chart' suffix
  const withDashChart = `${withoutChart}-chart`;
  if (CHART_TYPES[withDashChart]) {
    console.log('getChartComponent: Found match with -chart suffix:', withDashChart);
    return CHART_TYPES[withDashChart];
  }
  
  console.warn(`getChartComponent: Unknown chart type: ${type}. Available types:`, Object.keys(CHART_TYPES));
  return null;
}

/**
 * Get list of available chart types
 * @returns {string[]} Array of available chart type identifiers
 */
export function getAvailableChartTypes() {
  // Return unique base types (without aliases)
  return [
    'line',
    'area', 
    'bar',
    'pie',
    'sankey',
    'radar',
    'boxplot',
    'heatmap',
    'graph',
    'sunburst',
    'map',
    'quantileBands',
    'wordcloud'
  ];
}

/**
 * Check if a chart type is supported
 * @param {string} type - The chart type to check
 * @returns {boolean} True if the chart type is supported
 */
export function isChartTypeSupported(type) {
  return getChartComponent(type) !== null;
}

/**
 * Get chart type information
 * @param {string} type - The chart type
 * @returns {Object} Information about the chart type
 */
export function getChartTypeInfo(type) {
  const component = getChartComponent(type);
  if (!component) {
    return null;
  }
  
  return {
    type: type,
    component: component,
    name: component.name || type,
    // Add more metadata as needed
  };
}

/**
 * Validate chart configuration
 * @param {Object} config - The chart configuration object
 * @returns {Object} Validation result with { valid: boolean, errors: string[] }
 */
export function validateChartConfig(config) {
  const errors = [];
  
  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }
  
  if (!config.chartType) {
    errors.push('Chart type is required');
  } else if (!isChartTypeSupported(config.chartType)) {
    errors.push(`Unsupported chart type: ${config.chartType}`);
  }
  
  // Add more validation as needed
  
  return {
    valid: errors.length === 0,
    errors
  };
}
