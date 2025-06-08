/**
 * Area Chart implementation for ECharts
 * Inherits all functionality from LineChart including time series formatting
 * Uses UNIVERSAL spacing from BaseChart - no custom grid overrides
 */

import { LineChart } from './LineChart';

export class AreaChart extends LineChart {
  static getOptions(data, config, isDarkMode) {
    // Get the base line chart options
    const lineOptions = super.getOptions(data, config, isDarkMode);
    
    // If this is an empty chart, return early
    if (lineOptions.title) return lineOptions;
    
    // Check if this should be a stacked area chart
    const isStacked = config.seriesField && Array.isArray(lineOptions.series) && lineOptions.series.length > 1;
    
    // Convert line series to area series
    return {
      ...lineOptions,
      series: lineOptions.series.map(series => ({
        ...series,
        type: 'line', // Keep as line type but add areaStyle
        areaStyle: {
          opacity: config.areaOpacity || 0.3
        },
        // Enable stacking if we have multiple series
        stack: isStacked ? 'total' : undefined,
        // Ensure smooth curves for better area appearance
        smooth: config.smooth !== false
      }))
      // NO GRID OVERRIDES - Use universal spacing from BaseChart
      // This ensures area charts have the same watermark/zoom spacing as line charts
    };
  }

  // All other methods are inherited from LineChart:
  // - processData (handles multi-series and time series data)
  // - validateData 
  // - findBestField
  // - Time series formatting through BaseChart
  // - Default zoom support
  // - UNIVERSAL grid configuration from BaseChart
}

export default AreaChart;