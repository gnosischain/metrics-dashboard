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
    } else if (type === 'category') {
      // Apply smart time series formatting for category axes
      baseConfig.axisLabel.formatter = (value) => 
        BaseChart.formatTimeSeriesLabel(value, config.timeContext);
    }

    const axisOverrides = (type === 'value') ? config.yAxis : config.xAxis;
    return { ...baseConfig, ...(axisOverrides || {}) };
  }

  /**
   * Analyze data to determine time granularity
   * @param {Array} categories - Array of time values
   * @returns {Object} Analysis result with granularity info
   */
  static analyzeTimeGranularity(categories) {
    if (!categories || categories.length < 2) {
      return { granularity: 'unknown', shouldRemoveTime: false };
    }

    // Sample a few time values to determine granularity
    const sampleSize = Math.min(10, categories.length);
    const timeFormats = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const timeStr = String(categories[i]);
      
      // Check if it looks like a date/time string
      if (timeStr.match(/\d{4}-\d{2}-\d{2}/)) {
        // Extract time part if exists
        if (timeStr.includes(' ')) {
          const timePart = timeStr.split(' ')[1];
          if (timePart) {
            timeFormats.push(timePart);
          }
        } else {
          timeFormats.push('date-only');
        }
      }
    }

    // Analyze the time formats
    if (timeFormats.length === 0) {
      return { granularity: 'unknown', shouldRemoveTime: false };
    }

    const hasDateOnly = timeFormats.includes('date-only');
    const hasZeroTime = timeFormats.some(t => t === '00:00:00');
    const hasNonZeroTime = timeFormats.some(t => t !== '00:00:00' && t !== 'date-only');
    
    // If we have mixed formats or non-zero times, keep the time
    if (hasNonZeroTime) {
      return { granularity: 'sub-daily', shouldRemoveTime: false };
    }
    
    // If all times are 00:00:00 or date-only, it's daily data
    if (hasDateOnly || (hasZeroTime && !hasNonZeroTime)) {
      return { granularity: 'daily', shouldRemoveTime: true };
    }

    return { granularity: 'unknown', shouldRemoveTime: false };
  }

  /**
   * Smart time series label formatter
   * Only removes time part for daily data, preserves meaningful timestamps
   * @param {string|number} value - The label value
   * @param {Object} context - Context with granularity info
   * @returns {string} Formatted label
   */
  static formatTimeSeriesLabel(value, context = {}) {
    if (typeof value !== 'string') {
      return value;
    }

    // If we have granularity context, use it
    if (context.shouldRemoveTime === false) {
      return value;
    }

    // If we explicitly should remove time or detect daily pattern
    if (context.shouldRemoveTime === true || value.includes(' 00:00:00')) {
      return value.split(' ')[0];
    }

    return value;
  }

  /**
   * Smart tooltip date formatter
   * @param {string|number} dateValue - The date value from tooltip
   * @param {Object} context - Context with granularity info
   * @returns {string} Formatted date for tooltip
   */
  static formatTimeSeriesInTooltip(dateValue, context = {}) {
    return this.formatTimeSeriesLabel(dateValue, context);
  }

  /**
   * Enhanced tooltip formatter that handles time series formatting
   * @param {Object} config - Chart configuration
   * @returns {Function} Tooltip formatter function
   */
  static createTimeSeriesAwareTooltipFormatter(config = {}) {
    return (params) => {
      if (!Array.isArray(params)) params = [params];
      
      // Format the axis value (typically date) using time series formatting
      const axisValue = params[0]?.axisValue;
      const formattedDate = axisValue ? 
        BaseChart.formatTimeSeriesInTooltip(axisValue, config.timeContext) : '';
      
      let tooltip = `<strong>${formattedDate}</strong><br/>`;
      
      params.forEach(param => {
        if (param.value !== null && param.value !== undefined) {
          const seriesName = param.seriesName || 'Value';
          tooltip += `${seriesName}: <strong>${formatValue(param.value, config.format)}</strong><br/>`;
        }
      });
      
      return tooltip;
    };
  }

  static getGridConfig(config = {}) {
    return {
      left: '3%',
      right: '4%',
      bottom: config.dataZoom || config.enableZoom ? '15%' : '3%',
      containLabel: true,
      ...config.grid
    };
  }

  static getLegendConfig(isDarkMode, seriesCount, config = {}) {
    if (seriesCount <= 1) {
      return { show: false };
    }

    return {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      top: 'top',
      left: 'center',
      textStyle: {
        color: isDarkMode ? '#e5e7eb' : '#374151'
      },
      itemGap: 20,
      ...config.legend
    };
  }

  static getTooltipConfig(config = {}) {
    return {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: config.isDarkMode ? '#374151' : '#6b7280',
          // Format axis pointer labels (the ones that appear on axes)
          formatter: (params) => {
            if (params.axisDimension === 'x') {
              // Format x-axis labels using time context
              return BaseChart.formatTimeSeriesLabel(params.value, config.timeContext);
            }
            return formatValue(params.value, config.format);
          }
        }
      },
      backgroundColor: config.isDarkMode ? '#1f2937' : '#ffffff',
      borderColor: config.isDarkMode ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: config.isDarkMode ? '#e5e7eb' : '#374151'
      },
      ...config.tooltip
    };
  }

  static getDataZoomConfig(config = {}) {
    if (!config.dataZoom && !config.enableZoom) return {};
    
    const dataZoomConfig = {
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
          bottom: 10,
          height: 20,
          // Custom label formatter for zoom slider
          labelFormatter: (value, valueStr) => {
            return BaseChart.formatTimeSeriesLabel(valueStr, config.timeContext);
          }
        }
      ]
    };

    // Apply default zoom if specified
    if (config.defaultZoom) {
      dataZoomConfig.dataZoom.forEach(zoom => {
        zoom.start = config.defaultZoom.start || 0;
        zoom.end = config.defaultZoom.end || 100;
      });
    }

    return dataZoomConfig;
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
}

export default BaseChart;