import formatters from '../formatters';
import { getWatermarkConfig } from '../../config/watermark';

/**
 * ECharts utility functions
 */

/**
 * Format value using the specified formatter
 * @param {number|string} value - Value to format
 * @param {string} format - Format type
 * @returns {string} Formatted value
 */
export const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-';
  
  if (format && formatters[format]) {
    return formatters[format](value);
  }
  
  // Default formatting for numbers
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (value % 1 !== 0) {
      return value.toFixed(2);
    }
    return value.toString();
  }
  
  return String(value);
};

/**
 * Determine legend position based on data and configuration
 * @param {Object} config - Chart configuration
 * @param {Array} series - Chart series data
 * @returns {string} Legend position ('top', 'right', 'bottom', 'left')
 */
export const determineLegendPosition = (config, series) => {
  // Use explicit configuration if provided
  if (config.legendPosition) {
    return config.legendPosition;
  }

  // Default logic based on series count and names
  const seriesCount = series.length;
  const hasLongNames = series.some(s => s.name && s.name.length > 15);
  
  if (seriesCount <= 3 && !hasLongNames) {
    return 'top';
  } else if (seriesCount > 6 || hasLongNames) {
    return 'right';
  } else {
    return 'top';
  }
};

/**
 * Generate responsive grid configuration
 * @param {Object} config - Chart configuration
 * @param {string} legendPosition - Legend position
 * @returns {Object} Grid configuration
 */
export const generateGridConfig = (config, legendPosition = 'top') => {
  const baseGrid = {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '15%',
    containLabel: true
  };

  // Adjust based on legend position
  switch (legendPosition) {
    case 'top':
      baseGrid.top = '20%';
      break;
    case 'bottom':
      baseGrid.bottom = '20%';
      break;
    case 'left':
      baseGrid.left = '15%';
      break;
    case 'right':
      baseGrid.right = '15%';
      break;
    default:
      break;
  }

  // Apply custom overrides
  return {
    ...baseGrid,
    ...config.grid
  };
};

/**
 * Convert hex color to RGBA
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : hex;
};

/**
 * Default color palette
 */
export const defaultColors = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
  '#F97316'
];

/**
 * Get color from palette
 * @param {number} index - Color index
 * @param {Array} customColors - Custom color palette
 * @returns {string} Color value
 */
export const getColor = (index, customColors = null) => {
  const colors = customColors || defaultColors;
  return colors[index % colors.length];
};

/**
 * Add watermark to chart options
 * @param {Object} options - Chart options
 * @param {Object} config - Watermark configuration
 * @returns {Object} Updated chart options
 */
export const addWatermark = (options, config = {}) => {
  // Get global watermark configuration
  const globalConfig = getWatermarkConfig({
    isDarkMode: config.isDarkMode || false,
    position: config.watermarkPosition || 'bottom-right'
  });
  
  // Merge with any passed config, global config takes precedence for positioning
  const finalConfig = {
    ...config,
    ...globalConfig,
    showWatermark: config.showWatermark !== undefined ? config.showWatermark : globalConfig.showWatermark
  };

  if (!finalConfig.showWatermark) return options;

  // Create watermark graphic element
  const watermarkGraphic = {
    type: 'image',
    id: 'watermark',
    z: 1000,  // High z-index to ensure it's on top
    bounding: 'raw',
    style: {
      image: finalConfig.watermarkImage,
      width: finalConfig.watermarkSize,
      height: finalConfig.watermarkSize,
      opacity: finalConfig.watermarkOpacity
    },
    right: 10,
    // Keep watermark above simplified zoom slider to avoid collisions.
    bottom: config.hasZoom ? 28 : 10
  };

  // Add graphic to options
  if (!options.graphic) {
    options.graphic = [];
  } else if (!Array.isArray(options.graphic)) {
    options.graphic = [options.graphic];
  }
  
  // Remove any existing watermark
  options.graphic = options.graphic.filter(g => g.id !== 'watermark');
  
  // Add new watermark
  options.graphic.push(watermarkGraphic);

  return options;
};

