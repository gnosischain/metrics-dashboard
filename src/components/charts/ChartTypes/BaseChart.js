/**
 * Base chart class with common functionality for all ECharts components
 * Location: src/components/charts/ChartTypes/BaseChart.js
 * * FIXED: The getAxisConfig function was incorrectly spreading the entire metric
 * configuration object into the axis options, causing potential conflicts with
 * ECharts' internal properties. It's now fixed to only apply intentional,
 * nested axis configurations (e.g., config.xAxis, config.yAxis). Also updated
 * grid and zoom logic to use the 'enableZoom' property consistently.
 */

import { formatValue } from '../../../utils';

export class BaseChart {
  static getBaseOptions(isDarkMode) {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: isDarkMode ? '#e5e7eb' : '#374151',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      animation: true,
      animationDuration: 750,
      animationEasing: 'cubicOut'
    };
  }

  static getAxisConfig(isDarkMode, type = 'category', config = {}) {
    const baseConfig = {
      axisLine: {
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDarkMode ? '#9ca3af' : '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: isDarkMode ? '#374151' : '#f3f4f6',
          type: 'dashed'
        }
      }
    };

    if (type === 'value') {
      baseConfig.axisLabel.formatter = (value) => formatValue(value, config.format);
    }

    // FIXED: Only look for and apply intentional axis overrides from the metric config,
    // instead of spreading the entire config object.
    const axisOverrides = (type === 'value') ? config.yAxis : config.xAxis;

    return {
      ...baseConfig,
      ...(axisOverrides || {}) // Safely apply overrides if they exist
    };
  }

  static getGridConfig(config = {}) {
    return {
      left: '3%',
      right: '4%',
      // FIXED: Check for enableZoom consistently for bottom padding.
      bottom: config.dataZoom || config.enableZoom ? '15%' : '3%',
      containLabel: true,
      ...config.grid
    };
  }

  static getLegendConfig(isDarkMode, seriesCount, config = {}) {
    return {
      show: seriesCount > 1,
      type: 'scroll',
      orient: 'horizontal',
      top: 0,
      textStyle: {
        color: isDarkMode ? '#e5e7eb' : '#374151'
      },
      ...config.legend
    };
  }

  static getTooltipConfig(config = {}) {
    return {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: config.isDarkMode ? '#1f2937' : '#ffffff',
      borderColor: config.isDarkMode ? '#374151' : '#e5e7eb',
      textStyle: {
        color: config.isDarkMode ? '#e5e7eb' : '#374151'
      },
      ...config.tooltip
    };
  }

  static getDataZoomConfig(config = {}) {
    // FIXED: Check for both legacy 'zoom' and new 'enableZoom' property
    if (!config.dataZoom && !config.enableZoom) return {};
    
    return {
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
          filterMode: 'filter'
        },
        {
          type: 'slider',
          xAxisIndex: [0],
          filterMode: 'filter',
          bottom: 10
        }
      ]
    };
  }

  static processData(data, config) {
    // Override in subclasses
    return data;
  }

  static getEmptyChartOptions(isDarkMode) {
    return {
      title: {
        text: 'No data available',
        left: 'center',
        top: 'middle',
        textStyle: { 
          color: isDarkMode ? '#9ca3af' : '#6b7280', 
          fontSize: 14 
        }
      },
      backgroundColor: 'transparent'
    };
  }

  static validateData(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return false;
    }
    return true;
  }

  // Helper method for consistent color application
  static applyColors(series, colors, isDarkMode) {
    return series.map((item, index) => ({
      ...item,
      itemStyle: {
        color: colors[index % colors.length],
        ...item.itemStyle
      }
    }));
  }

  // Helper method for responsive sizing
  static getResponsiveConfig(config = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      ...config.responsive
    };
  }
}

export default BaseChart;