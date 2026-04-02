import React, { useRef, useEffect, useState, useMemo } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import formatters from '../utils/formatters';

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
  const tableInstanceRef = useRef(null); // use ref, not state, to avoid re-render loops
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => config, [config]);

  // Filter data by search term across configured searchFields
  const filteredData = useMemo(() => {
    if (!searchTerm || !config.searchFields || config.searchFields.length === 0) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      config.searchFields.some(field => {
        const val = row[field];
        return val != null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, config.searchFields]);

  // Calculate optimal height based on data and pagination
  const calculateOptimalHeight = (data, config) => {
    if (!data || data.length === 0) return '200px';

    const paginationSize = config.paginationSize || 10;
    const headerHeight = 40;
    const rowHeight = 35;
    const paginationHeight = config.pagination !== false ? 50 : 0;

    const visibleRows = config.pagination !== false
      ? Math.min(data.length, paginationSize)
      : data.length;

    const calculatedHeight = headerHeight + (visibleRows * rowHeight) + paginationHeight;
    return Math.max(calculatedHeight + 20, 200) + 'px';
  };

  // Clean up table instance on unmount
  useEffect(() => {
    return () => {
      if (tableInstanceRef.current) {
        try {
          tableInstanceRef.current.destroy();
          tableInstanceRef.current = null;
        } catch (e) {
          console.warn('Error destroying table:', e);
        }
      }
    };
  }, []);

  // Effect 1: Create/rebuild table when structure changes (config, theme, height, format).
  // Does NOT depend on filteredData — search never triggers a rebuild.
  useEffect(() => {
    if (!tableRef.current) return;
    if (!data || data.length === 0) {
      setError('No data available for table');
      return;
    }

    try {
      setError(null);

      // Destroy existing table
      if (tableInstanceRef.current) {
        tableInstanceRef.current.destroy();
        tableInstanceRef.current = null;
      }

      const processedData = processTableData(data, memoizedConfig);
      if (!processedData || processedData.length === 0) {
        setError('No data available for table');
        return;
      }

      const columns = generateColumns(processedData, memoizedConfig, format, isDarkMode);
      const tableHeight = height === 'auto' || height === '100%'
        ? calculateOptimalHeight(processedData, memoizedConfig)
        : height;
      const tableConfig = createTableConfig(processedData, columns, memoizedConfig, isDarkMode, tableHeight);

      const newTable = new Tabulator(tableRef.current, tableConfig);

      newTable.on('tableBuilt', () => {
        if (height === 'auto' || memoizedConfig.autoResize) {
          setTimeout(() => {
            try {
              const tableElement = tableRef.current;
              const tabulatorTable = tableElement?.querySelector('.tabulator');
              if (tabulatorTable) {
                const actualHeight = tabulatorTable.scrollHeight;
                const containerHeight = tableElement.offsetHeight;
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
        setTimeout(() => {
          try { newTable.redraw(); } catch (e) { /* ignore */ }
        }, 100);
      });

      newTable.on('dataLoadError', () => setError('Failed to load table data'));
      newTable.on('tableBuildError', () => setError('Failed to build table'));

      tableInstanceRef.current = newTable;

    } catch (err) {
      console.error('TableWidget: Error creating table:', err);
      setError('Failed to create table: ' + err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, memoizedConfig, isDarkMode, height, format]);

  // Effect 2: Update table data cheaply when search filter changes.
  // Calls setData() — no DOM rebuild, no fan noise.
  useEffect(() => {
    if (!tableInstanceRef.current) return;
    try {
      const processed = processTableData(filteredData, memoizedConfig);
      tableInstanceRef.current.setData(processed);
    } catch (e) {
      console.warn('TableWidget: Error updating table data:', e);
    }
  }, [filteredData, memoizedConfig]);

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

  const showSearch = config.searchFields && config.searchFields.length > 0;

  return (
    <div className={`table-widget ${isDarkMode ? 'dark' : ''}`} style={{
      height: height === '100%' ? '100%' : 'auto',
      width: '100%',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {showSearch && (
        <div style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: isDarkMode ? '#8b949e' : '#9ca3af' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search by ${config.searchFields.join(', ')}...`}
            style={{
              flex: 1,
              maxWidth: '320px',
              padding: '6px 10px',
              fontSize: '13px',
              border: `1px solid ${isDarkMode ? '#30363d' : '#d1d5db'}`,
              borderRadius: '6px',
              background: isDarkMode ? '#161b22' : '#fff',
              color: isDarkMode ? '#e6edf3' : '#1f2937',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <span style={{
              color: isDarkMode ? '#8b949e' : '#6b7280',
              fontSize: '12px'
            }}>
              {filteredData.length} of {data.length} rows
            </span>
          )}
        </div>
      )}
      <div
        ref={tableRef}
        className={`tabulator-table modern-table ${isDarkMode ? 'tabulator-dark' : 'tabulator-light'}`}
        style={{
          height: height,
          width: '100%',
          minHeight: '200px',
          flex: 'none',
          overflow: 'auto'
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
    return config.columns
      .filter(col => {
        // When hideEmptyColumns is enabled, drop columns where every row is empty
        if (!config.hideEmptyColumns) return true;
        return data.some(row => {
          const val = row[col.field];
          return val !== null && val !== undefined && val !== 0 && val !== '';
        });
      })
      .map(col => ({
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
      height: height, // Use the provided height (not 'auto')
      layout: config.layout || 'fitColumns',
      responsiveLayout: config.responsiveLayout !== false ? 'collapse' : false,
      
      
      pagination: config.pagination !== false ? (data && data.length > 0 ? true : false) : false,
      paginationSize: config.paginationSize || 5, // Default to smaller page size
      paginationSizeSelector: config.paginationSizeSelector !== undefined ? config.paginationSizeSelector : [3, 5, 10, 20],
      paginationButtonCount: config.paginationButtonCount || 5,
      paginationInitialPage: 1, // Always start on page 1
      paginationCounter: config.paginationCounter || "rows", // Show row counter
      
      // Force pagination to show even with small datasets
      paginationElement: undefined, // Let Tabulator create pagination
      
      // Other settings - FIXED: Use selectableRows instead of selectable
      movableColumns: config.movableColumns !== false,
      resizableRows: config.resizableRows || false,
      selectableRows: config.selectableRows || config.selectable || false, // FIXED: Use selectableRows
      reactiveData: config.reactiveData !== false,
      debugInvalidOptions: false,
      
      // Ensure proper sizing
      autoResize: config.autoResize || false, // Don't auto-resize by default
      renderVerticalBuffer: 0,
      
      // Event callbacks for debugging and ensuring pagination shows
      tableBuilt: function() {
        console.log('TableWidget: Table built');
        console.log('TableWidget: Data count:', this.getDataCount());
        console.log('TableWidget: Page size:', this.getPageSize());
        console.log('TableWidget: Page max:', this.getPageMax());
        
        // Force pagination to be visible
        const paginationElement = this.element.querySelector('.tabulator-footer');
        if (paginationElement) {
          console.log('TableWidget: Pagination element found');
          paginationElement.style.display = 'flex';
          paginationElement.style.visibility = 'visible';
        } else {
          console.warn('TableWidget: Pagination element NOT found');
        }
        
        // Force redraw after a moment
        setTimeout(() => {
          this.redraw();
        }, 50);
      },
      
      paginationInitialized: function() {
        console.log('TableWidget: Pagination initialized');
        console.log('TableWidget: Current page:', this.getPage());
        console.log('TableWidget: Total pages:', this.getPageMax());
      },
      
      renderComplete: function() {
        console.log('TableWidget: Render complete');
        // Ensure pagination is visible after render
        const paginationElement = this.element.querySelector('.tabulator-footer');
        if (paginationElement) {
          paginationElement.style.display = 'flex';
        }
      }
    };
  
    // Add theme-specific styling
    if (isDarkMode) {
      const originalRenderComplete = baseConfig.renderComplete;
      baseConfig.renderComplete = function() {
        applyDarkModeStyles(this.element);
        if (originalRenderComplete) originalRenderComplete.call(this);
      };
    }
  
    // Merge with custom config, but protect critical pagination settings
    const customConfig = { ...config.tabulatorConfig };
    // Don't let custom config override our pagination settings
    delete customConfig.pagination;
    delete customConfig.paginationSize;
    delete customConfig.height; // Don't override height
    
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