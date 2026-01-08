import React, { useState, useEffect, useMemo } from 'react';
import MetricWidget from './MetricWidget';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

/**
 * Enhanced MetricGrid component with proper fixed row heights and global filter support
 * @param {Object} props - Component props
 * @param {Array} props.metrics - Array of metric configurations
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {Object} props.tabConfig - Tab configuration object (may contain globalFilterField)
 * @param {string} props.globalFilterValue - Currently selected global filter value
 * @param {Function} props.onGlobalFilterChange - Handler for global filter changes
 * @returns {JSX.Element} Grid component
 */
const MetricGrid = ({ metrics, isDarkMode = false, tabConfig = null, globalFilterValue = null, onGlobalFilterChange = null }) => {
  const [globalFilterOptions, setGlobalFilterOptions] = useState([]);
  const [loadingGlobalFilter, setLoadingGlobalFilter] = useState(false);
  // Process metrics to determine grid structure and row heights
  const processGridStructure = (metrics) => {
    let maxRow = 1;
    let rowHeights = {};

    // First pass: determine max row and collect height information
    metrics.forEach(metric => {
      if (metric.gridRow) {
        const rowInfo = metric.gridRow.toString();
        let rowStart, rowSpan;
        
        if (rowInfo.includes('span')) {
          const parts = rowInfo.split('/');
          rowStart = parseInt(parts[0].trim());
          rowSpan = parseInt(parts[1].trim().split('span')[1].trim());
        } else {
          rowStart = parseInt(rowInfo.trim());
          rowSpan = 1;
        }
        
        const rowEnd = rowStart + rowSpan - 1;
        maxRow = Math.max(maxRow, rowEnd);
        
        // If this is a single row item, record its height
        if (rowSpan === 1 && metric.minHeight) {
          rowHeights[rowStart] = metric.minHeight;
        }
      }
    });

    // Generate template rows with explicit heights where available
    const templateRows = [];
    for (let i = 1; i <= maxRow; i++) {
      templateRows.push(rowHeights[i] || 'auto');
    }

    return {
      maxRow,
      templateRows
    };
  };

  // Check if this tab has a global filter
  const hasGlobalFilter = tabConfig?.globalFilterField && onGlobalFilterChange;

  // Get metrics that should use the global filter
  const metricsForGlobalFilter = useMemo(() => {
    if (!hasGlobalFilter) return [];
    return metrics.filter(metric => 
      metric.enableFiltering && 
      metric.labelField === tabConfig.globalFilterField
    );
  }, [metrics, hasGlobalFilter, tabConfig?.globalFilterField]);

  // Get a single metric to use for fetching filter options (prefer "total" metrics as they're usually smaller)
  const metricForOptions = useMemo(() => {
    if (metricsForGlobalFilter.length === 0) return null;
    // Prefer a "total" metric as it's usually smaller and faster
    const totalMetric = metricsForGlobalFilter.find(m => m.id.includes('_total'));
    return totalMetric || metricsForGlobalFilter[0];
  }, [metricsForGlobalFilter]);

  // Fetch filter options from a single metric for speed (much faster than fetching all)
  useEffect(() => {
    if (!hasGlobalFilter || !metricForOptions) {
      setGlobalFilterOptions([]);
      return;
    }

    const fetchGlobalFilterOptions = async () => {
      setLoadingGlobalFilter(true);
      try {
        // Fetch from just one metric - much faster! All metrics should have the same tokens anyway
        const result = await metricsService.getMetricData(metricForOptions.id);
        
        // Extract unique values
        const allValues = new Set();
        if (result?.data && Array.isArray(result.data)) {
          result.data.forEach(item => {
            const value = item[tabConfig.globalFilterField];
            if (value) {
              allValues.add(value);
            }
          });
        }

        // Convert to sorted array
        const sortedOptions = Array.from(allValues).sort();
        setGlobalFilterOptions(sortedOptions);

        // If no filter value is set and we have options, set the first one
        // This only runs when options are first loaded, not on every filter change
        if (sortedOptions.length > 0 && onGlobalFilterChange && !globalFilterValue) {
          onGlobalFilterChange(sortedOptions[0]);
        }
      } catch (error) {
        console.error('Error fetching global filter options:', error);
        setGlobalFilterOptions([]);
      } finally {
        setLoadingGlobalFilter(false);
      }
    };

    fetchGlobalFilterOptions();
    // Only refetch when metrics change, not when filter value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGlobalFilter, metricForOptions?.id, tabConfig?.globalFilterField]);

  const { templateRows } = processGridStructure(metrics);

  const gridStyle = {
    gridTemplateRows: templateRows.join(' ')
  };

  // Capitalize and format the filter field name for display
  const getFilterFieldLabel = (fieldName) => {
    if (!fieldName) return '';
    // Convert 'token' to 'Token', 'project' to 'Project', etc.
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  return (
    <div className="metrics-grid-container">
      {/* Global filter dropdown - show immediately if tab has globalFilterField, even while loading */}
      {hasGlobalFilter && (
        <div className="global-filter-container">
          <div className="global-filter-content">
            <label className="global-filter-label" htmlFor="global-filter-select">
              Filter by {getFilterFieldLabel(tabConfig.globalFilterField)}:
            </label>
            <div className="global-filter-selector">
              {loadingGlobalFilter ? (
                <div className="global-filter-loading">
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }}></div>
                </div>
              ) : globalFilterOptions.length > 0 ? (
                <LabelSelector
                  labels={globalFilterOptions}
                  selectedLabel={globalFilterValue || globalFilterOptions[0] || ''}
                  onSelectLabel={onGlobalFilterChange}
                  labelField={tabConfig.globalFilterField}
                  idPrefix="global-filter"
                />
              ) : (
                <div className="global-filter-error">No options available</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="metrics-grid-positioned" style={gridStyle}>
        {metrics.map(metric => {
          // Create inline style for grid positioning
          const metricStyle = {};
          
          // Apply explicit grid positioning if available
          if (metric.gridRow) {
            metricStyle.gridRow = metric.gridRow;
          }
          
          if (metric.gridColumn) {
            metricStyle.gridColumn = metric.gridColumn;
          }
          
          // For multi-row spans, apply height directly to the element
          if (metric.gridRow && metric.gridRow.toString().includes('span') && metric.minHeight) {
            metricStyle.height = metric.minHeight;
          }
          
          return (
            <div 
              key={metric.id} 
              className="grid-item"
              style={metricStyle}
            >
              <MetricWidget 
                metricId={metric.id} 
                isDarkMode={isDarkMode}
                globalSelectedLabel={
                  // Only pass global filter if this metric matches the global filter field
                  hasGlobalFilter && 
                  metric.enableFiltering && 
                  metric.labelField === tabConfig.globalFilterField
                    ? (globalFilterValue || globalFilterOptions[0] || null)
                    : null
                }
                hasGlobalFilter={hasGlobalFilter && 
                  metric.enableFiltering && 
                  metric.labelField === tabConfig.globalFilterField}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGrid;