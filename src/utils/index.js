/**
 * Utils Index
 * Location: src/utils/index.js
 * 
 * Centralized export for all utility functions
 * Makes imports cleaner throughout the application
 */

// Color utilities
export * from './colors';

// Formatter utilities  
export * from './formatters';
export { default as formatters } from './formatters';

// Date utilities
export * from './dates';

// ECharts specific utilities - Use explicit exports to avoid conflicts
export { 
  formatValue as echartFormatValue,
  determineLegendPosition,
  generateGridConfig,
  generateAxisConfig,
  analyzeData,
  suggestChartType,
  validateDataForChartType
} from './echarts/chartUtils';

export * from './echarts/chartConfigs';
export * from './echarts/themeConfigs';
export * from './echarts/dataTransforms';

export { 
  formatValue as echartsFormatValue,
  createTooltipFormatter,
  createAxisFormatter
} from './echarts/formatters';

// Configuration utilities
export * from './config';
export * from './dashboardConfig';
export * from './dashboardPalettes';

// Other utilities
export * from './gridLayoutManager';

// Commonly used functions for quick access
export { generateColorPalette, hexToRgba } from './colors';
export { formatValue, formatNumber, formatBytes, formatPercentage } from './formatters';
export { formatDate, getDateRange, getLastUpdateTime } from './dates';
