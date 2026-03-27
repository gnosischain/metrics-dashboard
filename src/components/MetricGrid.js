import React, { useState, useEffect, useMemo, useRef } from 'react';
import MetricWidget from './MetricWidget';
import GlobalFilterWidget from './GlobalFilterWidget';
import metricsService from '../services/metrics';
import { getDateRange } from '../utils';

/**
 * Enhanced MetricGrid component with proper fixed row heights and shared
 * global-control support. Tabs can render the global filter bundle either
 * inside the grid (`global_filter` pseudo-metric) or in the top toolbar.
 */
const MetricGrid = ({
  metrics,
  isDarkMode = false,
  tabConfig = null,
  globalFilterValue = null,
  onGlobalFilterChange = null,
  dashboardPalette = null
}) => {
  const [globalFilterOptions, setGlobalFilterOptions] = useState([]);
  const [loadingGlobalFilter, setLoadingGlobalFilter] = useState(false);
  const globalFilterValueRef = useRef(globalFilterValue);
  
  // Unit toggle state (Native/USD)
  const [selectedUnit, setSelectedUnit] = useState(tabConfig?.defaultUnit || 'native');
  const hasUnitToggle = tabConfig?.unitToggle === true;
  const globalControlsPlacement = tabConfig?.globalControlsPlacement || 'grid';

  // Whether per-chart resolution toggles are enabled for this tab
  const hasResolutionToggle = tabConfig?.resolutionToggle === true;

  // Global time range — only when explicitly enabled in tab YAML (timeRanges: true)
  // Per-widget range buttons handle individual charts automatically
  const DEFAULT_TIME_RANGES = ['1M', '3M', '6M', '1Y', '2Y', 'ALL'];
  const timeRanges = Array.isArray(tabConfig?.timeRanges) ? tabConfig.timeRanges
    : tabConfig?.timeRanges === true ? DEFAULT_TIME_RANGES
    : null;
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    tabConfig?.defaultTimeRange || 'ALL'
  );

  useEffect(() => {
    setSelectedUnit(tabConfig?.defaultUnit || 'native');
  }, [tabConfig?.id, tabConfig?.defaultUnit]);

  useEffect(() => {
    setSelectedTimeRange(tabConfig?.defaultTimeRange || 'ALL');
  }, [tabConfig?.id, tabConfig?.defaultTimeRange]);

  // Keep a ref of the latest global filter value to avoid stale-closure overwrites
  useEffect(() => {
    globalFilterValueRef.current = globalFilterValue;
  }, [globalFilterValue]);

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
  const hasGlobalFilter = !!(tabConfig?.globalFilterField && onGlobalFilterChange);
  const showTopGlobalControls = globalControlsPlacement === 'top' && (hasGlobalFilter || hasUnitToggle);
  const showToolbar = !!timeRanges || showTopGlobalControls;
  const positionedMetrics = useMemo(
    () => (globalControlsPlacement === 'top' ? metrics.filter(metric => metric.id !== 'global_filter') : metrics),
    [metrics, globalControlsPlacement]
  );

  // Real metrics (excluding the global_filter pseudo-metric) for filter option fetching
  const realMetrics = useMemo(() => metrics.filter(m => m.id !== 'global_filter'), [metrics]);

  // Get metrics that can provide global filter options
  // Priority: 1) Metrics with explicit globalFilterField config matching tab's globalFilterField
  //           2) Metrics where labelField matches globalFilterField (backwards compatible)
  //           3) Metrics with enableFiltering that have globalFilterField in their data (fallback)
  const metricsForGlobalFilter = useMemo(() => {
    if (!hasGlobalFilter) return [];
    const globalField = tabConfig.globalFilterField;
    
    // First try: metrics with explicit globalFilterField config
    const explicitMatch = realMetrics.filter(m => m.globalFilterField === globalField);
    if (explicitMatch.length > 0) return explicitMatch;
    
    // Second try: metrics where labelField matches (backwards compatible)
    const labelFieldMatch = realMetrics.filter(m => m.enableFiltering && m.labelField === globalField);
    if (labelFieldMatch.length > 0) return labelFieldMatch;
    
    // Fallback: any filterable metric (may have the field in data even if labelField differs)
    return realMetrics.filter(m => m.enableFiltering);
  }, [realMetrics, hasGlobalFilter, tabConfig?.globalFilterField]);

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
      setLoadingGlobalFilter(false);
      return;
    }

    let cancelled = false;

    const fetchGlobalFilterOptions = async () => {
      // Clear previous context options immediately to avoid cross-tab stale values.
      setGlobalFilterOptions([]);
      setLoadingGlobalFilter(true);
      try {
        // Fetch from just one metric - much faster! All metrics should have the same tokens anyway
        const { from, to } = getDateRange('90d');
        const result = await metricsService.getMetricData(metricForOptions.id, { from, to });

        if (cancelled) {
          return;
        }
        
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

        // Ensure selected filter is valid for the current tab options.
        const latestValue = globalFilterValueRef.current;
        if (!onGlobalFilterChange) {
          return;
        }

        if (sortedOptions.length === 0) {
          if (latestValue) {
            onGlobalFilterChange(null);
          }
          return;
        }

        if (!latestValue || !sortedOptions.includes(latestValue)) {
          onGlobalFilterChange(sortedOptions[0]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching global filter options:', error);
          setGlobalFilterOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGlobalFilter(false);
        }
      }
    };

    fetchGlobalFilterOptions();
    return () => {
      cancelled = true;
    };
    // Only refetch when metrics change, not when filter value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGlobalFilter, metricForOptions?.id, tabConfig?.globalFilterField]);

  const { templateRows } = processGridStructure(positionedMetrics);

  const gridStyle = {
    gridTemplateRows: templateRows.join(' ')
  };

  const globalFilterWidgetProps = {
    tabConfig,
    globalFilterOptions,
    globalFilterValue,
    onGlobalFilterChange,
    loadingGlobalFilter,
    hasUnitToggle,
    selectedUnit,
    onUnitChange: setSelectedUnit
  };

  return (
    <div className="metrics-grid-container">
      {showToolbar && (
        <div className="metrics-grid-toolbar">
          {timeRanges && (
            <div className="metrics-grid-toolbar-group">
              <div className="metrics-grid-toolbar-label">Date range</div>
              <div className="resolution-toggle">
                {timeRanges.map(range => (
                  <button
                    key={range}
                    type="button"
                    className={`resolution-btn${selectedTimeRange === range ? ' active' : ''}`}
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showTopGlobalControls && (
            <GlobalFilterWidget
              {...globalFilterWidgetProps}
              placement="top"
            />
          )}
        </div>
      )}
      <div className="metrics-grid-positioned" style={gridStyle}>
        {positionedMetrics.map(metric => {
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

          // Render the in-grid global filter widget
          if (metric.id === 'global_filter') {
            return (
              <div
                key={metric.id}
                className="grid-item grid-item-filter"
                style={metricStyle}
              >
                <GlobalFilterWidget
                  {...globalFilterWidgetProps}
                  placement="grid"
                />
              </div>
            );
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
                dashboardPalette={dashboardPalette}
                globalSelectedLabel={
                  hasGlobalFilter && 
                  metric.enableFiltering && 
                  metric.labelField === tabConfig.globalFilterField
                    ? (globalFilterValue || globalFilterOptions[0] || null)
                    : null
                }
                hasGlobalFilter={hasGlobalFilter && (
                  (metric.enableFiltering && metric.labelField === tabConfig.globalFilterField) ||
                  (metric.globalFilterField === tabConfig.globalFilterField)
                )}
                globalFilterField={tabConfig?.globalFilterField}
                globalFilterValue={globalFilterValue || globalFilterOptions[0] || null}
                selectedUnit={hasUnitToggle && !metric.unitFieldGroups ? selectedUnit : null}
                enableResolutionToggle={hasResolutionToggle}
                enableUnitToggle={!!metric.unitFieldGroups || (!hasUnitToggle && !!(metric.unitFilterField || metric.unitFields))}
                globalTimeRange={timeRanges ? selectedTimeRange : null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGrid;
