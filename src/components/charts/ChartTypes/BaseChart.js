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
      baseConfig.axisLabel.formatter = (value) => BaseChart.formatAxisValue(value, config);
    } else if (type === 'category') {
      baseConfig.axisLabel.formatter = (value) => 
        BaseChart.formatTimeSeriesLabel(value, config.timeContext);
    }

    const axisOverrides = (type === 'value') ? config.yAxis : config.xAxis;
    return { ...baseConfig, ...(axisOverrides || {}) };
  }

  static formatAxisValue(value, config = {}) {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }

    const format = config.axisLabelFormat || config.format;
    const abs = Math.abs(Number(value));
    const threshold = Number.isFinite(config.axisCompactThreshold)
      ? config.axisCompactThreshold
      : 1000;

    if (abs < threshold) {
      return formatValue(value, format);
    }

    const { prefix, suffix } = BaseChart.getAxisAffixes(format, value);
    return `${prefix}${BaseChart.formatCompactNumber(value)}${suffix}`;
  }

  static getAxisAffixes(format, value) {
    const sign = Number(value) < 0 ? '-' : '';

    if (format === 'formatCurrency' || format === 'formatNumberWithUSD') {
      return { prefix: `${sign}$`, suffix: '' };
    }
    if (format === 'formatNumberWithXDAI') {
      return { prefix: sign, suffix: ' xDAI' };
    }
    if (format === 'formatNumberWithGNO') {
      return { prefix: sign, suffix: ' GNO' };
    }

    return { prefix: sign, suffix: '' };
  }

  static formatCompactNumber(value) {
    const abs = Math.abs(Number(value));
    if (!Number.isFinite(abs)) return '0';

    let scaled = abs;
    let suffix = '';

    if (abs >= 1000000000) {
      scaled = abs / 1000000000;
      suffix = 'B';
    } else if (abs >= 1000000) {
      scaled = abs / 1000000;
      suffix = 'M';
    } else if (abs >= 1000) {
      scaled = abs / 1000;
      suffix = 'K';
    }

    const digits = scaled >= 10 ? 0 : 1;
    const rounded = scaled.toFixed(digits).replace(/\.0$/, '');
    return `${rounded}${suffix}`;
  }

  static analyzeTimeGranularity(categories) {
    if (!categories || categories.length < 2) {
      return { granularity: 'unknown', shouldRemoveTime: false };
    }

    const sampleSize = Math.min(10, categories.length);
    const timeFormats = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const timeStr = String(categories[i]);
      
      if (timeStr.match(/\d{4}-\d{2}-\d{2}/)) {
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

    if (timeFormats.length === 0) {
      return { granularity: 'unknown', shouldRemoveTime: false };
    }

    const hasDateOnly = timeFormats.includes('date-only');
    const hasZeroTime = timeFormats.some(t => t === '00:00:00');
    const hasNonZeroTime = timeFormats.some(t => t !== '00:00:00' && t !== 'date-only');
    
    if (hasNonZeroTime) {
      return { granularity: 'sub-daily', shouldRemoveTime: false };
    }
    
    if (hasDateOnly || (hasZeroTime && !hasNonZeroTime)) {
      return { granularity: 'daily', shouldRemoveTime: true };
    }

    return { granularity: 'unknown', shouldRemoveTime: false };
  }

  static formatTimeSeriesLabel(value, context = {}) {
    if (typeof value !== 'string') {
      return value;
    }

    if (context.shouldRemoveTime === false) {
      return value;
    }

    if (context.shouldRemoveTime === true || value.includes(' 00:00:00')) {
      return value.split(' ')[0];
    }

    return value;
  }

  static formatTimeSeriesInTooltip(dateValue, context = {}) {
    return this.formatTimeSeriesLabel(dateValue, context);
  }

  static createTimeSeriesAwareTooltipFormatter(config = {}) {
  // optional number formatting hook
  const fmt = (v) => formatValue(v, config.format);
  // opt-in ordering: 'valueDesc' | 'valueAsc' | 'seriesAsc' | 'seriesDesc'
  const order = config.tooltipOrder;
  const getColumnCount = (count) => {
    if (Number.isFinite(config.tooltipColumns)) {
      return Math.max(1, Math.floor(config.tooltipColumns));
    }
    if (count > 20) return 3;
    if (count > 10) return 2;
    return 1;
  };

  const sorter = (a, b) => {
    if (order === 'valueDesc') return (Number(b.value) || 0) - (Number(a.value) || 0);
    if (order === 'valueAsc')  return (Number(a.value) || 0) - (Number(b.value) || 0);
    if (order === 'seriesAsc') return String(a.seriesName).localeCompare(String(b.seriesName));
    if (order === 'seriesDesc')return String(b.seriesName).localeCompare(String(a.seriesName));
    return 0; // keep original stack order when no flag is set
  };

  return (params) => {
    if (!Array.isArray(params)) params = [params];

    const axisValue = params[0]?.axisValue;
    const formattedDate = axisValue
      ? BaseChart.formatTimeSeriesInTooltip(axisValue, config.timeContext)
      : '';

    let tooltip = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(128,128,128,0.3);">${formattedDate}</div>`;
    let total = 0;

    const items = params
      .filter(p => p.value !== null && p.value !== undefined && p.value !== 0)
      .slice(); 

    // apply ordering only if requested
    if (order) items.sort(sorter);

    const rowHtml = items.map(p => {
      const seriesName = p.seriesName || 'Value';
      const color = p.color || '#999';
      const formattedValue = fmt(p.value);
      if (config.showTotal && typeof p.value === 'number') {
        total += p.value;
      }
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;flex:1;min-width:0;">
            <div style="width:8px;height:8px;border-radius:50%;background-color:${color};margin-right:8px;flex-shrink:0;"></div>
            <span style="margin-right:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${seriesName}</span>
          </div>
          <span style="font-weight:600;white-space:nowrap;">${formattedValue}</span>
        </div>`;
    });

    if (rowHtml.length > 0) {
      const columnCount = getColumnCount(rowHtml.length);
      const itemsPerColumn = Math.ceil(rowHtml.length / columnCount);
      const columns = [];

      for (let i = 0; i < columnCount; i++) {
        const start = i * itemsPerColumn;
        const end = start + itemsPerColumn;
        const columnRows = rowHtml.slice(start, end);
        if (columnRows.length === 0) continue;
        columns.push(`
          <div style="display:flex;flex-direction:column;gap:6px;min-width:150px;">
            ${columnRows.join('')}
          </div>
        `);
      }

      tooltip += `
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${columns.join('')}
        </div>`;
    }

    if (config.showTotal && items.length > 1) {
      tooltip += `
        <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(128,128,128,0.3);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;">Total</span>
            <span style="font-weight:600;margin-left:16px;">${fmt(total)}</span>
          </div>
        </div>`;
    }

    return tooltip;
  };
}

  static getGridConfig(config = {}) {
    const isSmallCard = config.cardSize === 'small' || config.isHalfWidth;
    const isDynamicHeight = config.dynamicHeight || config.isDynamicHeight;
    
    let bottomMargin, topMargin;
    
    if (isDynamicHeight) {
      if (config.dataZoom || config.enableZoom) {
        // *** FIX: Reduced bottom margin to bring zoom slider closer to the chart ***
        bottomMargin = '30px'; 
        topMargin = isSmallCard ? '5%' : '8%';
      } else {
        bottomMargin = '20px';
        topMargin = isSmallCard ? '5%' : '8%';
      }
    } else {
      if (config.dataZoom || config.enableZoom) {
        // *** FIX: Reduced percentage for fixed-height charts as well ***
        bottomMargin = '12%'; 
        topMargin = isSmallCard ? '8%' : '10%';
      } else {
        bottomMargin = isSmallCard ? '8%' : '3%';
        topMargin = isSmallCard ? '6%' : '10%';
      }
    }

    return {
      left: '3%',
      right: '50px',
      bottom: bottomMargin,
      top: topMargin,
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
          formatter: (params) => {
            if (params.axisDimension === 'x') {
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
      padding: [10, 14],
      ...config.tooltip
    };
  }

  static getDataZoomConfig(config = {}) {
    if (!config.dataZoom && !config.enableZoom) return {};
    
    const isSmallCard = config.cardSize === 'small' || config.isHalfWidth;
    const isDynamicHeight = config.dynamicHeight || config.isDynamicHeight;
    
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
          bottom: isDynamicHeight ? 5 : (isSmallCard ? 12 : 10),
          height: isSmallCard ? 18 : 20,
          labelFormatter: (value, valueStr) => {
            return BaseChart.formatTimeSeriesLabel(valueStr, config.timeContext);
          },
          handleStyle: {
            color: config.isDarkMode ? '#58A6FF' : '#0969DA',
            borderColor: config.isDarkMode ? '#58A6FF' : '#0969DA'
          },
          textStyle: {
            color: config.isDarkMode ? '#9ca3af' : '#6b7280'
          },
          dataBackground: {
            lineStyle: { color: config.isDarkMode ? '#4b5563' : '#d1d5db' },
            areaStyle: { color: config.isDarkMode ? '#374151' : '#f3f4f6' }
          },
          selectedDataBackground: {
            lineStyle: { color: config.isDarkMode ? '#58A6FF' : '#0969DA' },
            areaStyle: { color: config.isDarkMode ? 'rgba(88, 166, 255, 0.2)' : 'rgba(9, 105, 218, 0.2)' }
          }
        }
      ]
    };

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
