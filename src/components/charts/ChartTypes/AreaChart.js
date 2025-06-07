/**
 * Area Chart implementation for ECharts
 */

import { LineChart } from './LineChart';

export class AreaChart extends LineChart {
  static getOptions(data, config, isDarkMode) {
    const lineOptions = super.getOptions(data, config, isDarkMode);
    
    // If empty data, return early
    if (lineOptions.title) return lineOptions;
    
    return {
      ...lineOptions,
      series: lineOptions.series.map(series => ({
        ...series,
        areaStyle: {
          opacity: config.areaOpacity || 0.3
        }
      }))
    };
  }
}

export default AreaChart;