import formatters from '../formatters';

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
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Generate axis configuration
 * @param {string} type - Axis type ('category', 'value', 'time')
 * @param {Object} config - Axis configuration
 * @param {boolean} isDarkMode - Dark mode flag
 * @returns {Object} Axis configuration
 */
export const generateAxisConfig = (type, config = {}, isDarkMode = false) => {
  const baseConfig = {
    type: type,
    axisLine: {
      lineStyle: {
        color: isDarkMode ? '#444' : '#ddd'
      }
    },
    axisLabel: {
      color: isDarkMode ? '#ccc' : '#666'
    },
    splitLine: {
      lineStyle: {
        color: isDarkMode ? '#333' : '#f0f0f0',
        type: 'dashed'
      }
    }
  };

  if (type === 'value') {
    baseConfig.axisLabel.formatter = (value) => formatValue(value, config.format);
  }

  return {
    ...baseConfig,
    ...config
  };
};

/**
 * Detect data type and structure
 * @param {Array|Object} data - Chart data
 * @returns {Object} Data analysis result
 */
export const analyzeData = (data) => {
  if (!data) {
    return { type: 'empty', fields: [], structure: 'none' };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { type: 'empty', fields: [], structure: 'array' };
    }

    const firstItem = data[0];
    
    if (typeof firstItem === 'object' && firstItem !== null) {
      const fields = Object.keys(firstItem);
      const dateFields = fields.filter(field => 
        ['date', 'time', 'timestamp', 'created_at', 'updated_at'].includes(field.toLowerCase()) ||
        (typeof firstItem[field] === 'string' && !isNaN(Date.parse(firstItem[field])))
      );
      const numericFields = fields.filter(field => typeof firstItem[field] === 'number');
      const stringFields = fields.filter(field => typeof firstItem[field] === 'string' && !dateFields.includes(field));

      return {
        type: 'object_array',
        fields,
        dateFields,
        numericFields,
        stringFields,
        structure: 'tabular',
        isTimeSeries: dateFields.length > 0,
        isMultiSeries: numericFields.length > 1
      };
    } else {
      return {
        type: 'primitive_array',
        fields: [],
        structure: 'list',
        dataType: typeof firstItem
      };
    }
  }

  if (typeof data === 'object') {
    // Check for special structures
    if (data.nodes && data.links) {
      return { type: 'graph', fields: ['nodes', 'links'], structure: 'network' };
    }
    if (data.children || data.name) {
      return { type: 'hierarchy', fields: Object.keys(data), structure: 'tree' };
    }
    
    return { type: 'object', fields: Object.keys(data), structure: 'key_value' };
  }

  return { type: 'primitive', fields: [], structure: 'single' };
};

/**
 * Auto-detect appropriate chart type based on data
 * @param {Array|Object} data - Chart data
 * @param {Object} config - Configuration hints
 * @returns {string} Suggested chart type
 */
export const suggestChartType = (data, config = {}) => {
  const analysis = analyzeData(data);

  // Explicit type in config takes precedence
  if (config.chartType) {
    return config.chartType;
  }

  // Based on data structure
  switch (analysis.structure) {
    case 'network':
      return analysis.type === 'graph' ? 'sankey' : 'graph';
    case 'tree':
      return 'sunburst';
    case 'key_value':
      return 'pie';
    case 'tabular':
      if (analysis.isTimeSeries) {
        return analysis.isMultiSeries ? 'line' : 'line';
      } else {
        return analysis.numericFields.length > 1 ? 'bar' : 'bar';
      }
    case 'list':
      return 'bar';
    default:
      return 'line';
  }
};

/**
 * Validate data for specific chart type
 * @param {Array|Object} data - Chart data
 * @param {string} chartType - Target chart type
 * @returns {Object} Validation result
 */
export const validateDataForChartType = (data, chartType) => {
  const analysis = analyzeData(data);
  
  const validationRules = {
    line: () => analysis.structure === 'tabular' || analysis.structure === 'list',
    area: () => analysis.structure === 'tabular' || analysis.structure === 'list',
    bar: () => analysis.structure === 'tabular' || analysis.structure === 'list' || analysis.structure === 'key_value',
    pie: () => analysis.structure === 'key_value' || (analysis.structure === 'tabular' && analysis.numericFields.length >= 1),
    sankey: () => analysis.structure === 'network' || (analysis.structure === 'tabular' && analysis.fields.includes('source') && analysis.fields.includes('target')),
    radar: () => analysis.structure === 'tabular' && analysis.numericFields.length >= 3,
    boxplot: () => analysis.structure === 'tabular' && analysis.numericFields.length >= 1,
    heatmap: () => analysis.structure === 'tabular' && analysis.numericFields.length >= 1,
    graph: () => analysis.structure === 'network',
    sunburst: () => analysis.structure === 'tree' || analysis.structure === 'tabular'
  };

  const isValid = validationRules[chartType] ? validationRules[chartType]() : false;
  
  return {
    valid: isValid,
    analysis: analysis,
    suggestions: isValid ? [] : [suggestChartType(data)]
  };
};

const chartUtils = {
  formatValue,
  determineLegendPosition,
  generateGridConfig,
  hexToRgba,
  generateAxisConfig,
  analyzeData,
  suggestChartType,
  validateDataForChartType
};

export default chartUtils;