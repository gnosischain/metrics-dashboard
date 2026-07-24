/**
 * Pie Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';
import { getTokenIconUrl } from '../../../utils/tokenIcons.js';

export class PieChart extends BaseChart {
  static buildTokenRichStyles(names) {
    const rich = {};
    for (const name of names) {
      const url = getTokenIconUrl(name);
      if (url) {
        const key = name.replace(/[^a-zA-Z0-9_]/g, '_');
        rich[key] = {
          backgroundColor: { image: url },
          width: 16,
          height: 16,
          borderRadius: 8,
        };
      }
    }
    return rich;
  }

  static formatLabelWithIcon(name, suffix) {
    const url = getTokenIconUrl(name);
    if (!url) return suffix ? `${name}: ${suffix}` : name;
    const key = name.replace(/[^a-zA-Z0-9_]/g, '_');
    return suffix ? `{${key}|} ${name}: ${suffix}` : `{${key}|} ${name}`;
  }

  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = this.resolveSeriesPalette(config, processedData.data.length, isDarkMode);
    const totalValue = processedData.data.reduce((sum, item) => sum + Number(item.value || 0), 0);
    const tokenRichStyles = this.buildTokenRichStyles(processedData.data.map(d => d.name));
    // Default on; metrics can set showLabels: false for dense top-N pies (legend + tooltip only).
    const showLabels = config.showLabels !== false;
    // Optional: only draw callouts for slices at/above this percent; legend still lists all.
    const minLabelPercent = Number.isFinite(Number(config.minLabelPercent))
      ? Number(config.minLabelPercent)
      : 0;

    return {
      ...this.getBaseOptions(isDarkMode),
      title: config.showTotal === true ? {
        text: '',
        left: 'center',
        top: 0,
        itemGap: 0,
        textStyle: { fontSize: 0 },
        subtext: `Total: ${formatValue(totalValue, config.format)}`,
        subtextStyle: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: 16,
          fontWeight: 400
        }
      } : undefined,
      
      series: [{
        type: 'pie',
        // Only use explicit radius; ignore legacy `donut: true` flags that were never applied.
        radius: config.radius || '70%',
        center: config.center || ['50%', '50%'],
        // Keep ECharts default collision avoidance for all labeled pies (Tokens, etc.).
        // minLabelPercent only decides which slices get a callout — it must not disable this.
        avoidLabelOverlap: showLabels,
        data: processedData.data.map((item, index) => {
          const value = Number(item.value || 0);
          const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
          const hasName = Boolean(item.name) && item.name !== '—';
          // Per-slice: hide both label text AND leader line below the threshold.
          // Returning '' from the formatter alone still leaves empty labelLines.
          const showItemLabel = showLabels
            && hasName
            && value > 0
            && (minLabelPercent <= 0 || percent >= minLabelPercent);
          return {
            ...item,
            itemStyle: {
              color: colors[index]
            },
            label: { show: showItemLabel },
            labelLine: { show: showItemLabel },
          };
        }),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 12,
          show: showLabels,
          formatter: (params) => {
            if (config.pieLabelValue === false) {
              return PieChart.formatLabelWithIcon(params.name, null);
            }
            if (config.showPercentage) {
              return PieChart.formatLabelWithIcon(params.name, `${params.percent}%`);
            }
            return PieChart.formatLabelWithIcon(params.name, formatValue(params.value, config.format));
          },
          rich: {
            ...tokenRichStyles
          }
        },
        labelLine: {
          show: showLabels,
          showAbove: false,
          smooth: true,
          lineStyle: {
            color: isDarkMode ? '#6b7280' : '#9ca3af'
          }
        },
      }],
      
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: isDarkMode ? '#E2E8F0' : '#0F172A',
          fontSize: 13
        },
        padding: [10, 14],
        formatter: (params) => {
          const value = formatValue(params.value, config.format);
          return `<div style="font-weight:600;margin-bottom:4px;">${params.name}</div><div>${value} <span style="opacity:0.7;">(${params.percent}%)</span></div>`;
        }
      },

      legend: {
        show: config.showLegend !== false,
        type: 'scroll',
        orient: config.legendOrient || 'horizontal',
        bottom: config.legendOrient === 'vertical' ? 'center' : 0,
        right: config.legendOrient === 'vertical' ? 0 : 'center',
        formatter: (name) => {
          const url = getTokenIconUrl(name);
          if (!url) return name;
          const key = name.replace(/[^a-zA-Z0-9_]/g, '_');
          return `{${key}|} ${name}`;
        },
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 12,
          rich: {
            ...tokenRichStyles
          }
        }
      }
    };
  }

  static processData(data, config) {
    const {
      nameField = 'name',
      valueField = 'value'
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Pie chart data must be an array');
    }

    // Sort data by value (descending) for better visual appeal
    const sortedData = [...data].sort((a, b) => {
      const valueA = parseFloat(a[valueField] || 0);
      const valueB = parseFloat(b[valueField] || 0);
      return valueB - valueA;
    });

    return {
      data: sortedData.map(item => ({
        name: item[nameField] || '—',
        value: parseFloat(item[valueField] || 0)
      }))
    };
  }
}

export default PieChart;
