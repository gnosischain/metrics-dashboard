/**
 * Fixed Boxplot Chart implementation for ECharts
 * Uses correct data positioning for proper boxplot proportions
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
    const primaryColor = colors[0];

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
        // 1. Main box (Q1 to Q3) using candlestick
        {
          name: 'Box',
          type: 'candlestick',
          data: processedData.categories.map((cat, i) => {
            const data = processedData.boxplotData[i];
            // Candlestick format: [open, close, low, high]
            // We'll use: [Q1, Q3, Q1, Q3] to create a box
            return [data.q1, data.q3, data.q1, data.q3];
          }),
          itemStyle: {
            color: isDarkMode ? 'rgba(88, 166, 255, 0.3)' : 'rgba(9, 105, 218, 0.3)',
            color0: isDarkMode ? 'rgba(88, 166, 255, 0.3)' : 'rgba(9, 105, 218, 0.3)',
            borderColor: primaryColor,
            borderColor0: primaryColor,
            borderWidth: 2
          },
          barWidth: '60%',
          // Add whisker lines as markLines
          markLine: {
            silent: true,
            lineStyle: {
              color: primaryColor,
              width: 1,
              type: 'solid'
            },
            symbol: 'none',
            data: processedData.categories.flatMap((cat, i) => {
              const data = processedData.boxplotData[i];
              return [
                // Lower whisker: from min to Q1
                [
                  { xAxis: i, yAxis: data.min },
                  { xAxis: i, yAxis: data.q1 }
                ],
                // Upper whisker: from Q3 to max
                [
                  { xAxis: i, yAxis: data.q3 },
                  { xAxis: i, yAxis: data.max }
                ]
              ];
            })
          },
          tooltip: {
            formatter: (params) => {
              const dataIndex = params.dataIndex;
              const boxData = processedData.boxplotData[dataIndex];
              const categoryName = processedData.categories[dataIndex];
              
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 8px;">${categoryName}</div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Max (${config.maxField || '95th'}):</span>
                    <strong style="margin-left: 16px;">${formatValue(boxData.max, config.format)}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Q3 (${config.q3Field || '75th'}):</span>
                    <strong style="margin-left: 16px;">${formatValue(boxData.q3, config.format)}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Median (${config.medianField || '50th'}):</span>
                    <strong style="margin-left: 16px;">${formatValue(boxData.median, config.format)}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Q1 (${config.q1Field || '25th'}):</span>
                    <strong style="margin-left: 16px;">${formatValue(boxData.q1, config.format)}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                    <span>Min (${config.minField || '5th'}):</span>
                    <strong style="margin-left: 16px;">${formatValue(boxData.min, config.format)}</strong>
                  </div>
                </div>
              `;
            }
          }
        },
        
        // 2. Median line
        {
          name: 'Median',
          type: 'scatter',
          symbol: 'rect',
          symbolSize: [60, 3],
          data: processedData.categories.map((cat, i) => {
            const data = processedData.boxplotData[i];
            return [i, data.median];
          }),
          itemStyle: {
            color: isDarkMode ? '#ffffff' : '#000000',
            borderWidth: 0
          },
          z: 10,
          silent: true
        },
        
        // 3. Whisker end caps
        {
          name: 'Caps',
          type: 'scatter',
          symbol: 'rect', 
          symbolSize: [20, 2],
          data: processedData.categories.flatMap((cat, i) => {
            const data = processedData.boxplotData[i];
            return [
              [i, data.min],
              [i, data.max]
            ];
          }),
          itemStyle: {
            color: primaryColor,
            borderWidth: 0
          },
          z: 5,
          silent: true
        }
      ],
      
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#555' : '#ccc',
        textStyle: {
          color: isDarkMode ? '#fff' : '#333'
        }
      },
      
      legend: {
        show: false
      },
      
      grid: this.getGridConfig(config)
    };
  }

  static processData(data, config) {
    console.log('FixedBoxplotChart.processData: Input data:', data);
    console.log('FixedBoxplotChart.processData: Config:', config);

    if (!Array.isArray(data)) {
      throw new Error('Boxplot chart data must be an array');
    }

    const {
      categoryField = 'category',
      minField = 'min',
      q1Field = 'q1', 
      medianField = 'median',
      q3Field = 'q3',
      maxField = 'max'
    } = config;

    // Extract categories
    const categories = data.map(item => item[categoryField]);
    
    // Build boxplot data objects
    const boxplotData = data.map(item => {
      const boxData = {
        min: parseFloat(item[minField]),
        q1: parseFloat(item[q1Field]), 
        median: parseFloat(item[medianField]),
        q3: parseFloat(item[q3Field]),
        max: parseFloat(item[maxField])
      };
      
      console.log('FixedBoxplotChart: Processing item:', {
        category: item[categoryField],
        values: boxData,
        ranges: {
          'IQR (Q3-Q1)': boxData.q3 - boxData.q1,
          'Total range': boxData.max - boxData.min
        }
      });
      
      return boxData;
    });

    return {
      categories,
      boxplotData
    };
  }

  static validateData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('FixedBoxplotChart: Invalid data provided');
      return false;
    }
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      console.warn('FixedBoxplotChart: Data items must be objects');
      return false;
    }
    
    return true;
  }
}

export default BoxplotChart;