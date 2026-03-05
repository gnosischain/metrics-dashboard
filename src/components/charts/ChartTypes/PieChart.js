/**
 * Pie Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class PieChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = this.resolveSeriesPalette(config, processedData.data.length, isDarkMode);
    const totalValue = processedData.data.reduce((sum, item) => sum + Number(item.value || 0), 0);

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
        radius: config.radius || '70%',
        center: config.center || ['50%', '50%'],
        data: processedData.data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          formatter: (params) => {
            if (config.pieLabelValue === false) {
              return params.name;
            }
            if (config.useAbbreviatedLabels) {
              const formattedValue = formatValue(params.value, config.format);
              return `${params.name}: ${formattedValue}`;
            }
            return config.showPercentage 
              ? `${params.name}: ${params.percent}%` 
              : `${params.name}: ${params.value}`;
          }
        },
        labelLine: {
          lineStyle: {
            color: isDarkMode ? '#6b7280' : '#9ca3af'
          }
        }
      }],
      
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const value = formatValue(params.value, config.format);
          return `${params.name}<br/><strong>${value}</strong> (${params.percent}%)`;
        }
      },
      
      legend: {
        show: config.showLegend !== false,
        type: 'scroll',
        orient: config.legendOrient || 'horizontal',
        bottom: config.legendOrient === 'vertical' ? 'center' : 0,
        right: config.legendOrient === 'vertical' ? 0 : 'center',
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
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
        name: item[nameField] || 'Unknown',
        value: parseFloat(item[valueField] || 0)
      }))
    };
  }
}

export default PieChart;
