/**
 * Charts Index
 * Location: src/components/charts/index.js
 * 
 * This file exports all chart components from the ChartTypes directory
 * FIXED: Simplified structure with proper re-exports
 */

// Re-export everything from ChartTypes
export * from './ChartTypes';

// Explicitly export EChartsContainer for clarity
export { default as EChartsContainer } from './ChartTypes/EChartsContainer.jsx';

// Export utility functions from ChartTypes
export { 
  getChartComponent, 
  getAvailableChartTypes, 
  isChartTypeSupported,
  getChartTypeInfo,
  validateChartConfig,
  CHART_TYPES 
} from './ChartTypes';

// Default export EChartsContainer for convenience
export { default } from './ChartTypes/EChartsContainer.jsx';