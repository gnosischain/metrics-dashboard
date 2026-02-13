/**
 * Chart Types Index - The "ECharts Chart Types Export" file
 * Location: src/components/charts/ChartTypes/index.js
 * 
 * This file exports all available chart types and provides utilities
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
import { Geo2DMapChart } from './Geo2DMapChart';
import { WordCloudChart } from './WordCloudChart'; 

// Import QuantileBandsChart - make sure this file exists
// If this import fails, the chart type won't be registered
import { QuantileBandsChart } from './QuantileBandsChart';

// Registry and utilities (kept separate to avoid circular deps with EChartsContainer)
export {
  CHART_TYPES,
  getChartComponent,
  getAvailableChartTypes,
  isChartTypeSupported,
  getChartTypeInfo,
  validateChartConfig
} from './chartRegistry';


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
  SunburstChart,
  Geo2DMapChart,
  QuantileBandsChart,
  WordCloudChart
};

// Export the default EChartsContainer
export { default as EChartsContainer } from './EChartsContainer';