/**
 * Generate tooltip formatter
 * @param {Object} config - Chart configuration
 * @returns {Function} Tooltip formatter function
 */
export const getTooltipFormatter = (config) => {
  return (params) => {
    if (!params) return '';
    
    const isArray = Array.isArray(params);
    const data = isArray ? params : [params];
    
    if (data.length === 0) return '';
    
    let content = `<div class="echarts-tooltip-content">`;
    
    // Add title (x-axis value)
    const title = data[0].axisValue || data[0].name;
    if (title) {
      content += `<div class="tooltip-title">${title}</div>`;
    }
    
    // Add series data
    data.forEach(item => {
      const color = item.color;
      const name = item.seriesName;
      const value = formatValue(item.value, config.format);
      
      content += `
        <div class="tooltip-item">
          <span class="tooltip-marker" style="background-color: ${color}"></span>
          <span class="tooltip-label">${name}:</span>
          <span class="tooltip-value">${value}</span>
        </div>
      `;
    });
    
    content += `</div>`;
    
    return content;
  };
};

/**
 * Generate axis configuration
 * @param {Object} config - Chart configuration
 * @param {string} axisType - Type of axis ('x' or 'y')
 * @returns {Object} Axis configuration
 */
export const generateAxisConfig = (config, axisType = 'x') => {
  const baseAxis = {
    type: 'category',
    boundaryGap: true,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#CBD5E1'
      }
    },
    axisTick: {
      show: true,
      alignWithLabel: true
    },
    axisLabel: {
      show: true,
      color: '#64748B',
      fontSize: 12
    },
    splitLine: {
      show: false
    }
  };

  // Apply axis-specific defaults
  if (axisType === 'y') {
    baseAxis.type = 'value';
    baseAxis.boundaryGap = [0, '10%'];
    baseAxis.splitLine = {
      show: true,
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.24)',
        type: 'dashed'
      }
    };
  }

  // Apply custom configuration
  return {
    ...baseAxis,
    ...(config[`${axisType}Axis`] || {})
  };
};

/**
 * Analyze data to determine chart characteristics
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 * @returns {Object} Data analysis result
 */
