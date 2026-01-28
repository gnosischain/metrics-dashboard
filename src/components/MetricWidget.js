import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '', globalSelectedLabel = null, hasGlobalFilter = false, globalFilterField = null, globalFilterValue = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const isMounted = useRef(true);

  // Determine if we're using global filter or local filter
  // If hasGlobalFilter is true, we should use global filter (even if value is null yet - it will be set soon)
  const isUsingGlobalFilter = hasGlobalFilter || (globalSelectedLabel !== null && globalSelectedLabel !== undefined);
  // Use global filter if provided, otherwise use local state
  const effectiveSelectedLabel = (hasGlobalFilter && globalSelectedLabel) ? globalSelectedLabel : (isUsingGlobalFilter ? globalSelectedLabel : selectedLabel);

  const metricConfig = useMemo(() => metricsService.getMetricConfig(metricId), [metricId]);

  const widgetConfig = useMemo(() => {
    if (!metricConfig) {
      return { type: 'error', error: 'Metric configuration not found' };
    }
    const { 
        chartType = 'line', 
        name, 
        description, 
        format, 
        color, 
        labelField,
        valueField,
        enableFiltering = false, 
        enableZoom = false,
        variant, 
        changeData,
        fontSize,
        titleFontSize
    } = metricConfig;

    let widgetType = 'chart';
    if (chartType === 'text') widgetType = 'text';
    if (chartType === 'number' || chartType === 'numberDisplay') widgetType = 'number';
    if (chartType === 'table') widgetType = 'table';
    
    return { 
      type: widgetType, 
      chartType, 
      title: name, 
      description, 
      format, 
      color, 
      labelField, 
      valueField, 
      enableFiltering, 
      enableZoom, 
      variant,
      changeData,
      fontSize,
      titleFontSize,
      config: metricConfig 
    };
  }, [metricConfig]);

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

  const fetchData = useCallback(async () => {
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

      const result = await metricsService.getMetricData(metricId, params);
      
      if (isMounted.current) {
        setData(result);
        
        if (widgetConfig.enableFiltering && result?.data?.length > 0) {
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
      if (isMounted.current) {
        setError(err.message);
        console.error('Error fetching metric data:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  // Note: selectedLabel is intentionally excluded from dependencies.
  // Local filter changes should NOT trigger refetches - filtering is done client-side.
  // Only metricId and global filter changes should trigger API calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    metricId,
    globalFilterField,
    globalFilterValue
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply per-chart filter (secondary filter) if applicable.
  // Note: Global filter is already applied server-side, so data is pre-filtered by token.
  // We only need to apply secondary filtering (e.g., by pool) client-side.
  const filteredData = useMemo(() => {
    if (!data?.data) return data;
    
    // If no filtering enabled, return data as-is (already filtered by server)
    if (!widgetConfig.enableFiltering) {
      return data;
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
  }, [data, widgetConfig.enableFiltering, widgetConfig.labelField, effectiveSelectedLabel, isGlobalFilterForThisField, shouldShowSecondaryFilter, selectedLabel]);

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
    if (!shouldShowSecondaryFilter || !data?.data) return availableLabels;
    
    // Extract unique labels from server-filtered data (e.g., pools containing selected token)
    const uniqueLabels = [...new Set(data.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
    return uniqueLabels;
  }, [shouldShowSecondaryFilter, data, widgetConfig.labelField, availableLabels]);

  // Update available labels when data changes (for secondary filters)
  // Also handles Issue 5: reset selectedLabel if it's no longer valid after global filter change
  // MUST be before any early returns (Rules of Hooks)
  useEffect(() => {
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
  }, [shouldShowSecondaryFilter, data, widgetConfig.labelField, selectedLabel]);

  // Show per-metric dropdown if:
  // 1. Not using global filter for this field, OR
  // 2. Using a secondary filter (different field than global filter)
  const showLocalDropdown = widgetConfig.enableFiltering && 
    !isGlobalFilterForThisField && 
    (availableSecondaryLabels.length > 0 || availableLabels.length > 0);
  
  const labelsForDropdown = shouldShowSecondaryFilter ? availableSecondaryLabels : availableLabels;
  // Since showLocalDropdown already checks !isGlobalFilterForThisField, we can always use selectedLabel here
  const selectedLabelForDropdown = selectedLabel;
  const onLabelSelect = setSelectedLabel;

  const headerControls = showLocalDropdown ? (
    <LabelSelector
      labels={labelsForDropdown}
      selectedLabel={selectedLabelForDropdown}
      onSelectLabel={onLabelSelect}
    />
  ) : undefined;

  // Early returns must come AFTER all hooks
  if (loading && !data) {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        chartType={widgetConfig.chartType} // Pass chartType for styling
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
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
        const value = filteredData?.data?.[0]?.[widgetConfig.valueField || 'value'] || 0;
        return (
          <NumberWidget
            value={value}
            format={widgetConfig.format}
            color={widgetConfig.color}
            label={undefined} // Never pass label in compact mode - title is shown in header
            isDarkMode={isDarkMode}
            variant={widgetConfig.variant || 'default'}
            showChange={processChangeData.showChange}
            changeValue={processChangeData.changeValue}
            changeType={processChangeData.changeType}
            changePeriod={processChangeData.changePeriod}
            fontSize={widgetConfig.fontSize}
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
            config={{
              ...widgetConfig.config,
              enableZoom: widgetConfig.enableZoom
            }}
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
    >
      {/* Loading overlay shown during refetch (when we have data but are loading new data) */}
      {loading && data && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      {renderContent()}
    </Card>
  );
};

export default MetricWidget;