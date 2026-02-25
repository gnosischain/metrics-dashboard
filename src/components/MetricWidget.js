import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import InfoPopover from './InfoPopover';
import MetricWidgetSkeleton from './MetricWidgetSkeleton';
import metricsService from '../services/metrics';
import { downloadEChartInstanceAsPng } from '../utils/echarts/exportImage';

const RESOLUTION_LABELS = { daily: 'D', weekly: 'W', monthly: 'M' };
const UNIT_LABELS = { native: 'Native', usd: 'USD' };

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
  enableUnitToggle = false
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedLocalFilters, setSelectedLocalFilters] = useState({});
  const [selectedValueMode, setSelectedValueMode] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const isMounted = useRef(true);
  const requestSequenceRef = useRef(0);

  // Per-chart resolution toggle (independent per widget)
  const baseMetricConfig = useMemo(() => metricsService.getMetricConfig(metricId), [metricId]);

  // Per-chart unit toggle (independent per widget)
  const [localUnit, setLocalUnit] = useState('usd');
  const supportsLocalUnitToggle = enableUnitToggle && !selectedUnit && baseMetricConfig?.unitFilterField;
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
        localFilterFields
    } = metricConfig;

    let widgetType = 'chart';
    if (chartType === 'text') widgetType = 'text';
    if (chartType === 'number' || chartType === 'numberDisplay') widgetType = 'number';
    if (chartType === 'table') widgetType = 'table';
    
    const resolvedCardVariant = chartType === 'numberDisplay'
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
        )
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
  const shouldShowSecondaryFilter = useMemo(() => {
    return widgetConfig?.enableFiltering && 
      globalFilterField && 
      widgetConfig?.labelField && 
      widgetConfig.labelField !== globalFilterField;
  }, [widgetConfig?.enableFiltering, widgetConfig?.labelField, globalFilterField]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
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

  const fetchData = useCallback(async () => {
    // If this widget uses global filter but the value isn't set yet, skip fetch.
    // The fetch will trigger once globalFilterValue is set.
    if (hasGlobalFilter && !globalFilterValue) {
      return;
    }

    const requestId = ++requestSequenceRef.current;

    try {
      setLoading(true);
      setError(null);
      
      // Check if metricsService has the getMetricData method
      if (!metricsService || typeof metricsService.getMetricData !== 'function') {
        throw new Error('Metrics service is not properly initialized');
      }
      
      // Build params for server-side filtering.
      // Let server use its default date range (365 days) for full data.
      // Server-side global filter reduces data transfer significantly.
      const params = {};
      if (globalFilterField && globalFilterValue) {
        params.filterField = globalFilterField;
        params.filterValue = globalFilterValue;
      }
      if (effectiveUnit && metricConfig?.unitFilterField) {
        params.filterField2 = metricConfig.unitFilterField;
        params.filterValue2 = effectiveUnit;
      }

      const result = await metricsService.getMetricData(effectiveMetricId, params);
      
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
      if (isMounted.current && requestId === requestSequenceRef.current) {
        setError(err.message);
        console.error('Error fetching metric data:', err);
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
    effectiveUnit,
    metricConfig?.unitFilterField
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    selectedLabel
  ]);

  // Process change data for number widgets
  const processChangeData = useMemo(() => {
    if (widgetConfig.type !== 'number' || !widgetConfig.changeData || !filteredData?.data) {
      return { showChange: false };
    }

    const changeConfig = widgetConfig.changeData;
    const dataArray = Array.isArray(filteredData.data) ? filteredData.data : [filteredData.data];
    
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
  }, [widgetConfig, filteredData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

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

  const chartRenderConfig = useMemo(() => ({
    ...widgetConfig.config,
    dashboardPalette,
    yField: effectiveValueConfig.yField,
    valueField: effectiveValueConfig.valueField,
    format: effectiveValueConfig.format,
    enableZoom: widgetConfig.enableZoom
  }), [
    widgetConfig.config,
    dashboardPalette,
    widgetConfig.enableZoom,
    effectiveValueConfig.yField,
    effectiveValueConfig.valueField,
    effectiveValueConfig.format
  ]);

  const showResolutionSelector = supportsResolution && widgetConfig.resolutions;
  const showUnitSelector = supportsLocalUnitToggle;

  const headerControls = (showMultiLocalDropdowns || showLocalDropdown || showResolutionSelector || showUnitSelector || showValueModeDropdown || showInfoPopover || showDownloadButton) ? (
    <>
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
          />
        );
      })}
      {showLocalDropdown && (
        <LabelSelector
          labels={labelsForDropdown}
          selectedLabel={selectedLabelForDropdown}
          onSelectLabel={onLabelSelect}
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
      {showUnitSelector && (
        <div className="resolution-toggle">
          {Object.entries(UNIT_LABELS).map(([key, label]) => (
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
  if (loading && !data) {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        headerControls={headerControls}
        chartType={widgetConfig.chartType} // Pass chartType for styling
      >
        <MetricWidgetSkeleton variant={widgetConfig.type} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        headerControls={headerControls}
        chartType={widgetConfig.chartType} // Pass chartType for styling
      >
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={handleRefresh} className="refresh-button">
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const renderContent = () => {
    switch (widgetConfig.type) {
      case 'text':
        return <TextWidget content={data?.content || 'No content available'} minimal={true} />;
      
      case 'number':
        const value = filteredData?.data?.[0]?.[effectiveValueConfig.valueField] || 0;
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
      
      case 'table':
        return (
          <TableWidget 
            data={filteredData?.data || []} 
            config={metricConfig.tableConfig || {}} 
            minimal={true}
            isDarkMode={isDarkMode}
            format={widgetConfig.format}
          />
        );
      
      case 'chart':
        return (
          <EChartsContainer
            data={filteredData?.data || []}
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
