import React, { useRef, useEffect, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import formatters from '../utils/formatter';

/**
 * TableWidget component using Tabulator with improved height handling and pagination
 * @param {Object} props - Component props
 * @param {Array|Object} props.data - Table data
 * @param {Object} props.config - Table configuration from metric definition
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {string} props.height - Table height (default: 400px)
 * @param {string} props.title - Table title
 * @param {string} props.format - Value formatter to use
 * @returns {JSX.Element} Table widget component
 */
const TableWidget = ({ 
  data = [], 
  config = {}, 
  isDarkMode = false, 
  height = '400px',
  title,
  format
}) => {
  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [error, setError] = useState(null);

  // Calculate optimal height based on data and pagination
  const calculateOptimalHeight = (data, config) => {
    if (!data || data.length === 0) return '200px';
    
    const paginationSize = config.paginationSize || 10;
    const headerHeight = 40; // Approximate header height
    const rowHeight = 35; // Approximate row height
    const paginationHeight = config.pagination !== false ? 50 : 0;
    const filterHeight = 0; // No filters since we're disabling them
    
    // Calculate rows to show (either all data or pagination size)
    const visibleRows = config.pagination !== false 
      ? Math.min(data.length, paginationSize)
      : data.length;
    
    const calculatedHeight = headerHeight + (visibleRows * rowHeight) + paginationHeight + filterHeight;
    
    // Add some padding and ensure minimum height
    return Math.max(calculatedHeight + 20, 200) + 'px';
  };

  // Clean up table instance on unmount
  useEffect(() => {
    return () => {
      if (table) {
        try {
          table.destroy();
        } catch (e) {
          console.warn('Error destroying table:', e);
        }
      }
    };
  }, [table]);

  // Main effect to create/update table
  useEffect(() => {
    if (!tableRef.current) {
      console.log('TableWidget: tableRef.current is null');
      return;
    }
    
    if (!data) {
      console.log('TableWidget: data is null/undefined');
      return;
    }

    try {
      setError(null);
      
      console.log('TableWidget: Creating table with data:', data);
      console.log('TableWidget: Config:', config);
      console.log('TableWidget: tableRef.current:', tableRef.current);
      
      // Destroy existing table if it exists
      if (table) {
        console.log('TableWidget: Destroying existing table');
        table.destroy();
      }

      // Process and validate data
      const processedData = processTableData(data, config);
      
      console.log('TableWidget: Processed data:', processedData);
      
      if (!processedData || processedData.length === 0) {
        console.log('TableWidget: No processed data available');
        setError('No data available for table');
        return;
      }

      // Generate columns configuration
      const columns = generateColumns(processedData, config, format, isDarkMode);
      
      console.log('TableWidget: Generated columns:', columns);
      
      // Calculate optimal height if height is 'auto'
      const tableHeight = height === 'auto' || height === '100%' 
        ? calculateOptimalHeight(processedData, config)
        : height;
      
      // Create table configuration with improved height handling
      const tableConfig = createTableConfig(processedData, columns, config, isDarkMode, tableHeight);
      
      console.log('TableWidget: Final table config:', tableConfig);
      
      // Create new table instance
      console.log('TableWidget: About to create Tabulator instance');
      const newTable = new Tabulator(tableRef.current, tableConfig);
      
      console.log('TableWidget: Tabulator instance created:', newTable);
      
      // Handle table built event
      newTable.on('tableBuilt', () => {
        console.log('TableWidget: Table built successfully');
        
        // Check if pagination exists
        const paginationElement = tableRef.current.querySelector('.tabulator-footer');
        if (paginationElement) {
          console.log('TableWidget: Pagination element found:', paginationElement);
        } else {
          console.warn('TableWidget: Pagination element NOT found');
        }
        
        // Auto-resize to fit content if needed
        if (height === 'auto' || config.autoResize) {
          setTimeout(() => {
            try {
              // Get actual content height
              const tableElement = tableRef.current;
              const tabulatorTable = tableElement.querySelector('.tabulator');
              
              if (tabulatorTable) {
                const actualHeight = tabulatorTable.scrollHeight;
                const containerHeight = tableElement.offsetHeight;
                
                // If there's significant difference, adjust
                if (Math.abs(actualHeight - containerHeight) > 20) {
                  tableElement.style.height = Math.min(actualHeight + 20, 600) + 'px';
                  newTable.redraw();
                }
              }
            } catch (e) {
              console.warn('TableWidget: Error in auto-resize:', e);
            }
          }, 100);
        }
        
        // Force a redraw to ensure visibility
        setTimeout(() => {
          try {
            newTable.redraw();
            console.log('TableWidget: Table redrawn');
          } catch (e) {
            console.warn('TableWidget: Error redrawing table:', e);
          }
        }, 100);
      });

      // Handle pagination events
      newTable.on('paginationInitialized', () => {
        console.log('TableWidget: Pagination initialized');
      });

      // Handle table errors
      newTable.on('dataLoadError', (error) => {
        console.error('TableWidget: Table data load error:', error);
        setError('Failed to load table data');
      });

      // Handle table build error
      newTable.on('tableBuildError', (error) => {
        console.error('TableWidget: Table build error:', error);
        setError('Failed to build table');
      });

      setTable(newTable);
      
    } catch (error) {
      console.error('TableWidget: Error creating table:', error);
      setError('Failed to create table: ' + error.message);
    }
  }, [data, config, isDarkMode, height, format]);

  if (error) {
    return (
      <div className="table-error" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: isDarkMode ? '#CF222E' : '#D73A49'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div className="table-widget" style={{ 
      height: '100%', 
      width: '100%', 
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div 
        ref={tableRef} 
        className={`tabulator-table ${isDarkMode ? 'tabulator-dark' : 'tabulator-light'}`}
        style={{ 
          height: height === 'auto' ? 'auto' : height,
          width: '100%',
          minHeight: '200px',
          flex: height === '100%' ? '1' : 'none'
        }}
      />
    </div>
  );
};

/**
 * Process raw data for table display
 * @param {Array|Object} data - Raw data
 * @param {Object} config - Table configuration
 * @returns {Array} Processed data array
 */
const processTableData = (data, config) => {
  if (!data) return [];

  // Handle different data formats
  if (Array.isArray(data)) {
    return data;
  }

  // Handle Chart.js format data
  if (data.labels && data.datasets) {
    const result = [];
    data.labels.forEach((label, index) => {
      const row = { label };
      data.datasets.forEach(dataset => {
        row[dataset.label || `dataset_${dataset.label}`] = dataset.data[index];
      });
      result.push(row);
    });
    return result;
  }

  // Handle single object
  if (typeof data === 'object') {
    return [data];
  }

  return [];
};

/**
 * Generate column definitions from data with proper filter handling
 * @param {Array} data - Processed data
 * @param {Object} config - Table configuration
 * @param {string} format - Value formatter
 * @param {boolean} isDarkMode - Dark mode flag
 * @returns {Array} Column definitions
 */
const generateColumns = (data, config, format, isDarkMode) => {
  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  
  // Use custom columns if provided in config (this handles your explicit column definitions)
  if (config.columns && Array.isArray(config.columns)) {
    return config.columns.map(col => ({
      title: col.title || col.field,
      field: col.field,
      width: col.width,
      sorter: col.sorter || 'string',
      formatter: col.formatter || 'plaintext',
      headerFilter: col.headerFilter === true, // Only enable if explicitly true
      ...col // Allow custom properties to override
    }));
  }

  // Auto-generate columns from data (fallback)
  return keys.map(key => ({
    title: formatColumnTitle(key),
    field: key,
    sorter: inferColumnType(firstRow[key]),
    formatter: getColumnFormatter(inferColumnFormatter(key, firstRow[key]), format),
    headerFilter: config.enableFiltering === true, // Only enable if explicitly true
    width: getColumnWidth(key, firstRow[key])
  }));
};

/**
 * Create table configuration object with improved pagination handling
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {Object} config - Table config
 * @param {boolean} isDarkMode - Dark mode flag
 * @param {string} height - Table height
 * @returns {Object} Tabulator configuration
 */
const createTableConfig = (data, columns, config, isDarkMode, height) => {
  const baseConfig = {
    data: data,
    columns: columns,
    height: height === 'auto' ? 'auto' : height,
    layout: config.layout || 'fitColumns',
    responsiveLayout: config.responsiveLayout !== false ? 'collapse' : false,
    
    // Pagination settings - make sure these are explicit and can't be overridden
    pagination: config.pagination !== false ? true : false,
    paginationSize: config.paginationSize || 10,
    paginationSizeSelector: config.paginationSizeSelector || [5, 10, 20, 50],
    paginationButtonCount: config.paginationButtonCount || 5,
    
    // Other settings
    movableColumns: config.movableColumns !== false,
    resizableRows: config.resizableRows || false,
    selectable: config.selectable || false,
    reactiveData: true,
    debugInvalidOptions: false,
    
    // Optimize for pagination
    autoResize: config.autoResize || false,
    renderVerticalBuffer: config.renderVerticalBuffer || 0,
    
    // Ensure pagination renders properly
    paginationElement: undefined, // Let Tabulator create its own pagination element
    
    // Event callbacks for debugging
    paginationInitialized: function() {
      console.log('TableWidget: Pagination initialized with size:', this.getPageSize());
      console.log('TableWidget: Total pages:', this.getPageMax());
    },
    
    tableBuilt: function() {
      console.log('TableWidget: Table built, total rows:', this.getDataCount());
      const paginationElement = this.element.querySelector('.tabulator-footer');
      if (paginationElement) {
        console.log('TableWidget: Pagination element found and visible');
        paginationElement.style.display = 'flex'; // Force visibility
      } else {
        console.warn('TableWidget: Pagination element NOT found');
      }
    }
  };

  // Add theme-specific styling
  if (isDarkMode) {
    baseConfig.renderComplete = function() {
      applyDarkModeStyles(this.element);
    };
  }

  // Merge with custom config, but protect critical pagination settings
  const customConfig = { ...config.tabulatorConfig };
  // Don't let custom config override our pagination settings
  delete customConfig.pagination;
  delete customConfig.paginationSize;
  delete customConfig.paginationSizeSelector;
  
  return { ...baseConfig, ...customConfig };
};

/**
 * Get formatter function for column
 * @param {string} formatterName - Name of formatter to use
 * @param {string} defaultFormat - Default format from metric config
 * @returns {string|Function} Column formatter
 */
const getColumnFormatter = (formatterName, defaultFormat) => {
  if (!formatterName && !defaultFormat) return 'plaintext';
  
  const formatToUse = formatterName || defaultFormat;
  
  // Check if it's a built-in Tabulator formatter
  const tabulatorFormatters = ['money', 'star', 'traffic', 'progress', 'tickCross', 'color', 'datetime', 'datetimediff', 'link', 'image', 'html', 'plaintext'];
  if (tabulatorFormatters.includes(formatToUse)) {
    return formatToUse;
  }
  
  // Use custom formatter from our utils
  if (formatters[formatToUse]) {
    return function(cell) {
      const value = cell.getValue();
      return formatters[formatToUse](value);
    };
  }
  
  return 'plaintext';
};

/**
 * Utility functions for column generation
 */
const formatColumnTitle = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const inferColumnType = (value) => {
  if (typeof value === 'number') return 'number';
  if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  return 'string';
};

const inferColumnFormatter = (key, value) => {
  const keyLower = key.toLowerCase();
  
  // Don't use datetime formatter since it requires Luxon - use plaintext instead
  if (keyLower.includes('date') || keyLower.includes('time')) return 'plaintext';
  if (keyLower.includes('price') || keyLower.includes('cost')) return 'formatNumber';
  if (keyLower.includes('percent') || keyLower.includes('pct')) return 'formatPercentage';
  if (keyLower.includes('byte') || keyLower.includes('size')) return 'formatBytes';
  if (keyLower.includes('duration')) return 'formatDuration';
  if (typeof value === 'number') return 'formatNumber';
  
  return null;
};

const getColumnWidth = (key, value) => {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes('id')) return 100;
  if (keyLower.includes('date') || keyLower.includes('time')) return 150;
  if (keyLower.includes('name') || keyLower.includes('title')) return 200;
  if (typeof value === 'number') return 120;
  
  return undefined; // Auto width
};

/**
 * Apply dark mode styles to table element
 * @param {HTMLElement} element - Table element
 */
const applyDarkModeStyles = (element) => {
  if (!element) return;
  
  // Add dark mode class to table
  element.classList.add('tabulator-dark-theme');
  
  // Ensure pagination is visible in dark mode
  const paginationElement = element.querySelector('.tabulator-footer');
  if (paginationElement) {
    paginationElement.style.display = 'flex';
  }
};

export default TableWidget;