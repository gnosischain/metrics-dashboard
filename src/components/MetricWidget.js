// MetricWidget.js - Complete file with proper watermark positioning
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';
import { addUniversalWatermark, removeUniversalWatermark } from '../utils/watermarkUtils';

/**
 * Enhanced MetricWidget with ECharts integration and watermark support
 * Supports all chart types through the modular ECharts system
 */
const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '' }) => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  const [containerHeight, setContainerHeight] = useState('400px');
  
  // Refs
  const isMounted = useRef(true);
  const chartContainerRef = useRef(null);
  const cardRef = useRef(null);
  const resizeObserverRef = useRef(null);

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

  // Add watermark to chart container
  useEffect(() => {
    if (widgetConfig.type === 'chart' && chartContainerRef.current && !loading && !minimal) {
      const chartContainer = chartContainerRef.current;
      
      // Add watermark with a slight delay to ensure chart is rendered
      const timer = setTimeout(() => {
        // Check if chart has zoom enabled
        const hasZoom = widgetConfig.enableZoom;
        
        addUniversalWatermark({ current: chartContainer }, isDarkMode, {
          className: 'card-chart-watermark',
          size: 35,
          position: 'bottom-right',
          margin: 15,
          opacity: isDarkMode ? 0.4 : 0.3,
          zIndex: 1000,
          preventDuplicates: true,
          // Adjust position if zoom is enabled
          customStyles: hasZoom ? { bottom: '55px' } : {}
        });
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (chartContainer) {
          removeUniversalWatermark({ current: chartContainer }, 'card-chart-watermark');
        }
      };
    }
  }, [widgetConfig.type, widgetConfig.enableZoom, chartContainerRef, loading, isDarkMode, minimal]);

  // Calculate dynamic chart height based on card size
  const calculateChartHeight = useCallback(() => {
    if (!cardRef.current || widgetConfig.type !== 'chart') return;

    const card = cardRef.current;
    const cardContent = card.querySelector('.card-content');
    if (!cardContent) return;

    // Get the card's total height
    const cardRect = cardContent.getBoundingClientRect();
    const cardHeight = cardRect.height;

    // Calculate available height for chart
    // Account for header, padding, and controls
    const headerHeight = card.querySelector('.card-header')?.offsetHeight || 0;
    const filterHeight = card.querySelector('.label-selector')?.offsetHeight || 0;
    const padding = 32; // Total vertical padding
    const minHeight = 300; // Minimum chart height
    
    // For charts with zoom, reserve less space at bottom since zoom is now inline
    const bottomReserve = widgetConfig.enableZoom ? 20 : 10;
    
    // Calculate the optimal height
    let optimalHeight = cardHeight - headerHeight - filterHeight - padding - bottomReserve;
    
    // Ensure minimum height
    optimalHeight = Math.max(optimalHeight, minHeight);
    
    // Apply the calculated height
    setContainerHeight(`${optimalHeight}px`);
  }, [widgetConfig.type, widgetConfig.enableZoom]);

  // Setup ResizeObserver for dynamic height adjustment
  useEffect(() => {
    if (widgetConfig.type !== 'chart' || !cardRef.current) return;

    // Create ResizeObserver
    resizeObserverRef.current = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to debounce resize calculations
      requestAnimationFrame(() => {
        calculateChartHeight();
      });
    });

    // Observe the card element
    resizeObserverRef.current.observe(cardRef.current);

    // Initial calculation
    calculateChartHeight();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [calculateChartHeight, widgetConfig.type]);

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
            length: Array.isArray(fetchedData) ? fetchedData.length : undefined
          });
          setData(fetchedData);
          
          // Extract available labels if filtering is enabled
          if (widgetConfig.enableFiltering && widgetConfig.labelField && Array.isArray(fetchedData)) {
            const labels = [...new Set(fetchedData.map(item => item[widgetConfig.labelField]).filter(Boolean))];
            setAvailableLabels(labels);
            if (labels.length > 0 && !selectedLabel) {
              setSelectedLabel(labels[0]);
            }
          }
        } else {
          console.warn(`MetricWidget[${metricId}]: No data received`);
          setData([]);
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error(`MetricWidget[${metricId}]: Error fetching data:`, err);
        setError(err.message || 'Failed to load data');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [metricId, widgetConfig.enableFiltering, widgetConfig.labelField, widgetConfig.type, selectedLabel]);

  // Handle label selection change
  const handleLabelChange = useCallback((label) => {
    setSelectedLabel(label);
  }, []);

  // Filter data based on selected label
  const filteredData = useMemo(() => {
    if (!widgetConfig.enableFiltering || !selectedLabel || !widgetConfig.labelField || !Array.isArray(data)) {
      return data;
    }
    return data.filter(item => item[widgetConfig.labelField] === selectedLabel);
  }, [data, selectedLabel, widgetConfig.enableFiltering, widgetConfig.labelField]);

  // Handle error state
  if (widgetConfig.type === 'error') {
    return (
      <Card minimal={minimal} className={`metric-widget error ${className}`}>
        <div className="error-message">
          <h3>Configuration Error</h3>
          <p>{widgetConfig.error}</p>
        </div>
      </Card>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <Card minimal={minimal} className={`metric-widget loading ${className}`}>
        <div className="loading-spinner">Loading...</div>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card minimal={minimal} className={`metric-widget error ${className}`}>
        <div className="error-message">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
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
        ref={cardRef}
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
      ref={cardRef}
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
      <div 
        className={`chart-container dynamic-height ${widgetConfig.enableZoom ? 'has-zoom' : ''}`} 
        ref={chartContainerRef} 
        style={{ height: containerHeight }}
      >
        <EChartsContainer
          data={filteredData || []}
          chartType={widgetConfig.chartType}
          config={widgetConfig.config}
          isDarkMode={isDarkMode}
          width="100%"
          height="100%"
          showWatermark={false}
        />
      </div>
    </Card>
  );
};

export default MetricWidget;