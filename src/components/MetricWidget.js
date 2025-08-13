import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const isMounted = useRef(true);

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
        variant, // New: support for widget variants
        changeData // New: support for change indicators
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
      config: metricConfig 
    };
  }, [metricConfig]);

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
      
      const result = await metricsService.getMetricData(metricId);
      
      if (isMounted.current) {
        setData(result);
        
        if (widgetConfig.enableFiltering && result?.data?.length > 0) {
          const uniqueLabels = [...new Set(result.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
          setAvailableLabels(uniqueLabels);
          
          if (!selectedLabel && uniqueLabels.length > 0) {
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
  }, [metricId, widgetConfig.enableFiltering, widgetConfig.labelField, selectedLabel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!data || !widgetConfig.enableFiltering || !selectedLabel) return data;
    
    return {
      ...data,
      data: data.data.filter(item => item[widgetConfig.labelField] === selectedLabel)
    };
  }, [data, widgetConfig.enableFiltering, widgetConfig.labelField, selectedLabel]);

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

  if (loading && !data) {
    return (
      <Card minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
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

  const headerControls = widgetConfig.enableFiltering && availableLabels.length > 0 ? (
    <LabelSelector
      labels={availableLabels}
      selectedLabel={selectedLabel}
      onSelectLabel={setSelectedLabel}
    />
  ) : undefined;

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
    >
      {renderContent()}
    </Card>
  );
};

export default MetricWidget;