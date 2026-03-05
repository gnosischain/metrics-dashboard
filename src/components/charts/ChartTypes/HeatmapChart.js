/**
 * Heatmap Chart implementation for ECharts with time series support
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class HeatmapChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const heatmapScale = this.resolveHeatmapScale(config, isDarkMode);
    const { vmMin, vmMax } = this.resolveVisualMapRange(processedData, config);

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
        min: vmMin,
        max: vmMax,
        calculable: true,
        orient: config.visualMapOrient || 'horizontal',
        formatter: (value) => formatValue(value, config.format),
        ...(config.visualMapOrient === 'vertical'
          ? { right: config.visualMapRight ?? '4%', top: config.visualMapTop ?? 'center' }
          : { left: config.visualMapLeft ?? 'center', bottom: config.visualMapBottom ?? '5%' }),
        inRange: {
          color: heatmapScale
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
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: config.labelFontSize || 10,
          overflow: 'truncate',
          ellipsis: '..',
          formatter: (params) => formatValue(params.data[2], config.format)
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
          const xLabel = this.formatTimeSeriesInTooltip(processedData.xCategories[xIndex]);
          const yLabel = this.formatTimeSeriesInTooltip(processedData.yCategories[yIndex]);
          return `${xLabel} - ${yLabel}<br/><strong>${formatValue(value, config.format)}</strong>`;
        }
      },

      grid: this.getGridConfig(config.enableZoom
        ? { ...config, grid: { ...config.grid, left: config.grid?.left ?? '4%' } }
        : config),

      ...(config.enableZoom ? {
        dataZoom: [
          { type: 'inside', xAxisIndex: [0], filterMode: 'none' },
          { type: 'inside', yAxisIndex: [0], filterMode: 'none' },
          {
            type: 'slider', yAxisIndex: [0], filterMode: 'none',
            left: 8, width: 12, showDetail: false, showDataShadow: false
          },
        ]
      } : {})
    };
  }

  static resolveVisualMapRange(processedData, config) {
    const pct = config.visualMapPercentile;
    const dataMin = pct ? processedData.p5 : processedData.minValue;
    const dataMax = pct ? processedData.p95 : processedData.maxValue;

    if (config.visualMapCenter != null) {
      const center = config.visualMapCenter;
      const spread = Math.max(center - dataMin, dataMax - center);
      return {
        vmMin: Math.max(0, center - spread),
        vmMax: center + spread
      };
    }

    return { vmMin: dataMin, vmMax: dataMax };
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

    // Compute percentile values for outlier-resistant color mapping
    const sortedValues = heatmapData.map(d => d[2]).sort((a, b) => a - b);
    const percentile = (pct) => sortedValues[Math.min(Math.floor(pct / 100 * sortedValues.length), sortedValues.length - 1)];

    return {
      xCategories,
      yCategories,
      heatmapData,
      minValue,
      maxValue,
      p5: percentile(5),
      p95: percentile(95)
    };
  }
}

export default HeatmapChart;
