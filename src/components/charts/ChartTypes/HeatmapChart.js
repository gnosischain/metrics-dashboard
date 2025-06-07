/**
 * Heatmap Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class HeatmapChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      xAxis: {
        type: 'category',
        data: processedData.xCategories,
        ...this.getAxisConfig(isDarkMode, 'category', config)
      },
      
      yAxis: {
        type: 'category',
        data: processedData.yCategories,
        ...this.getAxisConfig(isDarkMode, 'category', config)
      },
      
      visualMap: {
        min: processedData.minValue,
        max: processedData.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: isDarkMode 
            ? ['#003366', '#006699', '#0099cc', '#33ccff', '#66ffff']
            : ['#ffffff', '#cce7ff', '#99d6ff', '#66c2ff', '#0080ff']
        },
        textStyle: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      },
      
      series: [{
        type: 'heatmap',
        data: processedData.heatmapData,
        label: {
          show: config.showLabels || false,
          color: isDarkMode ? '#e5e7eb' : '#374151'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      
      tooltip: {
        position: 'top',
        formatter: (params) => {
          const [xIndex, yIndex, value] = params.data;
          const xLabel = processedData.xCategories[xIndex];
          const yLabel = processedData.yCategories[yIndex];
          return `${xLabel} - ${yLabel}<br/><strong>${formatValue(value, config.format)}</strong>`;
        }
      },
      
      grid: {
        height: '60%',
        top: '10%'
      }
    };
  }

  static processData(data, config) {
    const {
      xField = 'x',
      yField = 'y',
      valueField = 'value'
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Heatmap chart data must be an array');
    }

    // Extract unique categories for both axes
    const xCategories = [...new Set(data.map(item => item[xField]))].sort();
    const yCategories = [...new Set(data.map(item => item[yField]))].sort();
    
    // Prepare heatmap data in format [xIndex, yIndex, value]
    const heatmapData = [];
    let minValue = Infinity;
    let maxValue = -Infinity;

    data.forEach(item => {
      const xIndex = xCategories.indexOf(item[xField]);
      const yIndex = yCategories.indexOf(item[yField]);
      const value = parseFloat(item[valueField] || 0);
      
      if (xIndex !== -1 && yIndex !== -1) {
        heatmapData.push([xIndex, yIndex, value]);
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });

    return {
      xCategories,
      yCategories,
      heatmapData,
      minValue,
      maxValue
    };
  }
}

export default HeatmapChart;