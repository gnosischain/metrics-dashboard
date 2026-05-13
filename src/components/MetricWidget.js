import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import TOKEN_ICON_URLS, { formatTokenSymbol } from '../utils/tokenIcons.js';
import InfoPopover from './InfoPopover';
import MetricWidgetSkeleton from './MetricWidgetSkeleton';
import metricsService from '../services/metrics';
import { downloadEChartInstanceAsPng } from '../utils/echarts/exportImage';
import { filterDataByTimeRange } from '../utils/dates';
import { normalizeFilterValue } from '../utils/filterValues';

// IntersectionObserver's default root is the viewport. The dashboard scrolls
// inside .dashboard-content, so a viewport-rooted observer never fires and
// off-screen widgets stay skeletons forever. Walk ancestors to find the real
// scroll container so the IO can attach to it.
const findScrollableAncestor = (node) => {
  if (!node || typeof window === 'undefined') return null;
  let current = node.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const RESOLUTION_LABELS = { daily: 'D', weekly: 'W', monthly: 'M' };
const UNIT_LABELS = { native: 'Native', usd: 'USD' };

const getDisplayUnitLabel = (unitKey, unitConfig, firstRow) => {
  if (!unitKey) return null;
  return (unitConfig?.labelField && firstRow?.[unitConfig.labelField]) || unitConfig?.label || UNIT_LABELS[unitKey] || unitKey;
};

const MetricWidget = ({
  metricId,
  isDarkMode = false,
  minimal = false,
  className = '',
  globalSelectedLabel = null,
  hasGlobalFilter = false,
  globalFilterField = null,
  globalFilterValue = null,
  selectedUnit = null,
  dashboardPalette = null,
  enableResolutionToggle = false,
  enableUnitToggle = false,
  globalTimeRange = null,
  hasSecondaryGlobalFilter = false,
  secondaryGlobalFilterField = null,
  secondaryGlobalFilterValue = null,
  onSecondaryGlobalFilterChange = null,
  headerActions = null,
  onTableRowClick = null,
  tableConfigOverrides = null,
  tableHeight = null,
  // Skip MetricWidget's own IntersectionObserver gate. Use when a parent
  // already lazy-mounts via its own IO (e.g. AccountPortfolio's
  // PortfolioMetric) — stacking two IOs across StrictMode remounts means
  // neither callback consistently fires and widgets stay in skeleton.
  eagerFetch = false
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedLocalFilters, setSelectedLocalFilters] = useState({});
  const [selectedValueMode, setSelectedValueMode] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  // Parents (Dashboard for tab metrics, AccountPortfolio for its
  // section metrics) preload configs before rendering this widget so
  // getMetricConfig returns synchronously below. As a last-resort
  // safety net, kick off a load if we ever mount without a cached
  // config — but don't force re-render here, since destabilising
  // fetchData mid-flight causes pending requests to be aborted and
  // their data discarded.
  useEffect(() => {
    if (!metricId) return;
    if (metricsService.getMetricConfig(metricId)) return;
    metricsService.loadMetricConfigs([metricId]).catch(() => {});
  }, [metricId]);
  
  const isMounted = useRef(true);
  const requestSequenceRef = useRef(0);
  const activeAbortRef = useRef(null);
  const cardRef = useRef(null);
  // IntersectionObserver-gated fetch: don't request data until the widget
  // is within ~300px of the viewport. The portfolio renders ~30 widgets;
  // without this, all 30 fire on mount even if the user only scrolls past
  // the first 4. Falls back to "fetch immediately" when IO is unavailable.
  const [shouldFetch, setShouldFetch] = useState(() => {
    if (eagerFetch) return true;
    if (typeof window === 'undefined') return true;
    return typeof window.IntersectionObserver !== 'function';
  });

  // Per-chart resolution toggle (independent per widget)
  const baseMetricConfig = useMemo(() => metricsService.getMetricConfig(metricId), [metricId]);

  // Per-chart unit toggle (independent per widget)
  const unitFieldGroups = baseMetricConfig?.unitFieldGroups;
  const hasGroupedUnits = Array.isArray(unitFieldGroups) && unitFieldGroups.length > 0;
  const defaultLocalUnit = useMemo(() => {
    const uf = baseMetricConfig?.unitFields;
    if (!uf) return 'usd';
    if (hasGroupedUnits) {
      return unitFieldGroups.map(g => Object.keys(g.options)[0]).join('|');
    }
    return Object.keys(uf)[0];
  }, [baseMetricConfig, hasGroupedUnits, unitFieldGroups]);
  const [localUnit, setLocalUnit] = useState(defaultLocalUnit);
  const setGroupedUnit = useCallback((groupIndex, key) => {
    setLocalUnit(prev => {
      const parts = prev.split('|');
      parts[groupIndex] = key;
      return parts.join('|');
    });
  }, []);
  const supportsLocalUnitToggle = enableUnitToggle && !selectedUnit && (baseMetricConfig?.unitFilterField || baseMetricConfig?.unitFields);
  const effectiveUnit = selectedUnit || (supportsLocalUnitToggle ? localUnit : null);
  const [localResolution, setLocalResolution] = useState(baseMetricConfig?.defaultResolution || 'weekly');
  const supportsResolution = enableResolutionToggle && baseMetricConfig?.resolutions;

  // Resolve effective metric ID based on local resolution selection
  const effectiveMetricId = useMemo(() => {
    if (!supportsResolution || localResolution === baseMetricConfig?.defaultResolution) {
      return metricId;
    }
    const base = metricId.replace(/_(daily|weekly|monthly)$/, '');
    return `${base}_${localResolution}`;
  }, [metricId, supportsResolution, localResolution, baseMetricConfig?.defaultResolution]);

  // Determine if we're using global filter or local filter
  // If hasGlobalFilter is true, we should use global filter (even if value is null yet - it will be set soon)
  const isUsingGlobalFilter = hasGlobalFilter || (globalSelectedLabel !== null && globalSelectedLabel !== undefined);
  // Use global filter if provided, otherwise use local state
  const effectiveSelectedLabel = (hasGlobalFilter && globalSelectedLabel) ? globalSelectedLabel : (isUsingGlobalFilter ? globalSelectedLabel : selectedLabel);

  const metricConfig = useMemo(() => metricsService.getMetricConfig(effectiveMetricId), [effectiveMetricId]);

  const widgetConfig = useMemo(() => {
    if (!metricConfig) {
      return { type: 'error', error: 'Metric configuration not found' };
    }
    const { 
        chartType = 'line', 
        name, 
        description, 
        metricDescription,
        format, 
        color, 
        labelField,
        valueField,
        enableFiltering = false, 
        enableZoom = false,
        variant,
        cardVariant,
        changeData,
        fontSize,
        titleFontSize,
        resolutions,
        localFilterFields,
        timeRanges,
        defaultTimeRange = 'ALL',
        columns,
        paginationSize,
        paginationSizeSelector,
        initialSort,
        selectableRows,
        rowSelectionEmits,
    } = metricConfig;

    let widgetType = 'chart';
    if (chartType === 'text') widgetType = 'text';
    if (chartType === 'number' || chartType === 'numberDisplay') widgetType = 'number';
    if (chartType === 'kpi') widgetType = 'kpi';
    if (chartType === 'table') widgetType = 'table';

    const resolvedCardVariant = (chartType === 'numberDisplay' || chartType === 'kpi')
      ? (cardVariant || 'outline')
      : (cardVariant || 'default');

    return {
      type: widgetType,
      chartType,
      title: name,
      description,
      metricDescription,
      format,
      color,
      labelField,
      valueField,
      enableFiltering,
      enableZoom,
      variant,
      cardVariant: resolvedCardVariant,
      changeData,
      fontSize,
      titleFontSize,
      resolutions,
      localFilterFields,
      timeRanges,
      defaultTimeRange,
      columns,
      paginationSize,
      paginationSizeSelector,
      initialSort,
      selectableRows,
      rowSelectionEmits,
      config: metricConfig
    };
  }, [metricConfig]);

  const multiLocalFilterFields = useMemo(() => {
    if (!Array.isArray(widgetConfig?.localFilterFields)) {
      return [];
    }

    return widgetConfig.localFilterFields
      .map((fieldName) => (typeof fieldName === 'string' ? fieldName.trim() : ''))
      .filter(Boolean);
  }, [widgetConfig?.localFilterFields]);

  const hasMultiLocalFilters = multiLocalFilterFields.length > 0;

  const resolveFormat = useCallback((preferred, fallback) => {
    return preferred === undefined ? fallback : preferred;
  }, []);

  // Determine effective yField and format based on unit toggle
  // If the metric has unitFields config and a unit is selected, use those settings
  const effectiveUnitConfig = useMemo(() => {
    const unitFields = metricConfig?.unitFields;
    
    // If no unit toggle or metric doesn't support it, return defaults
    if (!effectiveUnit || !unitFields) {
      return {
        yField: metricConfig?.yField || 'value',
        valueField: metricConfig?.valueField || 'value',
        // Preserve explicit null to disable formatting.
        format: resolveFormat(metricConfig?.format, 'formatNumber')
      };
    }
    
    // Get config for the selected unit
    const unitConfig = unitFields[effectiveUnit];
    if (unitConfig) {
      return {
        yField: unitConfig.field || metricConfig?.yField || 'value',
        valueField: unitConfig.field || metricConfig?.valueField || 'value',
        // Preserve explicit null to disable formatting.
        format: resolveFormat(
          unitConfig.format,
          resolveFormat(metricConfig?.format, 'formatNumber')
        ),
        visualMapCenter: unitConfig.visualMapCenter,
        visualMapPercentile: unitConfig.visualMapPercentile,
      };
    }

    // Fallback to defaults
    return {
      yField: metricConfig?.yField || 'value',
      valueField: metricConfig?.valueField || 'value',
      // Preserve explicit null to disable formatting.
      format: resolveFormat(metricConfig?.format, 'formatNumber')
    };
  }, [effectiveUnit, metricConfig, resolveFormat]);

  // resolvedUnitLabel is defined after filteredData (see below)

  const valueModeOptions = useMemo(() => {
    if (!Array.isArray(metricConfig?.valueModeOptions)) {
      return [];
    }

    return metricConfig.valueModeOptions
      .map((option) => {
        if (!option || typeof option !== 'object') return null;

        const key = typeof option.key === 'string' ? option.key.trim() : '';
        if (!key) return null;

        const label = typeof option.label === 'string' && option.label.trim()
          ? option.label.trim()
          : key;

        const valueField = typeof option.valueField === 'string' && option.valueField.trim()
          ? option.valueField.trim()
          : (typeof option.field === 'string' ? option.field.trim() : '');

        return {
          key,
          label,
          valueField,
          format: option.format
        };
      })
      .filter(Boolean);
  }, [metricConfig?.valueModeOptions]);

  const valueModeByKey = useMemo(() => {
    return valueModeOptions.reduce((acc, option) => {
      acc[option.key] = option;
      return acc;
    }, {});
  }, [valueModeOptions]);

  const valueModeKeyByLabel = useMemo(() => {
    return valueModeOptions.reduce((acc, option) => {
      if (!(option.label in acc)) {
        acc[option.label] = option.key;
      }
      return acc;
    }, {});
  }, [valueModeOptions]);

  const selectedValueModeOption = selectedValueMode ? valueModeByKey[selectedValueMode] : null;

  const effectiveValueConfig = useMemo(() => {
    const baseConfig = {
      yField: effectiveUnitConfig.yField,
      valueField: effectiveUnitConfig.valueField,
      format: effectiveUnitConfig.format
    };

    if (!selectedValueModeOption) {
      return baseConfig;
    }

    return {
      yField: selectedValueModeOption.valueField || baseConfig.yField,
      valueField: selectedValueModeOption.valueField || baseConfig.valueField,
      // Preserve explicit null to disable formatting.
      format: resolveFormat(selectedValueModeOption.format, baseConfig.format)
    };
  }, [effectiveUnitConfig, selectedValueModeOption, resolveFormat]);

  // Check if this widget should use global filter for its labelField
  const isGlobalFilterForThisField = useMemo(() => {
    return hasGlobalFilter && widgetConfig?.labelField === globalFilterField;
  }, [hasGlobalFilter, widgetConfig?.labelField, globalFilterField]);
  
  // Check if this widget should show a secondary filter (different field than global filter)
  // Suppressed when a secondary global filter is handling this widget's labelField instead
  const isSecondaryGlobalFilterForThisField = hasSecondaryGlobalFilter &&
    !!secondaryGlobalFilterField &&
    widgetConfig?.labelField === secondaryGlobalFilterField;

  const shouldShowSecondaryFilter = useMemo(() => {
    return widgetConfig?.enableFiltering &&
      globalFilterField &&
      widgetConfig?.labelField &&
      widgetConfig.labelField !== globalFilterField &&
      !isSecondaryGlobalFilterForThisField;
  }, [widgetConfig?.enableFiltering, widgetConfig?.labelField, globalFilterField, isSecondaryGlobalFilterForThisField]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Intentionally do NOT abort activeAbortRef here. In dev StrictMode,
      // useEffect cleanup runs synthetically between mount and remount, and
      // aborting at that point cancels a request whose response would have
      // landed on the live (remounted) instance. The shared inFlightRequests
      // dedup in api.js means the abort can also tear down requests other
      // widgets are awaiting. Letting the request complete is cheap and
      // safe — the new render will read from the api cache.
    };
  }, []);

  useEffect(() => {
    if (valueModeOptions.length === 0) {
      if (selectedValueMode !== null) {
        setSelectedValueMode(null);
      }
      return;
    }

    if (selectedValueMode && valueModeByKey[selectedValueMode]) {
      return;
    }

    const preferredValueMode = typeof metricConfig?.defaultValueMode === 'string'
      ? metricConfig.defaultValueMode
      : null;

    if (preferredValueMode && valueModeByKey[preferredValueMode]) {
      setSelectedValueMode(preferredValueMode);
      return;
    }

    setSelectedValueMode(valueModeOptions[0].key);
  }, [metricConfig?.defaultValueMode, selectedValueMode, valueModeByKey, valueModeOptions]);

  const buildMetricRequestParams = useCallback((overrides = {}) => {
    const normalizedGlobalFilterValue = normalizeFilterValue(globalFilterField, globalFilterValue);

    const params = {};
    if (hasGlobalFilter && globalFilterField && normalizedGlobalFilterValue) {
      params.filterField = globalFilterField;
      params.filterValue = normalizedGlobalFilterValue;
    }
    if (metricConfig?.useCached === false) {
      params.useCached = 'false';
    }
    if (effectiveUnit && metricConfig?.unitFilterField) {
      params.filterField2 = metricConfig.unitFilterField;
      params.filterValue2 = effectiveUnit;
    }
    if (
      hasSecondaryGlobalFilter &&
      secondaryGlobalFilterField &&
      secondaryGlobalFilterValue &&
      (metricConfig?.applySecondaryGlobalFilter === true ||
        widgetConfig?.labelField === secondaryGlobalFilterField)
    ) {
      params.filterField3 = secondaryGlobalFilterField;
      params.filterValue3 = secondaryGlobalFilterValue;
    }
    if (metricConfig?.serverPagination === true) {
      const initialSort = Array.isArray(metricConfig.initialSort) ? metricConfig.initialSort[0] : null;
      params.page = overrides.page || 1;
      params.pageSize = overrides.pageSize || metricConfig.paginationSize || 25;
      params.includeTotal = 'true';
      params.sortField = overrides.sortField || initialSort?.column || initialSort?.field || undefined;
      params.sortDir = overrides.sortDir || initialSort?.dir || undefined;
      params.search = overrides.search || undefined;
    }

    return Object.fromEntries(
      Object.entries({ ...params, ...overrides }).filter(([, value]) =>
        value !== undefined && value !== null && value !== ''
      )
    );
  }, [
    effectiveUnit,
    globalFilterField,
    globalFilterValue,
    hasGlobalFilter,
    hasSecondaryGlobalFilter,
    metricConfig,
    secondaryGlobalFilterField,
    secondaryGlobalFilterValue,
    widgetConfig?.labelField,
  ]);

  const fetchData = useCallback(async () => {
    // If this widget uses global filter but the value isn't set yet, skip fetch.
    // The fetch will trigger once globalFilterValue is set.
    const normalizedGlobalFilterValue = normalizeFilterValue(globalFilterField, globalFilterValue);

    if (hasGlobalFilter && !normalizedGlobalFilterValue) {
      return;
    }

    const requestId = ++requestSequenceRef.current;

    // Track the controller so unmount can abort it. We do NOT abort the
    // previous controller here — superseding via abort caused races where
    // a benign re-render (e.g. config arrival, parent state update)
    // killed an in-flight request whose response would have been valid.
    // The requestSequenceRef check after await already guards against
    // applying stale results.
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    activeAbortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      // Check if metricsService has the getMetricData method
      if (!metricsService || typeof metricsService.getMetricData !== 'function') {
        throw new Error('Metrics service is not properly initialized');
      }

      const params = buildMetricRequestParams();

      const result = await metricsService.getMetricData(effectiveMetricId, params, { signal: controller?.signal });

      if (!isMounted.current || requestId !== requestSequenceRef.current) {
        return;
      }

      if (isMounted.current) {
        setData(result);
        
        if (widgetConfig.enableFiltering && result?.data?.length > 0) {
          if (hasMultiLocalFilters) {
            return;
          }

          // If this is a secondary filter (different field than global), we'll extract labels later from filtered data
          // For now, extract from all data (will be updated when global filter is applied)
          const uniqueLabels = [...new Set(result.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
          setAvailableLabels(uniqueLabels);
          
          // Only set local selectedLabel if not using global filter for this field
          if (!isGlobalFilterForThisField && !selectedLabel && uniqueLabels.length > 0) {
            setSelectedLabel(uniqueLabels[0]);
          }
        }
      }
    } catch (err) {
      // Aborts are expected when the widget unmounts or a newer request supersedes;
      // they should not surface as errors.
      const aborted = err?.name === 'AbortError' || err?.code === 'ABORT_ERR';
      if (aborted) {
        return;
      }
      if (isMounted.current && requestId === requestSequenceRef.current) {
        const code = err?.code || null;
        const status = Number(err?.status || 0);
        setError({ message: err?.message || 'Request failed', code, status });
        // Permanent/expected states are noisy in the console — log them
        // quietly. Real failures still warn loudly.
        const isExpected = code === 'MissingMetricSource'
          || code === 'InvalidMetric'
          || code === 'FilterRequired';
        if (isExpected) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug(`Metric ${effectiveMetricId}: ${code}`);
          }
        } else {
          // eslint-disable-next-line no-console
          console.error('Error fetching metric data:', err);
        }
      }
    } finally {
      if (isMounted.current && requestId === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  // Note: selectedLabel is intentionally excluded from dependencies.
  // Local filter changes should NOT trigger refetches - filtering is done client-side.
  // Only effectiveMetricId and global filter changes should trigger API calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveMetricId,
    globalFilterField,
    globalFilterValue,
    hasGlobalFilter,
    hasMultiLocalFilters,
    // Refetch when the tab-level secondary filter (e.g. protocol) changes and this
    // widget opts in via applySecondaryGlobalFilter or has labelField matching.
    hasSecondaryGlobalFilter,
    secondaryGlobalFilterField,
    secondaryGlobalFilterValue,
    metricConfig?.applySecondaryGlobalFilter,
    buildMetricRequestParams,
  ]);

  useEffect(() => {
    if (!shouldFetch) return;
    fetchData();
  }, [fetchData, shouldFetch]);

  useEffect(() => {
    if (shouldFetch) return undefined;
    const node = cardRef.current;
    if (!node || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
      setShouldFetch(true);
      return undefined;
    }
    const root = findScrollableAncestor(node);
    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldFetch(true);
            observer.disconnect();
            break;
          }
        }
      },
      { root, rootMargin: '300px 0px', threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldFetch]);

  useEffect(() => {
    if (!hasMultiLocalFilters) return;
    setSelectedLocalFilters({});
  }, [effectiveMetricId, hasMultiLocalFilters, multiLocalFilterFields]);

  const localFilterOptionsByField = useMemo(() => {
    if (!hasMultiLocalFilters || !Array.isArray(data?.data)) {
      return {};
    }

    const optionsByField = {};
    let scopedRows = data.data;

    multiLocalFilterFields.forEach((fieldName) => {
      const options = [...new Set(scopedRows.map((item) => item[fieldName]))].filter(
        (value) => value !== null && value !== undefined && value !== ''
      );
      optionsByField[fieldName] = options;

      const selectedValue = options.includes(selectedLocalFilters[fieldName])
        ? selectedLocalFilters[fieldName]
        : options[0];

      if (selectedValue) {
        scopedRows = scopedRows.filter((item) => item[fieldName] === selectedValue);
      } else {
        scopedRows = [];
      }
    });

    return optionsByField;
  }, [hasMultiLocalFilters, data, multiLocalFilterFields, selectedLocalFilters]);

  useEffect(() => {
    if (!hasMultiLocalFilters) return;

    setSelectedLocalFilters((previousSelections) => {
      const nextSelections = {};
      let hasChanges = false;

      multiLocalFilterFields.forEach((fieldName) => {
        const options = localFilterOptionsByField[fieldName] || [];
        const previousValue = previousSelections[fieldName];
        const nextValue = options.includes(previousValue) ? previousValue : (options[0] || '');

        if (nextValue) {
          nextSelections[fieldName] = nextValue;
        }

        if (nextValue !== previousValue) {
          hasChanges = true;
        }
      });

      if (Object.keys(previousSelections).some((fieldName) => !multiLocalFilterFields.includes(fieldName))) {
        hasChanges = true;
      }

      return hasChanges ? nextSelections : previousSelections;
    });
  }, [hasMultiLocalFilters, multiLocalFilterFields, localFilterOptionsByField]);

  const handleMultiLocalFilterSelect = useCallback((fieldName, selectedValue) => {
    setSelectedLocalFilters((previousSelections) => {
      const nextSelections = {
        ...previousSelections,
        [fieldName]: selectedValue
      };

      const fieldIndex = multiLocalFilterFields.indexOf(fieldName);
      for (let index = fieldIndex + 1; index < multiLocalFilterFields.length; index += 1) {
        delete nextSelections[multiLocalFilterFields[index]];
      }

      return nextSelections;
    });
  }, [multiLocalFilterFields]);

  // Apply per-chart filter (secondary filter) if applicable.
  // Note: Global filter is already applied server-side, so data is pre-filtered by token.
  // We only need to apply secondary filtering (e.g., by pool) client-side.
  const filteredData = useMemo(() => {
    if (!data?.data) return data;
    
    // If no filtering enabled, return data as-is (already filtered by server)
    if (!widgetConfig.enableFiltering) {
      return data;
    }

    if (hasMultiLocalFilters) {
      let rows = data.data;

      multiLocalFilterFields.forEach((fieldName) => {
        const options = localFilterOptionsByField[fieldName] || [];
        const selectedValue = options.includes(selectedLocalFilters[fieldName])
          ? selectedLocalFilters[fieldName]
          : options[0];
        if (selectedValue) {
          rows = rows.filter((item) => item[fieldName] === selectedValue);
        }
      });

      return {
        ...data,
        data: rows
      };
    }
    
    // If this widget uses the global filter field, data is already filtered by server
    if (isGlobalFilterForThisField) {
      return data;
    }
    
    // If this widget's secondary filter is managed globally, apply that value client-side
    if (isSecondaryGlobalFilterForThisField) {
      if (!secondaryGlobalFilterValue) return data;
      return {
        ...data,
        data: data.data.filter(item => item[widgetConfig.labelField] === secondaryGlobalFilterValue)
      };
    }

    // If this widget uses a secondary filter (different field), apply that filter client-side
    if (shouldShowSecondaryFilter) {
      if (!selectedLabel) return data;
      return {
        ...data,
        data: data.data.filter(item => item[widgetConfig.labelField] === selectedLabel)
      };
    }

    // Fallback: original logic for widgets without global filter (local filter only)
    if (!effectiveSelectedLabel) return data;
    return {
      ...data,
      data: data.data.filter(item => item[widgetConfig.labelField] === effectiveSelectedLabel)
    };
  }, [
    data,
    widgetConfig.enableFiltering,
    widgetConfig.labelField,
    effectiveSelectedLabel,
    hasMultiLocalFilters,
    multiLocalFilterFields,
    localFilterOptionsByField,
    selectedLocalFilters,
    isGlobalFilterForThisField,
    shouldShowSecondaryFilter,
    selectedLabel,
    isSecondaryGlobalFilterForThisField,
    secondaryGlobalFilterValue
  ]);

  // Per-widget time range state (used when no global time range is active)
  const LOCAL_TIME_RANGES = ['1M', '3M', '6M', '1Y', '2Y', 'ALL'];
  const showLocalTimeRange = widgetConfig.enableZoom && !globalTimeRange;
  const [localTimeRange, setLocalTimeRange] = useState('ALL');

  // Effective time range: global overrides local
  const effectiveTimeRange = globalTimeRange || (showLocalTimeRange ? localTimeRange : null);
  const hasTimeRangeZoom = widgetConfig.enableZoom && !!effectiveTimeRange;

  // Filter data by time range (the single source of truth for charts, tables, numbers)
  const timeFilteredData = useMemo(() => {
    if (!filteredData?.data || !effectiveTimeRange || effectiveTimeRange === 'ALL') {
      return filteredData;
    }
    const xField = widgetConfig.config?.xField || widgetConfig.config?.categoryField || 'date';
    const filtered = filterDataByTimeRange(filteredData.data, effectiveTimeRange, xField);
    return { ...filteredData, data: filtered };
  }, [filteredData, effectiveTimeRange, widgetConfig.config?.xField, widgetConfig.config?.categoryField]);

  // Resolve the display label for the active unit (dynamic from filtered data or static)
  const resolvedUnitLabel = useMemo(() => {
    const unitFields = metricConfig?.unitFields;
    if (!effectiveUnit || !unitFields) return null;
    const unitConfig = unitFields[effectiveUnit];
    if (!unitConfig) return null;
    return getDisplayUnitLabel(effectiveUnit, unitConfig, timeFilteredData?.data?.[0]);
  }, [effectiveUnit, metricConfig, timeFilteredData]);

  // Process change data for number widgets
  const processChangeData = useMemo(() => {
    if (widgetConfig.type !== 'number' || !widgetConfig.changeData || !timeFilteredData?.data) {
      return { showChange: false };
    }

    const changeConfig = widgetConfig.changeData;
    const dataArray = Array.isArray(timeFilteredData.data) ? timeFilteredData.data : [timeFilteredData.data];
    
    if (dataArray.length === 0) return { showChange: false };

    // Get the first data point (assuming it contains change information)
    const dataPoint = dataArray[0];
    
    // Try to extract change data from various possible fields
    let changeValue = null;
    let changePeriod = changeConfig.period || '';
    
    // Look for change data in common field patterns
    const changeFields = [
      changeConfig.field, // Explicit field from config
      'change_percentage',
      'change_percent', 
      'change_value',
      'change',
      'pct_change',
      'percentage_change'
    ].filter(Boolean);
    
    for (const field of changeFields) {
      if (dataPoint[field] !== undefined && dataPoint[field] !== null) {
        changeValue = dataPoint[field];
        break;
      }
    }

    // If no change field found, return no change
    if (changeValue === null || changeValue === undefined) {
      return { showChange: false };
    }

    // Determine change type
    let changeType = 'neutral';
    const numericChange = parseFloat(changeValue);
    if (!isNaN(numericChange)) {
      if (numericChange > 0) changeType = 'positive';
      else if (numericChange < 0) changeType = 'negative';
    }

    return {
      showChange: true,
      changeValue,
      changeType,
      changePeriod
    };
  }, [widgetConfig, timeFilteredData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Auto-retry once for transient errors (network blips, ClickHouse timeouts).
  // Permanent error codes are skipped — retrying yields the same response.
  const autoRetriedRef = useRef(false);
  useEffect(() => {
    if (!error) {
      autoRetriedRef.current = false;
      return undefined;
    }
    if (autoRetriedRef.current) return undefined;
    const code = error.code;
    const status = error.status;
    const isPermanent = code === 'MissingMetricSource'
      || code === 'InvalidMetric'
      || code === 'FilterRequired';
    const isTransient = !isPermanent && (
      !status
      || status === 0
      || status === 408
      || status === 429
      || (status >= 500 && status !== 502)
    );
    if (!isTransient) return undefined;
    autoRetriedRef.current = true;
    const jitter = 1200 + Math.floor(Math.random() * 600);
    const handle = window.setTimeout(() => {
      if (isMounted.current) fetchData();
    }, jitter);
    return () => window.clearTimeout(handle);
  }, [error, fetchData]);

  // Extract available labels from data for secondary filters
  // Data is already filtered by global filter (server-side), so we extract secondary options from it
  // MUST be before any early returns (Rules of Hooks)
  const availableSecondaryLabels = useMemo(() => {
    if (hasMultiLocalFilters) return [];
    if (!shouldShowSecondaryFilter || !data?.data) return availableLabels;
    
    // Extract unique labels from server-filtered data (e.g., pools containing selected token)
    const uniqueLabels = [...new Set(data.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
    return uniqueLabels;
  }, [hasMultiLocalFilters, shouldShowSecondaryFilter, data, widgetConfig.labelField, availableLabels]);

  // Update available labels when data changes (for secondary filters)
  // Also handles Issue 5: reset selectedLabel if it's no longer valid after global filter change
  // MUST be before any early returns (Rules of Hooks)
  useEffect(() => {
    if (hasMultiLocalFilters) return;
    if (shouldShowSecondaryFilter && data?.data) {
      const uniqueLabels = [...new Set(data.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
      setAvailableLabels(uniqueLabels);
      
      // Reset selectedLabel if it's no longer valid (Issue 5 fix)
      if (selectedLabel && !uniqueLabels.includes(selectedLabel)) {
        setSelectedLabel(uniqueLabels[0] || '');
      }
      // Auto-select first label if none selected
      else if (!selectedLabel && uniqueLabels.length > 0) {
        setSelectedLabel(uniqueLabels[0]);
      }
    }
  }, [hasMultiLocalFilters, shouldShowSecondaryFilter, data, widgetConfig.labelField, selectedLabel]);

  // Show per-metric dropdown if:
  // 1. Not using global filter for this field, OR
  // 2. Using a secondary filter (different field than global filter)
  const showLocalDropdown = !hasMultiLocalFilters &&
    widgetConfig.enableFiltering &&
    !isGlobalFilterForThisField &&
    !isSecondaryGlobalFilterForThisField &&
    (availableSecondaryLabels.length > 0 || availableLabels.length > 0);

  const showMultiLocalDropdowns = hasMultiLocalFilters &&
    widgetConfig.enableFiltering &&
    !isGlobalFilterForThisField &&
    multiLocalFilterFields.some((fieldName) => (localFilterOptionsByField[fieldName] || []).length > 0);
  
  const labelsForDropdown = shouldShowSecondaryFilter ? availableSecondaryLabels : availableLabels;
  // Since showLocalDropdown already checks !isGlobalFilterForThisField, we can always use selectedLabel here
  const selectedLabelForDropdown = selectedLabel;
  const onLabelSelect = setSelectedLabel;
  const valueModeLabels = valueModeOptions.map((option) => option.label);
  const showValueModeDropdown = valueModeLabels.length > 1;
  const selectedValueModeLabel = selectedValueModeOption?.label || valueModeLabels[0] || '';

  const handleValueModeSelect = useCallback((selectedLabelValueMode) => {
    const selectedKey = valueModeKeyByLabel[selectedLabelValueMode];
    if (selectedKey) {
      setSelectedValueMode(selectedKey);
    }
  }, [valueModeKeyByLabel]);

  const showInfoPopover = Boolean(widgetConfig.metricDescription);
  const showDownloadButton = widgetConfig.type === 'chart';
  const isDownloadDisabled = loading || Boolean(error);

  const handleDownloadChart = useCallback((event) => {
    if (!showDownloadButton) return;

    const trigger = event?.currentTarget;
    const container = trigger?.closest('.chart-modal, .metric-card, .minimal-widget-container');
    const chartNode = container?.querySelector('.echarts-container');
    if (!chartNode) return;

    const chartInstance = echarts.getInstanceByDom(chartNode);
    if (!chartInstance) return;

    downloadEChartInstanceAsPng(chartInstance, {
      title: widgetConfig.title || metricId,
      isDarkMode,
      anchorElement: container
    });
  }, [showDownloadButton, widgetConfig.title, metricId, isDarkMode]);

  const chartRenderConfig = useMemo(() => {
    const metricHasValueField = !!widgetConfig.config?.valueField;
    const baseConfig = {
      ...widgetConfig.config,
      dashboardPalette,
      ...(!metricHasValueField ? { yField: effectiveValueConfig.yField } : {}),
      valueField: effectiveValueConfig.valueField,
      format: effectiveValueConfig.format,
      visualMapCenter: effectiveValueConfig.visualMapCenter,
      visualMapPercentile: effectiveValueConfig.visualMapPercentile,
      enableZoom: widgetConfig.enableZoom,
      ...(hasTimeRangeZoom ? { hideSlider: true } : {})
    };
    // Override yAxis name with the resolved unit label (e.g. "USD", "EURE", "SDAI")
    if (resolvedUnitLabel && baseConfig.yAxis) {
      baseConfig.yAxis = { ...baseConfig.yAxis, name: resolvedUnitLabel };
    }
    return baseConfig;
  }, [
    widgetConfig.config,
    dashboardPalette,
    widgetConfig.enableZoom,
    effectiveValueConfig.yField,
    effectiveValueConfig.valueField,
    effectiveValueConfig.format,
    effectiveValueConfig.visualMapCenter,
    effectiveValueConfig.visualMapPercentile,
    resolvedUnitLabel,
    hasTimeRangeZoom
  ]);

  const showResolutionSelector = supportsResolution && widgetConfig.resolutions;
  const showUnitSelector = supportsLocalUnitToggle;

  const headerControls = (headerActions || showMultiLocalDropdowns || showLocalDropdown || showResolutionSelector || showUnitSelector || showValueModeDropdown || showInfoPopover || showDownloadButton || showLocalTimeRange) ? (
    <>
      {headerActions}
      {showMultiLocalDropdowns && multiLocalFilterFields.map((fieldName) => {
        const labels = localFilterOptionsByField[fieldName] || [];
        if (labels.length === 0) {
          return null;
        }

        const selectedValue = labels.includes(selectedLocalFilters[fieldName])
          ? selectedLocalFilters[fieldName]
          : labels[0];

        return (
          <LabelSelector
            key={fieldName}
            labels={labels}
            selectedLabel={selectedValue}
            onSelectLabel={(nextSelectedValue) => handleMultiLocalFilterSelect(fieldName, nextSelectedValue)}
            labelField={fieldName}
            idPrefix={`${metricId}-${fieldName}`}
            iconMap={fieldName === 'token' ? TOKEN_ICON_URLS : null}
            formatLabel={fieldName === 'token' ? formatTokenSymbol : null}
          />
        );
      })}
      {showLocalDropdown && (
        <LabelSelector
          labels={labelsForDropdown}
          selectedLabel={selectedLabelForDropdown}
          onSelectLabel={onLabelSelect}
          iconMap={widgetConfig?.labelField === 'token' ? TOKEN_ICON_URLS : null}
          formatLabel={widgetConfig?.labelField === 'token' ? formatTokenSymbol : null}
        />
      )}
      {showResolutionSelector && (
        <div className="resolution-toggle">
          {widgetConfig.resolutions.map(res => (
            <button
              key={res}
              type="button"
              className={`resolution-btn${localResolution === res ? ' active' : ''}`}
              onClick={() => setLocalResolution(res)}
            >
              {RESOLUTION_LABELS[res] || res}
            </button>
          ))}
        </div>
      )}
      {showLocalTimeRange && (
        <div className="resolution-toggle">
          {LOCAL_TIME_RANGES.map(range => (
            <button
              key={range}
              type="button"
              className={`resolution-btn${localTimeRange === range ? ' active' : ''}`}
              onClick={() => setLocalTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      )}
      {showUnitSelector && !hasGroupedUnits && (
        <div className="resolution-toggle">
          {Object.entries(
            baseMetricConfig?.unitFields
              ? Object.fromEntries(Object.entries(baseMetricConfig.unitFields).map(([k, v]) => [k, getDisplayUnitLabel(k, v, timeFilteredData?.data?.[0])]))
              : UNIT_LABELS
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`resolution-btn${localUnit === key ? ' active' : ''}`}
              onClick={() => setLocalUnit(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {showUnitSelector && hasGroupedUnits && unitFieldGroups.map((group, groupIndex) => {
        const activePart = localUnit.split('|')[groupIndex] || Object.keys(group.options)[0];
        return (
          <div key={groupIndex} className="resolution-toggle">
            {Object.entries(group.options).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`resolution-btn${activePart === key ? ' active' : ''}`}
                onClick={() => setGroupedUnit(groupIndex, key)}
              >
                {label}
              </button>
            ))}
          </div>
        );
      })}
      {showValueModeDropdown && (
        <LabelSelector
          labels={valueModeLabels}
          selectedLabel={selectedValueModeLabel}
          onSelectLabel={handleValueModeSelect}
        />
      )}
      {showInfoPopover && (
        <InfoPopover text={widgetConfig.metricDescription} />
      )}
      {showDownloadButton && (
        <button
          type="button"
          className="metric-download-button"
          onClick={handleDownloadChart}
          disabled={isDownloadDisabled}
          aria-label={`Download ${widgetConfig.title || 'chart'} as PNG`}
          title="Download chart as PNG"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3V14M12 14L8 10M12 14L16 10M4 17V18.5C4 19.8807 5.11929 21 6.5 21H17.5C18.8807 21 20 19.8807 20 18.5V17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  ) : undefined;

  // Early returns must come AFTER all hooks
  const showSkeleton = (loading && !data) ||
    (data && isSecondaryGlobalFilterForThisField && !secondaryGlobalFilterValue);

  if (showSkeleton) {
    return (
      <Card
        ref={cardRef}
        minimal={minimal}
        title={widgetConfig.title}
        subtitle={widgetConfig.description}
        headerControls={headerControls}
        chartType={widgetConfig.chartType}
      >
        <MetricWidgetSkeleton variant={widgetConfig.type} />
      </Card>
    );
  }

  if (error) {
    const errorCode = error?.code || null;
    // InvalidMetric: the metric isn't registered. Hide the widget entirely
    // rather than shaming the user with a configuration error.
    if (errorCode === 'InvalidMetric') {
      return null;
    }
    // MissingMetricSource / FilterRequired: permanent "no data for this
    // address" states. Render a calm empty state, no retry button.
    const isPermanent = errorCode === 'MissingMetricSource'
      || errorCode === 'FilterRequired';
    return (
      <Card
        ref={cardRef}
        minimal={minimal}
        title={widgetConfig.title}
        subtitle={widgetConfig.description}
        headerControls={headerControls}
        chartType={widgetConfig.chartType}
      >
        <div className={`metric-fallback ${isPermanent ? 'metric-fallback--empty' : 'metric-fallback--error'}`}>
          {isPermanent ? (
            <span className="metric-fallback__placeholder" aria-label="No data">—</span>
          ) : (
            <>
              <span className="metric-fallback__message">Couldn’t load</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="metric-fallback__retry"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </Card>
    );
  }

  const renderContent = () => {
    switch (widgetConfig.type) {
      case 'text':
        return <TextWidget content={data?.content || 'No content available'} minimal={true} />;
      
      case 'number':
        const value = timeFilteredData?.data?.[0]?.[effectiveValueConfig.valueField] || 0;
        return (
          <NumberWidget
            value={value}
            format={effectiveValueConfig.format}
            color={widgetConfig.color}
            label={undefined} // Never pass label in compact mode - title is shown in header
            isDarkMode={isDarkMode}
            variant={widgetConfig.variant || 'default'}
            showChange={processChangeData.showChange}
            changeValue={processChangeData.changeValue}
            changeType={processChangeData.changeType}
            changePeriod={processChangeData.changePeriod}
            fontSize={widgetConfig.fontSize}
            dashboardPalette={dashboardPalette}
            minimal={true}
          />
        );

      case 'kpi': {
        // Time-series input: last row is the headline value, compute delta vs first row.
        const rows = Array.isArray(timeFilteredData?.data) ? timeFilteredData.data : [];
        const sparkField = metricConfig?.sparklineField || effectiveValueConfig.valueField || 'value';
        const numericValues = rows
          .map((r) => (r && r[sparkField] != null ? Number(r[sparkField]) : null))
          .filter((n) => Number.isFinite(n));

        const latest = numericValues.length > 0 ? numericValues[numericValues.length - 1] : 0;
        const earliest = numericValues.length > 0 ? numericValues[0] : 0;
        // Only compute a delta when we have at least two datapoints to compare.
        const deltaPct = numericValues.length >= 2 && earliest !== 0 && Number.isFinite(earliest)
          ? ((latest - earliest) / Math.abs(earliest)) * 100
          : null;
        const deltaType = deltaPct == null
          ? 'neutral'
          : (deltaPct > 0 ? 'positive' : (deltaPct < 0 ? 'negative' : 'neutral'));
        const deltaStr = deltaPct == null ? '' : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(2)}%`;

        const linkTo = metricConfig?.linkTo || null;
        const onLinkClick = linkTo
          ? (dashboardId) => {
              // Use a custom event that Dashboard.js listens for — a synthetic
              // popstate does not reliably trigger React's popstate handler
              // across all browsers, so we dispatch an explicit navigation
              // event that Dashboard wires to its handleNavigation.
              window.dispatchEvent(new CustomEvent('overview:navigate', {
                detail: { dashboardId, tabId: metricConfig?.linkToTab || null }
              }));
            }
          : null;

        return (
          <NumberWidget
            value={latest}
            format={effectiveValueConfig.format}
            color={widgetConfig.color}
            label={metricConfig?.kpiLabel || undefined}
            isDarkMode={isDarkMode}
            variant="kpi"
            showChange={deltaPct != null}
            changeValue={deltaStr}
            changeType={deltaType}
            changePeriod={metricConfig?.changePeriod || ''}
            fontSize={widgetConfig.fontSize}
            dashboardPalette={dashboardPalette}
            sparkline={numericValues}
            linkTo={linkTo}
            onLinkClick={onLinkClick}
          />
        );
      }

      case 'table': {
        // Build the config passed to TableWidget, merging any metric-level options
        // (paginationSize, initialSort, selectableRows, columns, etc.) with a
        // row-selection handler that cascades the selected row(s) to the tab's
        // secondary global filter (so explorer-style tabs can overlay per-validator
        // series on top of the aggregate). Only wired when:
        //   * the metric declares `rowSelectionEmits` (e.g. ['validator_index']),
        //   * the tab has a secondaryGlobalFilterField matching one of the emitted
        //     fields,
        //   * the parent provided an onSecondaryGlobalFilterChange handler.
        const emits = Array.isArray(widgetConfig.rowSelectionEmits)
          ? widgetConfig.rowSelectionEmits
          : null;
        const canCascadeSelection = !!(
          emits &&
          secondaryGlobalFilterField &&
          emits.includes(secondaryGlobalFilterField) &&
          typeof onSecondaryGlobalFilterChange === 'function'
        );
        const scopedTableOverrides = tableConfigOverrides && typeof tableConfigOverrides === 'object'
          ? tableConfigOverrides
          : {};
        const tableConfig = {
          ...(metricConfig.tableConfig || {}),
          // Pass through the column / pagination / sort config defined on the metric
          // itself (queries/*.js) so each table metric controls its own UX without
          // going through tableConfig.
          columns: widgetConfig.columns || metricConfig.tableConfig?.columns,
          paginationSize: widgetConfig.paginationSize ?? metricConfig.tableConfig?.paginationSize,
          paginationSizeSelector: widgetConfig.paginationSizeSelector ?? metricConfig.tableConfig?.paginationSizeSelector,
          initialSort: widgetConfig.initialSort ?? metricConfig.tableConfig?.initialSort,
          selectableRows: widgetConfig.selectableRows ?? metricConfig.tableConfig?.selectableRows,
          ...scopedTableOverrides,
          serverPagination: metricConfig.serverPagination === true,
          totalRows: data?.total,
          lastPage: data?.lastPage,
          remoteDataLoader: metricConfig.serverPagination === true
            ? async ({ page, pageSize, sortField, sortDir, search }) => {
                const result = await metricsService.getMetricData(effectiveMetricId, buildMetricRequestParams({
                  page,
                  pageSize,
                  sortField,
                  sortDir,
                  search,
                  includeTotal: 'true',
                }));
                return result;
              }
            : undefined,
          onRowClick: typeof onTableRowClick === 'function'
            ? (row, tabulatorRow, event) => onTableRowClick({
                metricId: effectiveMetricId,
                row,
                tabulatorRow,
                event
              })
            : metricConfig.tableConfig?.onRowClick,
          onRowSelectionChange: canCascadeSelection
            ? (rows) => {
                // Join selected values with comma so the API's IN-list filter picks
                // them up (see metric's `applySecondaryGlobalFilter` on the chart side).
                // Empty selection → null, clearing the filter and reverting charts to
                // the credential-level aggregate.
                if (!rows || rows.length === 0) {
                  onSecondaryGlobalFilterChange(null);
                  return;
                }
                const values = rows
                  .map((r) => r && r[secondaryGlobalFilterField])
                  .filter((v) => v !== null && v !== undefined && v !== '');
                onSecondaryGlobalFilterChange(values.length > 0 ? values.join(',') : null);
              }
            : undefined,
        };
        return (
          <TableWidget
            data={timeFilteredData?.data || []}
            config={tableConfig}
            minimal={true}
            isDarkMode={isDarkMode}
            format={widgetConfig.format}
            height={tableHeight || undefined}
          />
        );
      }
      
      case 'chart':
        if (isSecondaryGlobalFilterForThisField && secondaryGlobalFilterValue && (timeFilteredData?.data?.length ?? 0) === 0) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
              No data available
            </div>
          );
        }
        return (
          <EChartsContainer
            data={timeFilteredData?.data || []}
            chartType={widgetConfig.chartType}
            config={chartRenderConfig}
            isDarkMode={isDarkMode}
            width="100%"
            height="100%"
            showWatermark={!minimal}
          />
        );
      
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <Card
      ref={cardRef}
      minimal={minimal}
      title={widgetConfig.title}
      subtitle={widgetConfig.description}
      className={`metric-widget ${className}`}
      headerControls={headerControls}
      expandable={widgetConfig.type === 'chart'}
      isDarkMode={isDarkMode}
      chartType={widgetConfig.chartType}
      titleFontSize={widgetConfig.titleFontSize}
      cardVariant={widgetConfig.cardVariant}
    >
      {/* Loading overlay shown during refetch (when we have data but are loading new data) */}
      {loading && data && (
        <div className="loading-overlay loading-overlay-subtle" aria-hidden="true">
          <div className="loading-shimmer"></div>
        </div>
      )}
      {renderContent()}
    </Card>
  );
};

export default MetricWidget;
