/**
 * Boxplot Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette } from '../../../utils/colors';
import { formatValue } from '../../../utils/formatters';

export class BoxplotChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    const colors = generateColorPalette(1, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      xAxis: {
        type: 'category',
        data: processedData.categories,
        ...this.getAxisConfig(isDarkMode, 'category', config)
      },
      
      yAxis: {
        type: 'value',
        ...this.getAxisConfig(isDarkMode, 'value', config)
      },
      
      series: [
        {
          name: 'Boxplot',
          type: 'boxplot',
          data: processedData.boxplotData,
          itemStyle: {
            color: colors[0],
            borderColor: colors[0]
          },
          tooltip: {
            formatter: (param) => {
              const data = param.data;
              return `
                ${param.name}<br/>
                Upper: ${formatValue(data[4], config.format)}<br/>
                Q3: ${formatValue(data[3], config.format)}<br/>
                Median: ${formatValue(data[2], config.format)}<br/>
                Q1: ${formatValue(data[1], config.format)}<br/>
                Lower: ${formatValue(data[0], config.format)}
              `;
            }
          }
        },
        {
          name: 'Outliers',
          type: 'scatter',
          data: processedData.outliers,
          itemStyle: {
            color: colors[0],
            opacity: 0.6
          }
        }
      ],
      
      tooltip: {
        trigger: 'item'
      },
      
      grid: this.getGridConfig(config)
    };
  }

  static processData(data, config) {
    const {
      categoryField = 'category',
      valueField = 'value'
    } = config;

    if (!Array.isArray(data)) {
      throw new Error('Boxplot chart data must be an array');
    }

    // Group data by category
    const grouped = {};
    data.forEach(item => {
      const category = item[categoryField];
      const value = parseFloat(item[valueField] || 0);
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(value);
    });

    const categories = Object.keys(grouped);
    const boxplotData = [];
    const outliers = [];

    categories.forEach((category, categoryIndex) => {
      const values = grouped[category].sort((a, b) => a - b);
      const boxplotStats = this.calculateBoxplotStats(values);
      
      boxplotData.push([
        boxplotStats.min,
        boxplotStats.q1,
        boxplotStats.median,
        boxplotStats.q3,
        boxplotStats.max
      ]);

      // Add outliers
      boxplotStats.outliers.forEach(outlier => {
        outliers.push([categoryIndex, outlier]);
      });
    });

    return {
      categories,
      boxplotData,
      outliers
    };
  }

  static calculateBoxplotStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    
    const q1 = this.quartile(sorted, 0.25);
    const median = this.quartile(sorted, 0.5);
    const q3 = this.quartile(sorted, 0.75);
    
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
    const filtered = sorted.filter(v => v >= lowerFence && v <= upperFence);
    
    return {
      min: Math.min(...filtered),
      q1,
      median,
      q3,
      max: Math.max(...filtered),
      outliers
    };
  }

  static quartile(values, q) {
    const pos = (values.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (values[base + 1] !== undefined) {
      return values[base] + rest * (values[base + 1] - values[base]);
    } else {
      return values[base];
    }
  }
}

export default BoxplotChart;