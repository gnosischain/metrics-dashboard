/**
 * Radar Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class RadarChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = this.resolveSeriesPalette(config, processedData.series.length, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      radar: {
        indicator: processedData.indicator,
        center: ['50%', '50%'],
        radius: config.radius || '70%',
        axisName: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: isDarkMode ? '#4b5563' : '#d1d5db'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDarkMode ? '#374151' : '#f3f4f6'
          }
        },
        splitArea: {
          areaStyle: {
            color: isDarkMode 
              ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] 
              : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)']
          }
        }
      },
      
      series: [{
        type: 'radar',
        data: processedData.series.map((series, index) => ({
          ...series,
          itemStyle: { 
            color: colors[index % colors.length] 
          },
          areaStyle: { 
            opacity: 0.3,
            color: colors[index % colors.length]
          },
          lineStyle: {
            color: colors[index % colors.length],
            width: 2
          }
        }))
      }],
      
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          let tooltip = `<strong>${params.name}</strong><br/>`;
          params.value.forEach((value, index) => {
            const indicator = processedData.indicator[index];
            tooltip += `${indicator.name}: <strong>${formatValue(value, config.format)}</strong><br/>`;
          });
          return tooltip;
        }
      },
      
      legend: this.getLegendConfig(isDarkMode, processedData.series.length, config)
    };
  }

  static processData(data, config) {
    const { nameField = 'name' } = config;
    
    if (!Array.isArray(data) || data.length === 0) {
      return { indicator: [], series: [] };
    }

    const firstItem = data[0];
    const numericFields = Object.keys(firstItem).filter(key => 
      key !== nameField && typeof firstItem[key] === 'number'
    );

    // Create indicator (radar axes)
    const indicator = numericFields.map(field => ({
      name: field,
      max: Math.max(...data.map(item => item[field] || 0)) * 1.2
    }));

    // Create series data
    const series = data.map(item => ({
      name: item[nameField] || 'Unknown',
      value: numericFields.map(field => item[field] || 0)
    }));

    return { indicator, series };
  }
}

export default RadarChart;