export const analyzeData = (data, config = {}) => {
  const analysis = {
    dataCount: data.length,
    hasData: data.length > 0,
    dateFields: [],
    numericFields: [],
    stringFields: [],
    uniqueCategories: [],
    uniqueSeries: [],
    valueRange: { min: Infinity, max: -Infinity },
    dateRange: null,
    isTimeSeries: false,
    isMultiSeries: false,
    recommendedChartType: null
  };

  if (!analysis.hasData) return analysis;

  // Analyze first few items to determine field types
  const sampleSize = Math.min(data.length, 10);
  const sampleData = data.slice(0, sampleSize);
  
  // Get all field names
  const allFields = new Set();
  sampleData.forEach(item => {
    Object.keys(item).forEach(key => allFields.add(key));
  });

  // Analyze each field
  allFields.forEach(field => {
    const values = sampleData.map(item => item[field]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return;

    const firstValue = values[0];
    
    // Check if date field
    if (typeof firstValue === 'string' || firstValue instanceof Date) {
      const date = new Date(firstValue);
      if (!isNaN(date.getTime())) {
        analysis.dateFields.push(field);
      } else {
        analysis.stringFields.push(field);
      }
    } else if (typeof firstValue === 'number') {
      analysis.numericFields.push(field);
    }
  });

  // Determine categories and series
  const categoriesSet = new Set();
  const seriesSet = new Set();
  let minDate = null;
  let maxDate = null;

  data.forEach(item => {
    // Categories (x-axis)
    if (item.date) {
      const date = new Date(item.date);
      if (!isNaN(date.getTime())) {
        minDate = minDate ? new Date(Math.min(minDate, date)) : date;
        maxDate = maxDate ? new Date(Math.max(maxDate, date)) : date;
      }
      categoriesSet.add(item.date);
    } else if (item.category) {
      categoriesSet.add(item.category);
    } else if (item.x) {
      categoriesSet.add(item.x);
    }

    // Series names
    if (item.series) {
      seriesSet.add(item.series);
    } else if (item.name) {
      seriesSet.add(item.name);
    } else if (item.label) {
      seriesSet.add(item.label);
    }

    // Value range
    const value = item.value || item.y || item.count || 0;
    if (typeof value === 'number') {
      analysis.valueRange.min = Math.min(analysis.valueRange.min, value);
      analysis.valueRange.max = Math.max(analysis.valueRange.max, value);
    }
  });

  analysis.uniqueCategories = Array.from(categoriesSet);
  analysis.uniqueSeries = Array.from(seriesSet);
  analysis.isTimeSeries = analysis.dateFields.length > 0;
  analysis.isMultiSeries = analysis.uniqueSeries.length > 1 || analysis.numericFields.length > 1;
  
  if (minDate && maxDate) {
    analysis.dateRange = { start: minDate, end: maxDate };
  }

  // Recommend chart type based on data characteristics
  if (analysis.uniqueSeries.length > 5) {
    analysis.recommendedChartType = 'line';
  } else if (analysis.uniqueCategories.length < 10) {
    analysis.recommendedChartType = 'bar';
  } else if (analysis.dateRange) {
    analysis.recommendedChartType = 'area';
  }

  return analysis;
};

/**
 * Suggest appropriate chart type based on data characteristics
 * @param {Array} data - Chart data
 * @param {Object} config - Chart configuration
 * @returns {string} Suggested chart type
 */
export const suggestChartType = (data, config = {}) => {
  // If chart type is explicitly set, use it
  if (config.chartType) {
    return config.chartType;
  }

  const analysis = analyzeData(data, config);
  
  if (!analysis.hasData) {
    return 'line'; // Default fallback
  }

  // Time series data
  if (analysis.dateRange) {
    if (analysis.uniqueSeries.length === 1) {
      return 'area';
    } else if (analysis.uniqueSeries.length > 5) {
      return 'line';
    } else {
      return 'line';
    }
  }

  // Categorical data
  if (analysis.uniqueCategories.length < 10) {
    return 'bar';
  } else if (analysis.uniqueCategories.length < 30) {
    return 'line';
  } else {
    return 'area';
  }
};

/**
 * Validate data for specific chart type
 * @param {Array} data - Chart data
 * @param {string} chartType - Chart type to validate for
 * @returns {Object} Validation result
 */
export const validateDataForChartType = (data, chartType) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  };

  if (!data || !Array.isArray(data)) {
    result.isValid = false;
    result.errors.push('Data must be an array');
    return result;
  }

  if (data.length === 0) {
    result.isValid = false;
    result.errors.push('Data array is empty');
    return result;
  }

  // Chart-specific validation
  switch (chartType) {
    case 'pie':
    case 'donut':
      // Pie charts need name and value
      data.forEach((item, index) => {
        if (!item.name && !item.label) {
          result.errors.push(`Item ${index} missing name or label`);
          result.isValid = false;
        }
        if (item.value === undefined && item.count === undefined) {
          result.errors.push(`Item ${index} missing value or count`);
          result.isValid = false;
        }
      });
      break;

    case 'sankey':
      // Sankey needs source, target, and value
      data.forEach((item, index) => {
        if (!item.source) {
          result.errors.push(`Item ${index} missing source`);
          result.isValid = false;
        }
        if (!item.target) {
          result.errors.push(`Item ${index} missing target`);
          result.isValid = false;
        }
        if (item.value === undefined) {
          result.errors.push(`Item ${index} missing value`);
          result.isValid = false;
        }
      });
      break;

    default:
      // Most charts need at least x and y values
      const firstItem = data[0];
      const hasXField = firstItem.hasOwnProperty('x') || firstItem.hasOwnProperty('date') || firstItem.hasOwnProperty('category');
      const hasYField = firstItem.hasOwnProperty('y') || firstItem.hasOwnProperty('value') || firstItem.hasOwnProperty('count');
      
      if (!hasXField && !hasYField) {
        result.warnings.push('Data may not have standard x/y fields');
      }
  }

  return result;
};
