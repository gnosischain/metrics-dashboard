/**
 * Line Chart implementation for ECharts
 * Location: src/components/charts/ChartTypes/LineChart.js
 * 
 * FIXED: Updated to properly handle series data structure for ECharts
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class LineChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    console.log('LineChart.getOptions called with:', { data, config, isDarkMode });
    
    if (!this.validateData(data)) {
      console.log('LineChart: Data validation failed, returning empty chart');
      return this.getEmptyChartOptions(isDarkMode);
    }

    try {
      const processedData = this.processData(data, config);
      console.log('LineChart: Processed data:', processedData);
      
      const colors = generateColorPalette(processedData.series.length, isDarkMode);

      const chartOptions = {
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
        
        series: processedData.series.map((series, index) => ({
          name: series.name,
          type: 'line',
          data: series.data,
          smooth: config.smooth || false,
          symbol: 'circle',
          symbolSize: config.symbolSize || 4,
          lineStyle: {
            width: config.lineWidth || 2,
            color: colors[index]
          },
          itemStyle: {
            color: colors[index]
          },
          connectNulls: false
        })),
        
        tooltip: {
          ...this.getTooltipConfig({ ...config, isDarkMode }),
          formatter: (params) => {
            let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
            params.forEach(param => {
              if (param.value !== null && param.value !== undefined) {
                tooltip += `${param.seriesName}: <strong>${formatValue(param.value, config.format)}</strong><br/>`;
              }
            });
            return tooltip;
          }
        },
        
        legend: this.getLegendConfig(isDarkMode, processedData.series.length, config),
        
        grid: this.getGridConfig(config),
        
        ...this.getDataZoomConfig(config)
      };

      console.log('LineChart: Final chart options:', chartOptions);
      return chartOptions;
    } catch (error) {
      console.error('LineChart: Error in getOptions:', error);
      return this.getEmptyChartOptions(isDarkMode);
    }
  }

  static validateData(data) {
    console.log('LineChart.validateData called with:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('LineChart.validateData: Data is invalid (not a non-empty array).');
      return false;
    }
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      console.log('LineChart.validateData: First item is not an object:', firstItem);
      return false;
    }
    
    console.log('LineChart.validateData: Data is valid');
    return true;
  }

  static processData(data, config) {
    console.log('LineChart.processData called with:', { data, config });

    if (!Array.isArray(data)) {
        throw new Error('Line chart data must be an array');
    }

    const { xField = 'date', yField = 'value', seriesField = null } = config;
    const firstItem = data[0] || {};
    const availableFields = Object.keys(firstItem);

    const actualXField = this.findBestField(availableFields, xField, ['date', 'time', 'timestamp', 'x']);
    const actualYField = this.findBestField(availableFields, yField, ['value', 'y', 'count', 'amount', 'apy']);
    const actualSeriesField = seriesField ? this.findBestField(availableFields, seriesField, ['label', 'series', 'category', 'group']) : null;

    console.log('LineChart.processData: Resolved fields:', { actualXField, actualYField, actualSeriesField });

    // Extract unique, sorted categories (x-axis), ensuring date sorting is correct
    const categories = [...new Set(data.map(item => item[actualXField]))]
      .sort((a, b) => {
        // Handle date sorting more robustly
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA - dateB;
        }
        // Fallback to string comparison for non-date categories
        return String(a).localeCompare(String(b));
      });
    
    console.log('LineChart.processData: Categories found:', categories.length, categories.slice(0, 5));

    const seriesMap = new Map();

    if (actualSeriesField) {
        // Multi-series data: group data by series name first
        data.forEach(item => {
            const seriesName = item[actualSeriesField] || 'Unnamed Series';
            if (!seriesMap.has(seriesName)) {
                seriesMap.set(seriesName, new Map());
            }
            // Store value against its x-category for quick lookup
            seriesMap.get(seriesName).set(item[actualXField], item[actualYField]);
        });
    } else {
        // Single-series data
        const seriesName = config.seriesName || actualYField || 'Value';
        seriesMap.set(seriesName, new Map());
        data.forEach(item => {
            seriesMap.get(seriesName).set(item[actualXField], item[actualYField]);
        });
    }
    
    console.log(`LineChart.processData: Found ${seriesMap.size} distinct series.`);

    // Build the final series array for ECharts
    const processedSeries = [];
    for (const [seriesName, dataMap] of seriesMap.entries()) {
        const seriesData = categories.map(category => {
            const rawValue = dataMap.get(category);
            
            if (rawValue === null || rawValue === undefined) {
                return null;
            }
            
            // Robust parsing: handles numbers, or strings containing numbers (e.g., "3.5%", "1,234.56")
            let value;
            if (typeof rawValue === 'number') {
                value = rawValue;
            } else {
                // For strings, try to extract numeric value
                const cleanedValue = String(rawValue).replace(/[^0-9.-]+/g, "");
                value = parseFloat(cleanedValue);
            }
            
            return isNaN(value) ? null : value;
        });
        
        console.log(`LineChart.processData: Series "${seriesName}" data:`, seriesData.slice(0, 5), '... (showing first 5 values)');
        processedSeries.push({ name: seriesName, data: seriesData });
    }

    const result = { categories, series: processedSeries };
    console.log('LineChart.processData: Final result structure:', {
        categoriesLength: result.categories.length,
        seriesCount: result.series.length,
        firstSeriesDataLength: result.series[0]?.data?.length || 0,
        sampleCategories: result.categories.slice(0, 3),
        sampleSeriesData: result.series[0]?.data?.slice(0, 3) || []
    });
    
    return result;
  }
  
  /**
   * Helper method to find the best matching field name
   */
  static findBestField(availableFields, preferredField, fallbackFields) {
    if (availableFields.includes(preferredField)) {
      return preferredField;
    }
    for (const fallback of fallbackFields) {
      if (availableFields.includes(fallback)) {
        return fallback;
      }
    }
    return preferredField;
  }
}

export default LineChart;