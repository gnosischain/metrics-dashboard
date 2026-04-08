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
  secondaryGlobalFilterValue = null,
  onSecondaryGlobalFilterChange = null,
  dashboardPalette = null
}) => {
  const [globalFilterOptions, setGlobalFilterOptions] = useState([]);
  const [loadingGlobalFilter, setLoadingGlobalFilter] = useState(false);
  const globalFilterValueRef = useRef(globalFilterValue);
  const [secondaryGlobalFilterOptions, setSecondaryGlobalFilterOptions] = useState([]);
  const [loadingSecondaryGlobalFilter, setLoadingSecondaryGlobalFilter] = useState(false);
  const secondaryGlobalFilterValueRef = useRef(secondaryGlobalFilterValue);
  
  // Tab-group toggle state: { groupName: activeMetricId }
  const [tabGroupSelections, setTabGroupSelections] = useState({});

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

  // Keep refs of latest filter values to avoid stale-closure overwrites
  useEffect(() => {
    globalFilterValueRef.current = globalFilterValue;
  }, [globalFilterValue]);

  useEffect(() => {
    secondaryGlobalFilterValueRef.current = secondaryGlobalFilterValue;
  }, [secondaryGlobalFilterValue]);

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

  // Secondary global filter support (cascading from primary)
  const hasSecondaryGlobalFilter = !!(tabConfig?.secondaryGlobalFilterField && onSecondaryGlobalFilterChange);

  const metricForSecondaryOptions = useMemo(() => {
    if (!hasSecondaryGlobalFilter) return null;
    const secondaryField = tabConfig.secondaryGlobalFilterField;
    const candidates = realMetrics.filter(m => m.enableFiltering && m.labelField === secondaryField);
    if (candidates.length === 0) return null;
    const totalMetric = candidates.find(m => m.id.includes('_total'));
    return totalMetric || candidates[0];
  }, [realMetrics, hasSecondaryGlobalFilter, tabConfig?.secondaryGlobalFilterField]);

  // Fetch secondary filter options from a single representative metric — re-runs when the primary filter changes (the cascade)
  useEffect(() => {
    if (!hasSecondaryGlobalFilter || !metricForSecondaryOptions) {
      setSecondaryGlobalFilterOptions([]);
      setLoadingSecondaryGlobalFilter(false);
      return;
    }

    let cancelled = false;

    const fetchSecondaryOptions = async () => {
      setSecondaryGlobalFilterOptions([]);
      setLoadingSecondaryGlobalFilter(true);
      try {
        const { from, to } = getDateRange('90d');
        const params = { from, to };
        if (globalFilterValue && tabConfig.globalFilterField) {
          params.filterField = tabConfig.globalFilterField;
          params.filterValue = globalFilterValue;
        }
        const result = await metricsService.getMetricData(metricForSecondaryOptions.id, params);

        if (cancelled) return;

        const allValues = new Set();
        if (result?.data && Array.isArray(result.data)) {
          result.data.forEach(item => {
            const value = item[tabConfig.secondaryGlobalFilterField];
            if (value) allValues.add(value);
          });
        }

        const sortedOptions = Array.from(allValues).sort();
        setSecondaryGlobalFilterOptions(sortedOptions);

        const latestValue = secondaryGlobalFilterValueRef.current;
        if (!onSecondaryGlobalFilterChange) return;

        if (sortedOptions.length === 0) {
          if (latestValue) onSecondaryGlobalFilterChange(null);
          return;
        }

        if (!latestValue || !sortedOptions.includes(latestValue)) {
          onSecondaryGlobalFilterChange(sortedOptions[0]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching secondary filter options:', error);
          setSecondaryGlobalFilterOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingSecondaryGlobalFilter(false);
      }
    };

    fetchSecondaryOptions();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSecondaryGlobalFilter, metricForSecondaryOptions?.id, tabConfig?.secondaryGlobalFilterField, globalFilterValue]);

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

  // Build tab groups: { groupName: [metric, metric, ...] } preserving order
  const tabGroups = useMemo(() => {
    const groups = {};
    positionedMetrics.forEach(metric => {
      if (metric.tabGroup) {
        if (!groups[metric.tabGroup]) groups[metric.tabGroup] = [];
        groups[metric.tabGroup].push(metric);
      }
    });
    return groups;
  }, [positionedMetrics]);

  // Deduplicated list for grid rendering: one entry per tab group (first metric), plus all ungrouped
  const renderedMetrics = useMemo(() => {
    const seenGroups = new Set();
    return positionedMetrics.filter(metric => {
      if (!metric.tabGroup) return true;
      if (seenGroups.has(metric.tabGroup)) return false;
      seenGroups.add(metric.tabGroup);
      return true;
    });
  }, [positionedMetrics]);

  const { templateRows } = processGridStructure(renderedMetrics);

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

  const renderMetricWidget = (metric, extraHeaderActions = null) => (
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
      globalFilterValue={hasGlobalFilter && (
        (metric.enableFiltering && metric.labelField === tabConfig.globalFilterField) ||
        (metric.globalFilterField === tabConfig.globalFilterField)
      ) ? (globalFilterValue || globalFilterOptions[0] || null) : null}
      hasSecondaryGlobalFilter={hasSecondaryGlobalFilter}
      secondaryGlobalFilterField={tabConfig?.secondaryGlobalFilterField || null}
      secondaryGlobalFilterValue={hasSecondaryGlobalFilter && !loadingSecondaryGlobalFilter ? (secondaryGlobalFilterValue || secondaryGlobalFilterOptions[0] || null) : null}
      selectedUnit={hasUnitToggle && !metric.unitFieldGroups ? selectedUnit : null}
      enableResolutionToggle={hasResolutionToggle}
      enableUnitToggle={!!metric.unitFieldGroups || (!hasUnitToggle && !!(metric.unitFilterField || metric.unitFields))}
      globalTimeRange={timeRanges ? selectedTimeRange : null}
      headerActions={extraHeaderActions}
    />
  );

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
          {hasSecondaryGlobalFilter && (
            <GlobalFilterWidget
              tabConfig={{ globalFilterField: tabConfig.secondaryGlobalFilterField }}
              globalFilterOptions={secondaryGlobalFilterOptions}
              globalFilterValue={secondaryGlobalFilterValue}
              onGlobalFilterChange={onSecondaryGlobalFilterChange}
              loadingGlobalFilter={loadingSecondaryGlobalFilter}
              hasUnitToggle={false}
              placement="top"
            />
          )}
        </div>
      )}
      <div className="metrics-grid-positioned" style={gridStyle}>
        {renderedMetrics.map(metric => {
          const metricStyle = {};
          if (metric.gridRow) metricStyle.gridRow = metric.gridRow;
          if (metric.gridColumn) metricStyle.gridColumn = metric.gridColumn;
          if (metric.gridRow && metric.gridRow.toString().includes('span') && metric.minHeight) {
            metricStyle.height = metric.minHeight;
          }

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

          // Tab-grouped metrics: render active metric with toggle in its card header
          if (metric.tabGroup && tabGroups[metric.tabGroup]) {
            const group = tabGroups[metric.tabGroup];
            const activeId = tabGroupSelections[metric.tabGroup] || group[0].id;
            const activeMetric = group.find(m => m.id === activeId) || group[0];

            const tabToggle = (
              <div className="resolution-toggle">
                {group.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    className={`resolution-btn${activeId === m.id ? ' active' : ''}`}
                    onClick={() => setTabGroupSelections(prev => ({ ...prev, [metric.tabGroup]: m.id }))}
                  >
                    {m.tabLabel || m.name || m.id}
                  </button>
                ))}
              </div>
            );

            return (
              <div
                key={`tabgroup-${metric.tabGroup}-${activeId}`}
                className="grid-item"
                style={metricStyle}
              >
                {renderMetricWidget(activeMetric, tabToggle)}
              </div>
            );
          }
          
          return (
            <div 
              key={metric.id} 
              className="grid-item"
              style={metricStyle}
            >
              {renderMetricWidget(metric)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricGrid;
