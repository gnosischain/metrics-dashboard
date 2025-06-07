import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

/**
 * Enhanced MetricWidget with ECharts integration
 * Supports all chart types through the modular ECharts system
 */
const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '' }) => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  
  // Refs
  const isMounted = useRef(true);
  const previousMetricId = useRef(metricId);

  // Get metric configuration
  const metricConfig = useMemo(() => {
    return metricsService.getMetricConfig(metricId);
  }, [metricId]);

  // Determine widget type and configuration
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
      xField = 'date',
      yField = 'value',
      seriesField,
      labelField,
      valueField = 'value',
      enableFiltering = false,
      legendPosition = 'top',
      enableZoom = false,
      enablePan = false,
      smooth = false,
      symbolSize = 4,
      lineWidth = 2
    } = metricConfig;

    // Determine widget type
    let widgetType;
    if (chartType === 'text') {
      widgetType = 'text';
    } else if (chartType === 'number') {
      widgetType = 'number';
    } else if (chartType === 'table') {
      widgetType = 'table';
    } else {
      widgetType = 'chart';
    }

    return {
      type: widgetType,
      chartType,
      title: name,
      description,
      format,
      color,
      xField,
      yField,
      seriesField,
      labelField,
      valueField,
      enableFiltering,
      legendPosition,
      enableZoom,
      enablePan,
      smooth,
      symbolSize,
      lineWidth,
      config: metricConfig
    };
  }, [metricConfig]);

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      if (!metricId || widgetConfig.type === 'error') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`MetricWidget[${metricId}]: Fetching data...`);
        const fetchedData = await metricsService.fetchMetricData(metricId);
        
        if (!isMounted.current) return;

        if (fetchedData) {
          console.log(`MetricWidget[${metricId}]: Data received`, {
            type: Array.isArray(fetchedData) ? 'array' : typeof fetchedData,
            length: Array.isArray(fetchedData) ? fetchedData.length : 'N/A',
            sample: Array.isArray(fetchedData) ? fetchedData.slice(0, 2) : fetchedData
          });

          setData(fetchedData);

          // Extract available labels for filtering
          if (widgetConfig.enableFiltering && widgetConfig.labelField && Array.isArray(fetchedData)) {
            const labels = [...new Set(fetchedData.map(item => item[widgetConfig.labelField]).filter(Boolean))];
            setAvailableLabels(labels);
            
            // Set default selection to first label if none selected
            if (!selectedLabel && labels.length > 0) {
              setSelectedLabel(labels[0]);
            }
          }
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(`MetricWidget[${metricId}]: Error fetching data:`, err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metricId, widgetConfig.type, widgetConfig.enableFiltering, widgetConfig.labelField, selectedLabel]);

  // Filter data based on selected label
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data) || !widgetConfig.enableFiltering || !selectedLabel || !widgetConfig.labelField) {
      return data;
    }

    return data.filter(item => item[widgetConfig.labelField] === selectedLabel);
  }, [data, selectedLabel, widgetConfig.enableFiltering, widgetConfig.labelField]);

  // Handle label selection
  const handleLabelChange = useCallback((newLabel) => {
    setSelectedLabel(newLabel);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset state when metric changes
  useEffect(() => {
    if (previousMetricId.current !== metricId) {
      setData(null);
      setError(null);
      setSelectedLabel('');
      setAvailableLabels([]);
      previousMetricId.current = metricId;
    }
  }, [metricId]);

  // Render loading state
  if (loading) {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        className={`metric-widget loading ${className}`}
      >
        <div className="metric-widget-loading">
          <div className="loading-spinner" />
          <span>Loading...</span>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error || widgetConfig.type === 'error') {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        className={`metric-widget error ${className}`}
      >
        <div className="metric-widget-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error || widgetConfig.error}</span>
        </div>
      </Card>
    );
  }

  // Render text widget
  if (widgetConfig.type === 'text') {
    const content = typeof data === 'string' ? data : (data?.content || 'No content available');
    return (
      <TextWidget
        title={widgetConfig.title}
        subtitle={widgetConfig.description}
        content={content}
        minimal={minimal}
      />
    );
  }

  // Render number widget
  if (widgetConfig.type === 'number') {
    const value = typeof data === 'number' ? data : (data?.value || data?.[0]?.[widgetConfig.valueField] || 0);
    return (
      <NumberWidget
        title={widgetConfig.title}
        subtitle={widgetConfig.description}
        value={value}
        format={widgetConfig.format}
        color={widgetConfig.color}
        minimal={minimal}
      />
    );
  }

  // Render table widget
  if (widgetConfig.type === 'table') {
    return (
      <Card 
        minimal={minimal} 
        title={widgetConfig.title} 
        subtitle={widgetConfig.description}
        className={`metric-widget table ${className}`}
      >
        {widgetConfig.enableFiltering && availableLabels.length > 0 && (
          <LabelSelector
            labels={availableLabels}
            selectedLabel={selectedLabel}
            onLabelChange={handleLabelChange}
            isDarkMode={isDarkMode}
          />
        )}
        <TableWidget
          data={filteredData || []}
          config={widgetConfig.config}
          format={widgetConfig.format}
          isDarkMode={isDarkMode}
        />
      </Card>
    );
  }

  // Render chart widget (default)
  return (
    <Card 
      minimal={minimal} 
      title={widgetConfig.title} 
      subtitle={widgetConfig.description}
      className={`metric-widget chart ${className}`}
    >
      {widgetConfig.enableFiltering && availableLabels.length > 0 && (
        <LabelSelector
          labels={availableLabels}
          selectedLabel={selectedLabel}
          onLabelChange={handleLabelChange}
          isDarkMode={isDarkMode}
        />
      )}
      <div className="chart-container">
        <EChartsContainer
          data={filteredData || []}
          chartType={widgetConfig.chartType}
          config={widgetConfig.config}
          isDarkMode={isDarkMode}
          width="100%"
          height="400px"
        />
      </div>
    </Card>
  );
};

export default MetricWidget;