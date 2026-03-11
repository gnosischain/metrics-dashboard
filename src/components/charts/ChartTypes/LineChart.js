import { BaseChart } from './BaseChart';

export class LineChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    console.log('LineChart.getOptions called with:', { 
      dataLength: data?.length, 
      configFields: { xField: config.xField, yField: config.yField, seriesField: config.seriesField }
    });
    
    if (!this.validateData(data)) {
      console.log('LineChart: Data validation failed');
      return this.getEmptyChartOptions(isDarkMode);
    }

    try {
      const processedData = this.processData(data, config);
      console.log('LineChart: Processed data result:', {
        categoriesLength: processedData.categories?.length,
        seriesCount: processedData.series?.length,
        seriesNames: processedData.series?.map(s => s.name)
      });
      
      // Analyze time granularity for smart formatting
      const timeAnalysis = BaseChart.analyzeTimeGranularity(processedData.categories);
      console.log('LineChart: Time analysis:', timeAnalysis);
      
      // Add time context to config
      const enhancedConfig = {
        ...config,
        timeContext: timeAnalysis
      };
      
      const colors = this.resolveSeriesPalette(enhancedConfig, processedData.series.length, isDarkMode);

      const chartOptions = {
        ...this.getBaseOptions(isDarkMode),
        
        xAxis: {
          type: 'category',
          data: processedData.categories,
          ...this.getAxisConfig(isDarkMode, 'category', enhancedConfig)
        },
        
        yAxis: {
          type: 'value',
          ...this.getAxisConfig(isDarkMode, 'value', enhancedConfig)
        },
        
        series: processedData.series.map((series, index) => {
          const colorIdx = index;
          const seriesOpts = {
            name: series.name,
            type: 'line',
            data: series.data,
            smooth: config.smooth || false,
            symbol: 'circle',
            symbolSize: config.symbolSize || 4,
            lineStyle: {
              width: config.lineWidth || 2,
              color: colors[colorIdx]
            },
            itemStyle: {
              color: colors[colorIdx]
            },
            connectNulls: false
          };

          if (config.seriesStyleMap) {
            const metricLabel = series._metricLabel || series.name;
            for (const [pattern, style] of Object.entries(config.seriesStyleMap)) {
              if (metricLabel === pattern || series.name.includes(pattern)) {
                if (style.color) {
                  seriesOpts.lineStyle.color = style.color;
                  seriesOpts.itemStyle.color = style.color;
                }
                Object.assign(seriesOpts.lineStyle, style.lineStyle || {});
                if (style.symbolSize !== undefined) seriesOpts.symbolSize = style.symbolSize;
                break;
              }
            }
          }

          return seriesOpts;
        }),
        
        tooltip: {
          ...this.getTooltipConfig({ ...enhancedConfig, isDarkMode }),
          formatter: BaseChart.createTimeSeriesAwareTooltipFormatter(enhancedConfig)
        },
        
        legend: this.getLegendConfig(isDarkMode, processedData.series.length, enhancedConfig),
        
        // UNIVERSAL grid configuration - same for all chart types
        grid: this.getGridConfig(enhancedConfig),
        
        // UNIVERSAL zoom configuration - same for all chart types
        ...this.getDataZoomConfig(enhancedConfig)
      };

      console.log('LineChart: Final chart options created successfully');
      return chartOptions;
    } catch (error) {
      console.error('LineChart: Error in getOptions:', error);
      return this.getEmptyChartOptions(isDarkMode);
    }
  }

  static validateData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return false;
    }
    
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      return false;
    }
    
    return true;
  }

  static processData(data, config) {
    console.log('LineChart.processData called with data length:', data.length);

    if (!Array.isArray(data)) {
        throw new Error('Line chart data must be an array');
    }

    const { xField = 'date', yField = 'value', seriesField = null, multiYFields = null } = config;
    const firstItem = data[0] || {};
    const availableFields = Object.keys(firstItem);

    const actualXField = this.findBestField(availableFields, xField, ['date', 'time', 'timestamp', 'x']);
    const actualYField = this.findBestField(availableFields, yField, ['value', 'y', 'count', 'amount', 'apy']);
    const actualSeriesField = seriesField ? this.findBestField(availableFields, seriesField, ['label', 'series', 'category', 'group']) : null;

    console.log('LineChart.processData: Field mapping:', { actualXField, actualYField, actualSeriesField });

    const categories = [...new Set(data.map(item => item[actualXField]))]
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA - dateB;
        }
        return String(a).localeCompare(String(b));
      });
    
    console.log('LineChart.processData: Categories extracted:', categories.length);

    let processedSeries = [];

    if (multiYFields && actualSeriesField) {
        // Multi-Y-field mode: for each series group, create one series per yField
        console.log('LineChart.processData: Processing multi-Y-field data');

        const seriesGroups = {};
        data.forEach(item => {
            const groupName = item[actualSeriesField] || 'Unnamed';
            if (!seriesGroups[groupName]) seriesGroups[groupName] = {};
            seriesGroups[groupName][item[actualXField]] = item;
        });

        const groupNames = Object.keys(seriesGroups);
        const singleGroup = groupNames.length === 1;

        Object.entries(seriesGroups).forEach(([groupName, dateMap]) => {
            multiYFields.forEach(yDef => {
                const seriesData = categories.map(cat => {
                    const row = dateMap[cat];
                    if (!row) return null;
                    const raw = row[yDef.field];
                    if (raw === null || raw === undefined) return null;
                    const num = typeof raw === 'number' ? raw : parseFloat(raw);
                    return isNaN(num) ? null : num;
                });
                const label = yDef.label || yDef.suffix || yDef.field;
                const name = singleGroup ? label : `${groupName} — ${label}`;
                processedSeries.push({
                    name,
                    data: seriesData,
                    _group: groupName,
                    _metricLabel: label
                });
            });
        });
    } else if (actualSeriesField) {
        console.log('LineChart.processData: Processing multi-series data');
        
        const seriesGroups = {};
        data.forEach(item => {
            const seriesName = item[actualSeriesField] || 'Unnamed Series';
            if (!seriesGroups[seriesName]) {
                seriesGroups[seriesName] = {};
            }
            seriesGroups[seriesName][item[actualXField]] = item[actualYField];
        });
        
        console.log('LineChart.processData: Series groups found:', Object.keys(seriesGroups));

        processedSeries = Object.entries(seriesGroups).map(([seriesName, dataMap]) => {
            const seriesData = categories.map(category => {
                const rawValue = dataMap[category];
                if (rawValue === null || rawValue === undefined) return null;
                
                const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
                return isNaN(numValue) ? null : numValue;
            });
            
            return { name: seriesName, data: seriesData };
        });
    } else {
        console.log('LineChart.processData: Processing single-series data');
        const seriesName = config.seriesName || actualYField || 'Value';
        
        const dataMap = {};
        data.forEach(item => {
            dataMap[item[actualXField]] = item[actualYField];
        });
        
        const seriesData = categories.map(category => {
            const rawValue = dataMap[category];
            if (rawValue === null || rawValue === undefined) return null;
            
            const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
            return isNaN(numValue) ? null : numValue;
        });
        
        processedSeries = [{ name: seriesName, data: seriesData }];
    }

    const result = { categories, series: processedSeries };
    console.log('LineChart.processData: Final result:', {
        categoriesLength: result.categories.length,
        seriesCount: result.series.length,
        seriesNames: result.series.map(s => s.name),
        firstSeriesDataLength: result.series[0]?.data?.length
    });
    
    return result;
  }
  
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
