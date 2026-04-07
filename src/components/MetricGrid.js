import React, { useState, useEffect, useMemo, useRef } from 'react';
import MetricWidget from './MetricWidget';
import GlobalFilterWidget from './GlobalFilterWidget';
import metricsService from '../services/metrics';
import { getDateRange } from '../utils';

/**
 * Resolve the effective global filter value to pass to a panel.
 *
 * - If the user has actively picked a value, use it (it is always a string).
 * - Otherwise, fall back to the first option in the list — but ONLY when the
 *   tab does not flag `requireExplicitFilter`. Tabs that require an explicit
 *   pick (e.g. the Avatar tab's search-by-name+address) must stay blank
 *   until the user actually picks something.
 * - When falling back to an option, support both legacy string-array options
 *   and the new `{ label, value }` object array by extracting `.value`.
 */
const resolveGlobalFilterValue = (currentValue, options, tabConfig) => {
  if (currentValue) return currentValue;
  if (tabConfig?.requireExplicitFilter) return null;
  const first = options && options.length > 0 ? options[0] : null;
  if (!first) return null;
  if (typeof first === 'object') return first.value || null;
  return first;
};

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

  // Get a single metric to use for fetching filter options (prefer "total" metrics as they're usually smaller).
  // When tabConfig.globalFilterSourceMetric is set, use that instead — this lets a tab pin a dedicated
  // lightweight lookup mart (e.g. avatar search) regardless of which panel metrics happen to be on the tab.
  const metricForOptions = useMemo(() => {
    if (!hasGlobalFilter) return null;
    if (tabConfig?.globalFilterSourceMetric) {
      return { id: tabConfig.globalFilterSourceMetric, __synthetic: true };
    }
    if (metricsForGlobalFilter.length === 0) return null;
    // Prefer a "total" metric as it's usually smaller and faster
    const totalMetric = metricsForGlobalFilter.find(m => m.id.includes('_total'));
    return totalMetric || metricsForGlobalFilter[0];
  }, [metricsForGlobalFilter, hasGlobalFilter, tabConfig?.globalFilterSourceMetric]);

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

    // Tabs flagged with requireExplicitFilter (freeform paste UX) skip the eager
    // options fetch entirely and never auto-select a default value. The user
    // must type/paste a value before any card fetches data.
    //
    // Exception: when the tab also pins a `globalFilterSourceMetric`, we DO load
    // that lookup eagerly so the search input can match against the option list,
    // but we still leave `globalFilterValue` unset so no panel auto-fetches.
    const hasPinnedSource = !!tabConfig?.globalFilterSourceMetric;
    if (tabConfig?.requireExplicitFilter && !hasPinnedSource) {
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

        const valueField = tabConfig.globalFilterField;
        const displayField = tabConfig.globalFilterDisplayField;
        const rows = (result?.data && Array.isArray(result.data)) ? result.data : [];

        let sortedOptions;
        if (displayField) {
          // Build `{ label, value, sublabel }` objects so the search input can
          // match either the display name OR the address, and the dropdown
          // shows the human-friendly label while still passing the address as
          // the filter value.
          const seen = new Map();
          for (const item of rows) {
            const value = item[valueField];
            if (!value || seen.has(value)) continue;
            const display = item[displayField];
            const labelText = display && String(display).trim()
              ? String(display).trim()
              : String(value);
            seen.set(value, {
              label: labelText,
              value: String(value),
              // Show the address (truncated) as a sublabel when we have a name,
              // so the user can verify the address before picking.
              sublabel: display && String(display).trim()
                ? `${String(value).slice(0, 10)}…${String(value).slice(-6)}`
                : '',
            });
          }
          sortedOptions = Array.from(seen.values()).sort((a, b) => {
            const al = (a.label || '').toLowerCase();
            const bl = (b.label || '').toLowerCase();
            if (al && bl && al !== bl) return al < bl ? -1 : 1;
            return (a.value || '').localeCompare(b.value || '');
          });
        } else {
          // Backwards-compatible string-array path.
          const allValues = new Set();
          for (const item of rows) {
            const value = item[valueField];
            if (value) allValues.add(value);
          }
          sortedOptions = Array.from(allValues).sort();
        }

        setGlobalFilterOptions(sortedOptions);

        // Ensure selected filter is valid for the current tab options.
        const latestValue = globalFilterValueRef.current;
        if (!onGlobalFilterChange) {
          return;
        }

        // Tabs that require explicit filter never auto-select, even when we
        // do load the option list (search-by-name use case).
        if (tabConfig?.requireExplicitFilter) {
          return;
        }

        if (sortedOptions.length === 0) {
          if (latestValue) {
            onGlobalFilterChange(null);
          }
          return;
        }

        // Check membership against the option's value (object) or itself (string).
        const optionValueOf = (o) => (o && typeof o === 'object') ? o.value : o;
        const valuesSet = new Set(sortedOptions.map(optionValueOf));
        if (!latestValue || !valuesSet.has(latestValue)) {
          onGlobalFilterChange(optionValueOf(sortedOptions[0]));
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
  }, [hasGlobalFilter, metricForOptions?.id, tabConfig?.globalFilterField, tabConfig?.globalFilterDisplayField, tabConfig?.globalFilterSourceMetric, tabConfig?.requireExplicitFilter]);

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
                    ? resolveGlobalFilterValue(globalFilterValue, globalFilterOptions, tabConfig)
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
                ) ? resolveGlobalFilterValue(globalFilterValue, globalFilterOptions, tabConfig) : null}
                hasSecondaryGlobalFilter={hasSecondaryGlobalFilter}
                secondaryGlobalFilterField={tabConfig?.secondaryGlobalFilterField || null}
                secondaryGlobalFilterValue={hasSecondaryGlobalFilter && !loadingSecondaryGlobalFilter ? resolveGlobalFilterValue(secondaryGlobalFilterValue, secondaryGlobalFilterOptions, { requireExplicitFilter: tabConfig?.requireExplicitFilter }) : null}
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
