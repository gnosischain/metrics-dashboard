/**
 * Area Chart implementation for ECharts
 * Inherits all functionality from LineChart including time series formatting
 */

import { LineChart } from './LineChart';

export class AreaChart extends LineChart {
  static getOptions(data, config, isDarkMode) {
    // Get the base line chart options
    const lineOptions = super.getOptions(data, config, isDarkMode);
    
    // If this is an empty chart, return early
    if (lineOptions.title) return lineOptions;
    
    // Convert line series to area series
    return {
      ...lineOptions,
      series: lineOptions.series.map(series => ({
        ...series,
        type: 'line', // Keep as line type but add areaStyle
        areaStyle: {
          opacity: config.areaOpacity || 0.3
        },
        // Ensure smooth curves for better area appearance
        smooth: config.smooth !== false
      }))
    };
  }

  // All other methods are inherited from LineChart:
  // - processData (handles multi-series and time series data)
  // - validateData 
  // - findBestField
  // - Time series formatting through BaseChart
  // - Default zoom support
}

export default AreaChart;