/**
 * Bar Chart implementation for ECharts
 * Location: src/components/charts/ChartTypes/BarChart.js
 * 
 * FIXED: Updated import paths to use centralized utils
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class BarChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = generateColorPalette(processedData.series?.length || 1, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      xAxis: {
        type: 'category',
        data: processedData.categories,
        ...this.getAxisConfig(isDarkMode, 'category', config)
      },
      
      yAxis: {
        type: 'value',
        ...this.getAxisConfig(isDarkMode, 'value', config)
      },
      
      series: processedData.series ? processedData.series.map((series, index) => ({
        name: series.name,
        type: 'bar',
        data: series.data,
        itemStyle: {
          color: colors[index],
          borderRadius: config.borderRadius || [2, 2, 0, 0]
        },
        barWidth: config.barWidth || 'auto',
        barMaxWidth: config.barMaxWidth || 50
      })) : [{
        type: 'bar',
        data: processedData.values,
        itemStyle: {
          color: colors[0],
          borderRadius: config.borderRadius || [2, 2, 0, 0]
        },
        barWidth: config.barWidth || 'auto',
        barMaxWidth: config.barMaxWidth || 50
      }],
      
      tooltip: {
        ...this.getTooltipConfig({ ...config, isDarkMode }),
        trigger: 'axis',
        formatter: (params) => {
          let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach(param => {
            const seriesName = param.seriesName || 'Value';
            tooltip += `${seriesName}: <strong>${formatValue(param.value, config.format)}</strong><br/>`;
          });
          return tooltip;
        }
      },
      
      legend: this.getLegendConfig(isDarkMode, processedData.series?.length || 1, config),
      
      grid: this.getGridConfig(config)
    };
  }

  static processData(data, config) {
    const {
      xField = 'category',
      yField = 'value',
      seriesField = null
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Bar chart data must be an array');
    }

    const categories = [...new Set(data.map(item => item[xField]))];

    if (seriesField) {
      // Multi-series bar chart
      const seriesNames = [...new Set(data.map(item => item[seriesField]))].filter(Boolean);
      
      return {
        categories,
        series: seriesNames.map(seriesName => ({
          name: seriesName,
          data: categories.map(category => {
            const item = data.find(d => 
              d[xField] === category && d[seriesField] === seriesName
            );
            return item ? parseFloat(item[yField] || 0) : 0;
          })
        }))
      };
    } else {
      // Single series bar chart
      return {
        categories,
        values: data.map(item => parseFloat(item[yField] || 0))
      };
    }
  }
}

export default BarChart;