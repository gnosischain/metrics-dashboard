/**
 * Bar Chart implementation for ECharts
 * Location: src/components/charts/ChartTypes/BarChart.js
 * 
 * Includes time series formatting and default zoom support
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette } from '../../../utils';

export class BarChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    
    // Analyze time granularity for smart formatting
    const timeAnalysis = BaseChart.analyzeTimeGranularity(processedData.categories);
    
    // Add time context to config
    const enhancedConfig = {
      ...config,
      timeContext: timeAnalysis
    };
    
    const colors = generateColorPalette(processedData.series?.length || 1, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      xAxis: {
        type: 'category',
        data: processedData.categories,
        ...this.getAxisConfig(isDarkMode, 'category', enhancedConfig)
      },
      
      yAxis: {
        type: 'value',
        ...this.getAxisConfig(isDarkMode, 'value', enhancedConfig)
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
        ...this.getTooltipConfig({ ...enhancedConfig, isDarkMode }),
        trigger: 'axis',
        formatter: BaseChart.createTimeSeriesAwareTooltipFormatter(enhancedConfig)
      },
      
      legend: this.getLegendConfig(isDarkMode, processedData.series?.length || 1, enhancedConfig),
      
      grid: this.getGridConfig(enhancedConfig),
      
      // Add default zoom configuration
      ...this.getDataZoomConfig(enhancedConfig)
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

    // Use the same field detection logic as LineChart
    const firstItem = data[0] || {};
    const availableFields = Object.keys(firstItem);

    const actualXField = this.findBestField(availableFields, xField, ['date', 'time', 'timestamp', 'category', 'x']);
    const actualYField = this.findBestField(availableFields, yField, ['value', 'y', 'count', 'amount']);
    const actualSeriesField = seriesField ? this.findBestField(availableFields, seriesField, ['label', 'series', 'category', 'group']) : null;

    // Extract and sort categories (handle dates if present)
    const categories = [...new Set(data.map(item => item[actualXField]))]
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA - dateB;
        }
        return String(a).localeCompare(String(b));
      });

    if (actualSeriesField) {
      // Multi-series bar chart
      const seriesNames = [...new Set(data.map(item => item[actualSeriesField]))].filter(Boolean);
      
      return {
        categories,
        series: seriesNames.map(seriesName => ({
          name: seriesName,
          data: categories.map(category => {
            const item = data.find(d => 
              d[actualXField] === category && d[actualSeriesField] === seriesName
            );
            return item ? parseFloat(item[actualYField] || 0) : 0;
          })
        }))
      };
    } else {
      // Single series bar chart
      const dataMap = {};
      data.forEach(item => {
        dataMap[item[actualXField]] = item[actualYField];
      });

      return {
        categories,
        values: categories.map(category => {
          const rawValue = dataMap[category];
          return rawValue !== undefined ? parseFloat(rawValue || 0) : 0;
        })
      };
    }
  }

  // Inherit field detection from LineChart
  static findBestField(availableFields, preferredField, fallbackFields) {
    if (availableFields.includes(preferredField)) {
      return preferredField;
    }
    for (const fallback of fallbackFields) {
      if (availableFields.includes(fallback)) {
        return fallback;
      }
    }
    return preferredField;
  }
}

export default BarChart;