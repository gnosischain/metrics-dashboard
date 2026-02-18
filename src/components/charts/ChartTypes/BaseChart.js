import { formatValue } from '../../../utils';

export class BaseChart {
  static isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static deepMerge(base, override) {
    if (!override) return base;

    const output = { ...base };

    Object.entries(override).forEach(([key, value]) => {
      if (BaseChart.isPlainObject(value) && BaseChart.isPlainObject(base?.[key])) {
        output[key] = BaseChart.deepMerge(base[key], value);
      } else {
        output[key] = value;
      }
    });

    return output;
  }

  static parseDateValue(value) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value) || Math.abs(value) < 1000000000) {
        return null;
      }

      const numericValue = Math.abs(value) < 1000000000000 ? value * 1000 : value;
      const numericDate = new Date(numericValue);
      return Number.isNaN(numericDate.getTime()) ? null : numericDate;
    }

    if (typeof value !== 'string') {
      return null;
    }

    let normalized = value.trim();
    if (!normalized) return null;

    if (/^\d{10}(\d{3})?$/.test(normalized)) {
      const numericValue =
        normalized.length === 10 ? Number(normalized) * 1000 : Number(normalized);
      const numericDate = new Date(numericValue);
      return Number.isNaN(numericDate.getTime()) ? null : numericDate;
    }

    if (/^\d{4}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}-01T00:00:00Z`;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = `${normalized}T00:00:00Z`;
    } else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(normalized)) {
      normalized = normalized.includes(' ') ? normalized.replace(' ', 'T') : normalized;
    } else {
      return null;
    }

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  static formatDateByGranularity(date, granularity, forTooltip = false) {
    const sharedOptions = { timeZone: 'UTC' };

    if (granularity === 'sub-daily' || granularity === 'hourly') {
      return new Intl.DateTimeFormat('en-US', {
        ...sharedOptions,
        month: 'short',
        day: 'numeric',
        ...(forTooltip ? { year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    }

    if (granularity === 'daily' || granularity === 'weekly') {
      return new Intl.DateTimeFormat('en-US', {
        ...sharedOptions,
        month: 'short',
        day: 'numeric',
        ...(forTooltip ? { year: 'numeric' } : {})
      }).format(date);
    }

    if (granularity === 'monthly') {
      return new Intl.DateTimeFormat('en-US', {
        ...sharedOptions,
        month: 'short',
        year: 'numeric'
      }).format(date);
    }

    if (granularity === 'yearly') {
      return new Intl.DateTimeFormat('en-US', {
        ...sharedOptions,
        year: 'numeric'
      }).format(date);
    }

    return forTooltip
      ? new Intl.DateTimeFormat('en-US', {
          ...sharedOptions,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date)
      : new Intl.DateTimeFormat('en-US', {
          ...sharedOptions,
          month: 'short',
          day: 'numeric'
        }).format(date);
  }

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
        show: true,
        lineStyle: {
          color: isDarkMode ? '#4b5563' : '#d1d5db'
        }
      },
      axisTick: {
        show: true,
        alignWithLabel: type === 'category'
      },
      axisLabel: {
        show: true,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        hideOverlap: true,
        showMinLabel: true,
        showMaxLabel: true
      },
      splitLine: {
        show: type === 'value',
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

    const axisOverrides = type === 'value' ? config.yAxis : config.xAxis;
    return BaseChart.deepMerge(baseConfig, axisOverrides || {});
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
    if (!categories || categories.length === 0) {
      return { granularity: 'unknown', shouldRemoveTime: false, isTimeSeries: false };
    }

    const sample = categories.slice(0, 30);
    const parsedDates = [];
    let hasExplicitTime = false;

    sample.forEach((value) => {
      if (typeof value === 'string') {
        const normalized = value.trim();
        if (/\d{2}:\d{2}(:\d{2})?/.test(normalized)) {
          hasExplicitTime = true;
        }
      }

      const parsed = BaseChart.parseDateValue(value);
      if (parsed) {
        parsedDates.push(parsed);
      }
    });

    if (parsedDates.length < 2) {
      if (parsedDates.length === 1) {
        const singleGranularity = hasExplicitTime ? 'sub-daily' : 'daily';
        return {
          granularity: singleGranularity,
          shouldRemoveTime: !hasExplicitTime,
          isTimeSeries: true
        };
      }

      return { granularity: 'unknown', shouldRemoveTime: false, isTimeSeries: false };
    }

    const timestamps = [...new Set(parsedDates.map((date) => date.getTime()))].sort((a, b) => a - b);
    let minStep = Infinity;

    for (let i = 1; i < timestamps.length; i++) {
      const diff = timestamps[i] - timestamps[i - 1];
      if (diff > 0 && diff < minStep) {
        minStep = diff;
      }
    }

    if (!Number.isFinite(minStep)) {
      minStep = 24 * 60 * 60 * 1000;
    }

    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    const MONTH_APPROX = 28 * DAY;
    const YEAR_APPROX = 365 * DAY;

    let granularity = 'daily';
    if (minStep < DAY || hasExplicitTime) {
      granularity = 'sub-daily';
    } else if (minStep >= YEAR_APPROX - 30 * DAY) {
      granularity = 'yearly';
    } else if (minStep >= MONTH_APPROX) {
      granularity = 'monthly';
    } else if (minStep >= 6 * DAY) {
      granularity = 'weekly';
    }

    return {
      granularity,
      shouldRemoveTime: granularity !== 'sub-daily' && granularity !== 'hourly',
      isTimeSeries: true
    };
  }

  static formatTimeSeriesLabel(value, context = {}) {
    const date = BaseChart.parseDateValue(value);
    if (!date) {
      return value;
    }

    const granularity = context.granularity || 'unknown';
    return BaseChart.formatDateByGranularity(date, granularity, false);
  }

  static formatTimeSeriesInTooltip(dateValue, context = {}) {
    const parsed = BaseChart.parseDateValue(dateValue);
    if (!parsed) return dateValue;

    const granularity = context.granularity || 'unknown';
    return BaseChart.formatDateByGranularity(parsed, granularity, true);
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
    const hasZoom = config.dataZoom || config.enableZoom;
    
    let bottomMargin, topMargin;
    
    if (isDynamicHeight) {
      if (hasZoom) {
        bottomMargin = isSmallCard ? '44px' : '52px';
        topMargin = isSmallCard ? '5%' : '8%';
      } else {
        bottomMargin = '20px';
        topMargin = isSmallCard ? '5%' : '8%';
      }
    } else {
      if (hasZoom) {
        bottomMargin = isSmallCard ? '48px' : '56px';
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
          bottom: isDynamicHeight ? 8 : (isSmallCard ? 10 : 12),
          height: isSmallCard ? 10 : 12,
          showDetail: false,
          showDataShadow: false,
          brushSelect: false,
          borderColor: 'transparent',
          backgroundColor: config.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          fillerColor: config.isDarkMode ? 'rgba(88, 166, 255, 0.28)' : 'rgba(9, 105, 218, 0.22)',
          labelFormatter: (value, valueStr) => {
            return BaseChart.formatTimeSeriesLabel(valueStr, config.timeContext);
          },
          handleSize: '95%',
          handleStyle: {
            color: config.isDarkMode ? '#58A6FF' : '#0969DA',
            borderColor: config.isDarkMode ? '#58A6FF' : '#0969DA'
          },
          textStyle: {
            color: config.isDarkMode ? '#9ca3af' : '#6b7280'
          },
          dataBackground: {
            lineStyle: { color: config.isDarkMode ? '#4b5563' : '#d1d5db', opacity: 0.2 },
            areaStyle: { color: config.isDarkMode ? '#374151' : '#f3f4f6', opacity: 0.2 }
          },
          selectedDataBackground: {
            lineStyle: { color: config.isDarkMode ? '#58A6FF' : '#0969DA' },
            areaStyle: { color: config.isDarkMode ? 'rgba(88, 166, 255, 0.2)' : 'rgba(9, 105, 218, 0.2)' }
          }
        }
      ]
    };

    if (config.defaultZoom) {
      dataZoomConfig.dataZoom.forEach((zoom) => {
        zoom.start = config.defaultZoom.start ?? 0;
        zoom.end = config.defaultZoom.end ?? 100;
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
