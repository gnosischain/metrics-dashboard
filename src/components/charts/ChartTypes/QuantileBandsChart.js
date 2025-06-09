/**
 * Quantile Bands Chart implementation for ECharts
 * Creates a chart with color bands representing quantile ranges and optional lines
 * Location: src/components/charts/ChartTypes/QuantileBandsChart.js
 */

import { BaseChart } from './BaseChart';
import { generateColorPalette, formatValue } from '../../../utils';

export class QuantileBandsChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const { processedData, xAxisData } = this.processData(data, config);
    const colors = config.bandColors || generateColorPalette(config.bands?.length || 3, isDarkMode);
    const lineColors = config.lineColors || ['#000000', '#0969DA', '#58A6FF'];
    
    // Analyze time granularity for smart formatting
    const timeAnalysis = BaseChart.analyzeTimeGranularity(xAxisData);
    const enhancedConfig = {
      ...config,
      timeContext: timeAnalysis
    };

    // Build series
    const series = [];
    
    // Add bands using pairs of lines with area between
    if (config.bands && Array.isArray(config.bands)) {
      // Process bands from largest to smallest for proper layering
      const sortedBands = [...config.bands].sort((a, b) => {
        const aRange = (processedData[a.upper][0] || 0) - (processedData[a.lower][0] || 0);
        const bRange = (processedData[b.upper][0] || 0) - (processedData[b.lower][0] || 0);
        return bRange - aRange;
      });

      sortedBands.forEach((band, sortIndex) => {
        const originalIndex = config.bands.indexOf(band);
        
        // Add upper bound series
        series.push({
          name: band.name || `Band ${originalIndex + 1}`,
          type: 'line',
          data: processedData[band.upper],
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            color: colors[originalIndex % colors.length],
            opacity: band.opacity || 0.2
          },
          z: (sortedBands.length - sortIndex) * 10
        });
        
        // Add lower bound series (invisible) to create the band effect
        series.push({
          name: `_band_lower_${originalIndex}`,
          type: 'line',
          data: processedData[band.lower],
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            color: isDarkMode ? '#1a1a1a' : '#ffffff',
            opacity: 1
          },
          silent: true,
          tooltip: { show: false },
          z: (sortedBands.length - sortIndex) * 10 + 1
        });
      });
    }

    // Add lines on top of bands
    if (config.lines && Array.isArray(config.lines)) {
      config.lines.forEach((lineField, index) => {
        const lineName = config.lineNamer ? 
          config.lineNamer(lineField) : 
          this.getDefaultLineName(lineField);
        
        series.push({
          name: lineName,
          type: 'line',
          data: processedData[lineField],
          lineStyle: {
            width: config.lineStrokeWidth || 3,
            opacity: config.lineOpacity || 0.9,
            color: lineColors[index % lineColors.length]
          },
          symbol: 'none',
          smooth: config.interpolate === 'monotoneX',
          z: 1000 + index,
          emphasis: {
            lineStyle: {
              width: (config.lineStrokeWidth || 3) + 1
            }
          }
        });
      });
    }

    return {
      ...this.getBaseOptions(isDarkMode),
      
      grid: this.getGridConfig(enhancedConfig),
      
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false,
        ...this.getAxisConfig(isDarkMode, 'category', enhancedConfig)
      },
      
      yAxis: {
        type: 'value',
        scale: true,
        ...this.getAxisConfig(isDarkMode, 'value', enhancedConfig)
      },
      
      legend: config.enableLegend !== false ? {
        ...this.getLegendConfig(isDarkMode, series.length, {
          ...enhancedConfig,
          legend: {
            ...config.legend,
            top: config.legendPosition || 'top',
            type: config.legendScrollable ? 'scroll' : 'plain',
            data: series
              .filter(s => !s.name.startsWith('_'))
              .map(s => s.name)
          }
        })
      } : { show: false },
      
      tooltip: config.enableTooltip !== false ? {
        ...this.getTooltipConfig({
          ...enhancedConfig,
          isDarkMode,
          format: config.format
        }),
        trigger: 'axis',
        formatter: (params) => {
          const dataIndex = params[0]?.dataIndex;
          if (dataIndex === undefined) return '';
          
          const xValue = xAxisData[dataIndex];
          
          let tooltip = `<div style="font-weight: 600; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(128,128,128,0.3);">${
            BaseChart.formatTimeSeriesInTooltip(xValue, enhancedConfig.timeContext)
          }</div>`;
          
          // Show lines first
          if (config.lines) {
            config.lines.forEach((lineField, index) => {
              const value = processedData[lineField][dataIndex];
              if (value !== null && value !== undefined) {
                const lineName = config.lineNamer ? 
                  config.lineNamer(lineField) : 
                  this.getDefaultLineName(lineField);
                
                tooltip += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">`;
                tooltip += `<div style="display: flex; align-items: center;">`;
                tooltip += `<div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
                  lineColors[index % lineColors.length]
                }; margin-right: 8px;"></div>`;
                tooltip += `<span>${lineName}</span>`;
                tooltip += `</div>`;
                tooltip += `<span style="font-weight: 600; margin-left: 16px;">${formatValue(value, config.format)}</span>`;
                tooltip += `</div>`;
              }
            });
          }
          
          // Show bands
          if (config.bands && config.bands.length > 0) {
            tooltip += `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(128,128,128,0.3);">`;
            tooltip += `<div style="font-weight: 600; margin-bottom: 4px;">Quantile Bands:</div>`;
            
            config.bands.forEach((band, index) => {
              const lowerValue = processedData[band.lower][dataIndex];
              const upperValue = processedData[band.upper][dataIndex];
              
              if (lowerValue !== null && upperValue !== null) {
                tooltip += `<div style="display: flex; align-items: center; margin: 2px 0; font-size: 0.9em;">`;
                tooltip += `<div style="width: 12px; height: 12px; background-color: ${
                  colors[index % colors.length]
                }; opacity: ${band.opacity || 0.2}; margin-right: 8px; border-radius: 2px;"></div>`;
                tooltip += `<span>${band.name || `Band ${index + 1}`}: ${
                  formatValue(lowerValue, config.format)
                } - ${
                  formatValue(upperValue, config.format)
                }</span>`;
                tooltip += `</div>`;
              }
            });
            
            tooltip += `</div>`;
          }
          
          return tooltip;
        }
      } : { show: false },
      
      series: series,
      
      ...(config.enableZoom ? this.getDataZoomConfig({
        ...enhancedConfig,
        isDarkMode,
        dataZoom: true
      }) : {})
    };
  }

  static processData(data, config) {
    const processedData = {};
    const xAxisData = [];
    
    // Extract x-axis data
    data.forEach(item => {
      if (item[config.xField] !== undefined) {
        xAxisData.push(item[config.xField]);
      }
    });
    
    // Extract all required fields
    const requiredFields = new Set();
    
    if (config.bands) {
      config.bands.forEach(band => {
        requiredFields.add(band.lower);
        requiredFields.add(band.upper);
      });
    }
    
    if (config.lines) {
      config.lines.forEach(line => requiredFields.add(line));
    }
    
    // Process data for each required field
    requiredFields.forEach(field => {
      processedData[field] = data.map(item => item[field] || null);
    });
    
    return { processedData, xAxisData };
  }

  static validateData(data) {
    return Array.isArray(data) && data.length > 0;
  }

  static getDefaultLineName(lineField) {
    const nameMap = {
      'q50': 'Median',
      'q25': '25th Percentile',
      'q75': '75th Percentile',
      'q10': '10th Percentile',
      'q90': '90th Percentile',
      'q05': '5th Percentile',
      'q95': '95th Percentile',
      'mean': 'Mean',
      'avg': 'Average'
    };
    
    return nameMap[lineField.toLowerCase()] || lineField;
  }
}

export default QuantileBandsChart;