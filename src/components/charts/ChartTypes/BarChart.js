/**
 * Bar Chart implementation for ECharts
 * Location: src/components/charts/ChartTypes/BarChart.js
 * 
 * Includes time series formatting, default zoom support, and stacking capability
 */

import { BaseChart } from './BaseChart';

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
    
    const colors = this.resolveSeriesPalette(enhancedConfig, processedData.series?.length || 1, isDarkMode);
    const seriesColorsByName = (config?.seriesColorsByName && typeof config.seriesColorsByName === 'object')
      ? config.seriesColorsByName
      : null;

    const resolveSeriesColor = (seriesName, index) => {
      if (seriesColorsByName && typeof seriesName === 'string') {
        const configuredColor = seriesColorsByName[seriesName];
        if (typeof configuredColor === 'string' && configuredColor.trim()) {
          return configuredColor.trim();
        }
      }

      return colors[index];
    };

    // Check if this should be a stacked bar chart
    const isStacked = config.seriesField && Array.isArray(processedData.series) && processedData.series.length > 1;
    const isHorizontal = !!config.horizontal;

    return {
      ...this.getBaseOptions(isDarkMode),

      xAxis: isHorizontal ? {
        type: 'value',
        ...this.getAxisConfig(isDarkMode, 'value', enhancedConfig)
      } : {
        type: 'category',
        data: processedData.categories,
        ...this.getAxisConfig(isDarkMode, 'category', enhancedConfig)
      },

      yAxis: isHorizontal ? {
        type: 'category',
        data: processedData.categories,
        inverse: true,
        ...this.getAxisConfig(isDarkMode, 'category', enhancedConfig)
      } : {
        type: 'value',
        ...this.getAxisConfig(isDarkMode, 'value', enhancedConfig)
      },
      
      series: processedData.series ? 
        processedData.series.map((series, index) => ({
          name: series.name,
          type: 'bar',
          data: series.data,
          itemStyle: {
            color: resolveSeriesColor(series.name, index),
            borderRadius: 0,
            // Add opacity support - same as areaOpacity but for bars
            opacity: config.barOpacity !== undefined ? config.barOpacity : 
                     config.opacity !== undefined ? config.opacity : 1.0
          },
          barWidth: config.barWidth || 'auto',
          barMaxWidth: config.barMaxWidth || 50,
          // Enable stacking if we have multiple series
          stack: isStacked ? 'total' : undefined
        })) : [{
          type: 'bar',
          data: processedData.values,
          itemStyle: {
            color: colors[0],
            borderRadius: 0,
            // Add opacity support for single series too
            opacity: config.barOpacity !== undefined ? config.barOpacity : 
                     config.opacity !== undefined ? config.opacity : 1.0
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

    // Extract and sort categories
    const categories = this.sortCategories(
      [...new Set(data.map(item => item[actualXField]))],
      data,
      actualXField,
      actualYField,
      actualSeriesField,
      config
    );

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

  static sortCategories(categories, data, xField, yField, seriesField, config = {}) {
    if (config?.categorySort === 'absNetDesc' && seriesField) {
      const categorySums = {};
      data.forEach((item) => {
        const category = item[xField];
        const numericValue = Number.parseFloat(item[yField] || 0);
        if (!Number.isFinite(numericValue)) {
          return;
        }
        categorySums[category] = (categorySums[category] || 0) + numericValue;
      });

      return [...categories].sort((a, b) => {
        const absoluteDelta = Math.abs(categorySums[b] || 0) - Math.abs(categorySums[a] || 0);
        if (absoluteDelta !== 0) {
          return absoluteDelta;
        }
        return String(a).localeCompare(String(b));
      });
    }

    return [...categories].sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA - dateB;
      }
      return String(a).localeCompare(String(b));
    });
  }
}

export default BarChart;
