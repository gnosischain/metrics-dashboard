import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import formatters from '../utils/formatters';

const DEBUG_TABLES = import.meta.env?.VITE_DEBUG_TABLES === 'true' ||
  import.meta.env?.VITE_DEBUG_METRICS === 'true';
const tableDebug = (...args) => {
  if (DEBUG_TABLES) console.log(...args);
};

const describeFunction = (fn) => ({
  type: 'function',
  name: fn.name || 'anonymous',
});

const stableTableValue = (value) => {
  if (typeof value === 'function') return describeFunction(value);
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableTableValue);

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = stableTableValue(value[key]);
      return result;
    }, {});
};

const stableTableSignature = (value) => {
  try {
    return JSON.stringify(stableTableValue(value));
  } catch {
    return String(value);
  }
};

const summarizeColumns = (columns) => {
  if (!Array.isArray(columns)) return [];
  return columns.map((column) => stableTableValue(column));
};

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
  const tableBuiltRef = useRef(false);
  const observedSizeRef = useRef({ width: 0, height: 0 });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const configRef = useRef(config);
  const searchTermRef = useRef(searchTerm);
  const redrawTimerRef = useRef(null);
  const lastAppliedDataRef = useRef(null);

  configRef.current = config || {};
  searchTermRef.current = searchTerm;

  const redrawTable = useCallback((force = true) => {
    if (!tableInstanceRef.current || !tableBuiltRef.current) return;
    try {
      tableInstanceRef.current.redraw(force);
    } catch (e) {
      console.warn('TableWidget: Error redrawing table:', e);
    }
  }, []);

  const scheduleRedraw = useCallback((force = true, delay = 0) => {
    if (redrawTimerRef.current && typeof window !== 'undefined') {
      window.clearTimeout(redrawTimerRef.current);
      redrawTimerRef.current = null;
    }

    if (typeof window === 'undefined') {
      redrawTable(force);
      return;
    }

    redrawTimerRef.current = window.setTimeout(() => {
      redrawTimerRef.current = null;
      redrawTable(force);
    }, delay);
  }, [redrawTable]);

  const handleTableClickCapture = useCallback((event) => {
    const target = event.target;
    const copyTarget = typeof target?.closest === 'function'
      ? target.closest('.hex-copy[data-copy-value]')
      : null;

    if (!copyTarget) return;

    event.stopPropagation();
    const copyValue = copyTarget.getAttribute('data-copy-value') || '';

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      Promise.resolve(navigator.clipboard.writeText(copyValue)).catch((error) => {
        console.warn('TableWidget: Failed to copy hex value:', error);
      });
    }
  }, []);

  const syncSelectedRows = useCallback(() => {
    if (!tableInstanceRef.current || !tableBuiltRef.current) {
      return;
    }

    const currentConfig = configRef.current || {};
    const selectedRowField = currentConfig.selectedRowField;
    const selectedRowValues = Array.isArray(currentConfig.selectedRowValues)
      ? currentConfig.selectedRowValues
      : [];

    if (!selectedRowField) return;

    const normalizedSelectedValues = new Set(
      selectedRowValues
        .map((value) => (value === null || value === undefined ? null : String(value)))
        .filter(Boolean)
    );

    const rows = typeof tableInstanceRef.current.getRows === 'function'
      ? tableInstanceRef.current.getRows()
      : [];

    rows.forEach((row) => {
      const rowData = typeof row.getData === 'function' ? row.getData() : null;
      const rowValue = rowData?.[selectedRowField];
      const normalizedRowValue = rowValue === null || rowValue === undefined ? null : String(rowValue);
      const shouldBeSelected = normalizedRowValue ? normalizedSelectedValues.has(normalizedRowValue) : false;
      const isSelected = typeof row.isSelected === 'function' ? row.isSelected() : false;

      if (shouldBeSelected && !isSelected && typeof row.select === 'function') {
        row.select();
      }

      if (!shouldBeSelected && isSelected && typeof row.deselect === 'function') {
        row.deselect();
      }
    });
  }, []);

  // Filter data by search term across configured searchFields
  const searchFields = useMemo(
    () => (Array.isArray(config?.searchFields) ? config.searchFields.filter(Boolean) : []),
    [config?.searchFields]
  );
  const searchFieldsSignature = searchFields.join('|');
  const filteredData = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      searchFields.some(field => {
        const val = row[field];
        return val != null && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchFields, searchFieldsSignature]);

  const dataHasRows = useMemo(() => processTableData(data).length > 0, [data]);
  const autoColumnSignature = useMemo(() => {
    if (Array.isArray(config?.columns) && config.columns.length > 0) return '';
    const firstRow = processTableData(data)[0] || {};
    return Object.keys(firstRow).sort().join('|');
  }, [config?.columns, data]);
  const tableStructureSignature = useMemo(() => stableTableSignature({
    autoColumnSignature,
    dataHasRows,
    format,
    height,
    isDarkMode,
    columns: summarizeColumns(config?.columns),
    hideEmptyColumns: config?.hideEmptyColumns,
    indexField: config?.indexField,
    layout: config?.layout,
    responsiveLayout: config?.responsiveLayout,
    pagination: config?.pagination,
    serverPagination: config?.serverPagination === true,
    paginationSize: config?.paginationSize,
    paginationSizeSelector: config?.paginationSizeSelector,
    paginationButtonCount: config?.paginationButtonCount,
    paginationCounter: config?.paginationCounter,
    movableColumns: config?.movableColumns,
    resizableRows: config?.resizableRows,
    rowHeight: config?.rowHeight,
    selectableRows: config?.selectableRows,
    selectable: config?.selectable,
    hasRowSelectionChange: typeof config?.onRowSelectionChange === 'function',
    hasRowClick: typeof config?.onRowClick === 'function',
    autoResize: config?.autoResize,
    initialSort: config?.initialSort,
    tabulatorConfig: config?.tabulatorConfig,
  }), [
    autoColumnSignature,
    config?.autoResize,
    config?.columns,
    config?.hideEmptyColumns,
    config?.indexField,
    config?.initialSort,
    config?.layout,
    config?.movableColumns,
    config?.pagination,
    config?.paginationButtonCount,
    config?.paginationCounter,
    config?.paginationSize,
    config?.paginationSizeSelector,
    config?.responsiveLayout,
    config?.resizableRows,
    config?.rowHeight,
    config?.selectable,
    config?.selectableRows,
    config?.serverPagination,
    config?.tabulatorConfig,
    config?.onRowClick,
    config?.onRowSelectionChange,
    dataHasRows,
    format,
    height,
    isDarkMode,
  ]);
  const selectedRowsSignature = useMemo(() => stableTableSignature({
    field: config?.selectedRowField,
    values: config?.selectedRowValues || [],
  }), [config?.selectedRowField, config?.selectedRowValues]);

  // Calculate optimal height based on data and pagination
  const calculateOptimalHeight = (data, config) => {
    if (!data || data.length === 0) return '200px';

    const paginationSize = config.paginationSize || 10;
    const headerHeight = 40;
    const rowHeight = config.rowHeight || 35;
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
      if (redrawTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(redrawTimerRef.current);
        redrawTimerRef.current = null;
      }
      if (tableInstanceRef.current) {
        try {
          tableInstanceRef.current.destroy();
          tableInstanceRef.current = null;
          tableBuiltRef.current = false;
          observedSizeRef.current = { width: 0, height: 0 };
        } catch (e) {
          console.warn('Error destroying table:', e);
        }
      }
    };
  }, []);

  // Effect 1: Create/rebuild table only when structural inputs change.
  // Data and search changes are handled by the update effect below.
  useEffect(() => {
    // Always tear down the previous Tabulator instance first. If data is
    // about to clear, we must not leave stale grid DOM (including headers)
    // sitting below the empty-state message.
    if (tableInstanceRef.current) {
      try {
        tableInstanceRef.current.destroy();
      } catch (e) {
        console.warn('TableWidget: Error destroying previous table:', e);
      }
      tableInstanceRef.current = null;
      tableBuiltRef.current = false;
    }

    const currentConfig = configRef.current || {};
    const isRemote = currentConfig.serverPagination === true && typeof currentConfig.remoteDataLoader === 'function';

    if (!tableRef.current) return;
    if (!isRemote && !dataHasRows) {
      setError('No data available for table');
      return;
    }

    try {
      setError(null);

      const processedData = processTableData(filteredData, currentConfig);
      if (!isRemote && (!processedData || processedData.length === 0)) {
        setError('No data available for table');
        return;
      }

      const columns = generateColumns(processedData, currentConfig, format, isDarkMode);
      const tableHeight = height === 'auto' || height === '100%'
        ? calculateOptimalHeight(processedData, currentConfig)
        : height;
      const tableConfig = createTableConfig(processedData, columns, currentConfig, isDarkMode, tableHeight, {
        getConfig: () => configRef.current || {},
        getSearchTerm: () => searchTermRef.current,
      });

      const newTable = new Tabulator(tableRef.current, tableConfig);
      lastAppliedDataRef.current = processedData;

      newTable.on('tableBuilt', () => {
        tableBuiltRef.current = true;
        syncSelectedRows();
        if (height === 'auto' || currentConfig.autoResize) {
          setTimeout(() => {
            try {
              const tableElement = tableRef.current;
              const tabulatorTable = tableElement?.querySelector('.tabulator');
              if (tabulatorTable) {
                const actualHeight = tabulatorTable.scrollHeight;
                const containerHeight = tableElement.offsetHeight;
                if (Math.abs(actualHeight - containerHeight) > 20) {
                  tableElement.style.height = Math.min(actualHeight + 20, 600) + 'px';
                  scheduleRedraw(true, 0);
                }
              }
            } catch (e) {
              console.warn('TableWidget: Error in auto-resize:', e);
            }
          }, 100);
        }
      });

      newTable.on('dataLoadError', () => setError('Failed to load table data'));
      newTable.on('tableBuildError', () => setError('Failed to build table'));
      newTable.on('dataLoaded', () => {
        syncSelectedRows();
      });

      tableInstanceRef.current = newTable;

    } catch (err) {
      console.error('TableWidget: Error creating table:', err);
      setError('Failed to create table: ' + err.message);
    }
    // tableStructureSignature intentionally excludes row data and search text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableStructureSignature, dataHasRows, format, height, isDarkMode, scheduleRedraw, syncSelectedRows]);

  // Effect 2: Update table data cheaply when search filter changes.
  // Calls setData/replaceData: no DOM rebuild, no extra synchronous table walk.
  // Guard: only call setData after Tabulator fires `tableBuilt` to avoid
  // race conditions where the layout module is still null.
  useEffect(() => {
    if (!tableInstanceRef.current || !tableBuiltRef.current) return;
    const currentConfig = configRef.current || {};
    if (currentConfig.serverPagination === true) return;
    try {
      const processed = processTableData(filteredData, currentConfig);
      if (processed === lastAppliedDataRef.current) return;
      lastAppliedDataRef.current = processed;
      const updateData = typeof tableInstanceRef.current.replaceData === 'function'
        ? tableInstanceRef.current.replaceData.bind(tableInstanceRef.current)
        : tableInstanceRef.current.setData.bind(tableInstanceRef.current);
      Promise.resolve(updateData(processed))
        .finally(() => {
          syncSelectedRows();
          scheduleRedraw(false, 0);
        });
    } catch (e) {
      console.warn('TableWidget: Error updating table data:', e);
    }
  }, [filteredData, scheduleRedraw, syncSelectedRows]);

  useEffect(() => {
    syncSelectedRows();
  }, [syncSelectedRows, selectedRowsSignature]);

  useEffect(() => {
    if (!tableRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries.find((candidate) => candidate?.contentRect) || entries[0];
      const width = Math.round(entry?.contentRect?.width || 0);
      const measuredHeight = Math.round(entry?.contentRect?.height || 0);

      if (width <= 0 || measuredHeight <= 0) {
        return;
      }

      const previous = observedSizeRef.current;
      if (previous.width === width && previous.height === measuredHeight) {
        return;
      }

      observedSizeRef.current = { width, height: measuredHeight };
      scheduleRedraw(true, 0);
    });

    const elementsToObserve = [
      tableRef.current,
      tableRef.current.parentElement,
      tableRef.current.closest('.table-widget')
    ].filter(Boolean);

    const seen = new Set();
    elementsToObserve.forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [scheduleRedraw]);

  const showSearch = !error && searchFields.length > 0;

  return (
    <div className={`table-widget ${isDarkMode ? 'dark' : ''}`} style={{
      height: height === '100%' ? '100%' : 'auto',
      width: '100%',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column'
    }} onClickCapture={handleTableClickCapture}>
      {error && (
        <div className="table-error" style={{
          padding: '2rem',
          textAlign: 'center',
          color: isDarkMode ? '#8b949e' : '#6b7280'
        }}>
          {error}
        </div>
      )}
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
      {!error && (
        <div
          ref={tableRef}
          className={`tabulator-table modern-table ${isDarkMode ? 'tabulator-dark' : 'tabulator-light'}`}
          style={{
            height,
            width: '100%',
            minHeight: '200px',
            flex: 'none',
            overflow: 'auto'
          }}
        />
      )}
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
  // Use custom columns if provided in config (this handles your explicit column definitions)
  if (config.columns && Array.isArray(config.columns)) {
    return config.columns
      .filter(col => {
        // When hideEmptyColumns is enabled, drop columns where every row is empty
        if (!config.hideEmptyColumns) return true;
        if (!data || data.length === 0) return true;
        return data.some(row => {
          const val = row[col.field];
          return val !== null && val !== undefined && val !== 0 && val !== '';
        });
      })
      .map(col => {
        // Tabulator's `datetime` sorter requires luxon. We don't bundle luxon,
        // so requesting `datetime` raises ReferenceError mid-sort and silently
        // wipes the displayed rowset (active rows -> 0). For our YYYY-MM-DD
        // strings, plain `string` sorting is chronologically correct.
        const safeSorter = col.sorter === 'datetime' ? 'string' : (col.sorter || 'string');
        return {
          title: col.title || col.field,
          field: col.field,
          width: col.width,
          formatter: col.formatter || 'plaintext',
          headerFilter: col.headerFilter === true, // Only enable if explicitly true
          ...col, // Allow custom properties to override
          // Force the safe sorter last so the spread above can't reintroduce 'datetime'.
          sorter: safeSorter,
        };
      });
  }

  if (!data || data.length === 0) return [];

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

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
const createTableConfig = (data, columns, config, isDarkMode, height, callbacks = {}) => {
    const getConfig = typeof callbacks.getConfig === 'function'
      ? callbacks.getConfig
      : () => config;
    const getSearchTerm = typeof callbacks.getSearchTerm === 'function'
      ? callbacks.getSearchTerm
      : () => '';
    const isRemote = config.serverPagination === true && typeof config.remoteDataLoader === 'function';
    const baseConfig = {
      columns: columns,
      index: config.indexField || undefined,
      height: height, // Use the provided height (not 'auto')
      layout: config.layout || 'fitColumns',
      ...(config.responsiveLayout ? { responsiveLayout: config.responsiveLayout } : {}),
      
      
      pagination: config.pagination !== false ? (isRemote || (data && data.length > 0) ? true : false) : false,
      paginationMode: isRemote ? 'remote' : 'local',
      sortMode: isRemote ? 'remote' : 'local',
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
      rowHeight: config.rowHeight,
      selectableRows: config.selectableRows || config.selectable || false, // FIXED: Use selectableRows
      // Row-selection callback: emits the array of selected-row data up to the parent via
      // config.onRowSelectionChange. Used by explorer-style tabs to cascade a selected
      // validator/pool/etc. into the tab's secondary global filter so other charts overlay
      // per-row series on top of the aggregate. Guarded because Tabulator fires this even
      // for programmatic selections during data refresh — callback must be idempotent.
      rowSelectionChanged: config.onRowSelectionChange
        ? function(data /*, rows */) {
            try { getConfig().onRowSelectionChange?.(data || []); }
            catch (e) { console.warn('onRowSelectionChange handler threw:', e); }
          }
        : undefined,
      rowClick: config.onRowClick
        ? function(event, row) {
            try { getConfig().onRowClick?.(row.getData(), row, event); }
            catch (e) { console.warn('onRowClick handler threw:', e); }
          }
        : undefined,
      reactiveData: config.reactiveData === true,
      debugInvalidOptions: false,
      
      // Ensure proper sizing
      autoResize: config.autoResize || false, // Don't auto-resize by default
      renderVerticalBuffer: 0,
      
      // Event callbacks for debugging and ensuring pagination shows
      tableBuilt: function() {
        tableDebug('TableWidget: Table built');
        tableDebug('TableWidget: Data count:', this.getDataCount());
        tableDebug('TableWidget: Page size:', this.getPageSize());
        tableDebug('TableWidget: Page max:', this.getPageMax());

        if (config.pagination === false) {
          return;
        }
        
        // Force pagination to be visible
        const paginationElement = this.element.querySelector('.tabulator-footer');
        if (paginationElement) {
          tableDebug('TableWidget: Pagination element found');
          paginationElement.style.display = 'flex';
          paginationElement.style.visibility = 'visible';
        } else {
          tableDebug('TableWidget: Pagination element NOT found');
        }
        
      },
      
      paginationInitialized: function() {
        tableDebug('TableWidget: Pagination initialized');
        tableDebug('TableWidget: Current page:', this.getPage());
        tableDebug('TableWidget: Total pages:', this.getPageMax());
      },
      
      renderComplete: function() {
        tableDebug('TableWidget: Render complete');
        if (config.pagination === false) {
          return;
        }
        // Ensure pagination is visible after render
        const paginationElement = this.element.querySelector('.tabulator-footer');
        if (paginationElement) {
          paginationElement.style.display = 'flex';
        }
      }
    };

    if (isRemote) {
      baseConfig.ajaxURL = 'metric://server-paginated';
      baseConfig.ajaxRequestFunc = async (_url, _ajaxConfig, params = {}) => {
        const sorters = Array.isArray(params.sorters)
          ? params.sorters
          : (Array.isArray(params.sort) ? params.sort : []);
        const firstSorter = sorters[0] || {};
        const latestConfig = getConfig();
        const pageSize = params.size || latestConfig.paginationSize || 25;
        const page = params.page || 1;
        const response = await latestConfig.remoteDataLoader({
          page,
          pageSize,
          sortField: firstSorter.field || firstSorter.column,
          sortDir: firstSorter.dir,
          search: getSearchTerm(),
        });
        const rows = Array.isArray(response?.data) ? response.data : [];
        const total = Number(response?.total || rows.length || 0);
        return {
          data: rows,
          last_page: Number(response?.lastPage || Math.max(1, Math.ceil(total / pageSize))),
          last_row: total,
        };
      };
    } else {
      baseConfig.data = data;
    }
  
    // Add theme-specific styling
    if (isDarkMode) {
      const originalRenderComplete = baseConfig.renderComplete;
      baseConfig.renderComplete = function() {
        applyDarkModeStyles(this.element);
        if (originalRenderComplete) originalRenderComplete.call(this);
      };
    }
  
    // Apply initial sort if configured
    if (config.initialSort) {
      baseConfig.initialSort = config.initialSort;
    }

    // Merge with custom config, but protect critical pagination settings
    const customConfig = { ...config.tabulatorConfig };
    // Don't let custom config override our pagination settings
    delete customConfig.pagination;
    delete customConfig.paginationSize;
    delete customConfig.height; // Don't override height
    delete customConfig.reactiveData;

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
