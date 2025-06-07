/**
 * EChartsContainer.js
 * Location: src/components/charts/ChartTypes/EChartsContainer.js
 * Fixed version with enhanced debugging and error handling
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './index';

/**
 * Universal ECharts container component
 * Supports all chart types with a unified interface
 */
const EChartsContainer = ({
  data = [],
  chartType = 'line',
  config = {},
  isDarkMode = false,
  width = '100%',
  height = '400px',
  onReady = null,
  className = '',
  style = {}
}) => {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get chart component based on chart type
  const ChartComponent = useMemo(() => {
    console.log(`EChartsContainer: Getting chart component for type: ${chartType}`);
    const component = getChartComponent(chartType);
    if (!component) {
      console.warn(`EChartsContainer: Unsupported chart type: ${chartType}`);
    } else {
      console.log(`EChartsContainer: Found chart component for: ${chartType}`);
    }
    return component;
  }, [chartType]);

  // Generate chart options using the specific chart component
  const chartOptions = useMemo(() => {
    console.log(`EChartsContainer: Generating chart options for ${chartType}`);
    try {
      if (!ChartComponent) {
        throw new Error(`Unsupported chart type: ${chartType}`);
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log(`EChartsContainer: No data available, using empty chart options`);
        return ChartComponent.getEmptyChartOptions ?
          ChartComponent.getEmptyChartOptions(isDarkMode) :
          getDefaultEmptyOptions(isDarkMode);
      }

      console.log(`EChartsContainer: Calling ${chartType}.getOptions with data of length:`, data.length || 'N/A');
      const options = ChartComponent.getOptions(data, config, isDarkMode);
      console.log(`EChartsContainer: Generated chart options successfully.`);
      return options;
    } catch (err) {
      console.error('EChartsContainer: Error generating chart options:', err);
      setError(err.message);
      return null;
    }
  }, [data, chartType, config, isDarkMode, ChartComponent]);

  // Main effect to initialize and update the chart
  useEffect(() => {
    // 1. If options are calculated, stop loading to allow the div to render.
    if (chartOptions) {
      setIsLoading(false);
    }
    
    // 2. If the div is rendered and we have options, initialize the chart.
    if (chartRef.current && chartOptions) {
      console.log('EChartsContainer: DOM element and options are ready. Initializing chart.');
      
      try {
        // Dispose of the old instance before creating a new one
        if (instanceRef.current) {
            instanceRef.current.dispose();
        }
        
        // Initialize ECharts instance
        const chartInstance = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: 'canvas',
          width: 'auto',
          height: 'auto'
        });

        // Set chart options
        chartInstance.setOption(chartOptions, true);
        instanceRef.current = chartInstance;
        
        // Clear any previous errors
        setError(null);

        // Call onReady callback if provided
        if (onReady && typeof onReady === 'function') {
          onReady(chartInstance);
        }

        // Add resize listener
        const handleResize = () => {
          if (chartInstance && !chartInstance.isDisposed()) {
            chartInstance.resize();
          }
        };
        window.addEventListener('resize', handleResize);

        // Return cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartInstance && !chartInstance.isDisposed()) {
            chartInstance.dispose();
          }
          instanceRef.current = null;
        };
      } catch (err) {
        console.error('EChartsContainer: Error initializing chart:', err);
        setError(`Chart initialization failed: ${err.message}`);
      }
    }
  }, [chartOptions, isDarkMode, onReady]);

  // Render error state
  if (error) {
    return (
      <div
        className={`echarts-error ${className}`}
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDarkMode ? '#ef4444' : '#dc2626',
          backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '1rem',
          ...style
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ textAlign: 'center', fontSize: '14px' }}>
          <strong>Chart Error</strong><br />
          {error}
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`echarts-loading ${className}`}
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          ...style
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderTop: `2px solid ${isDarkMode ? '#60a5fa' : '#3b82f6'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '8px'
          }}
        />
        <div style={{ fontSize: '14px' }}>Loading chart...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render chart container
  return (
    <div
      ref={chartRef}
      className={`echarts-container ${className}`}
      style={{
        width,
        height,
        minHeight: '200px',
        minWidth: '300px',
        display: 'block',
        position: 'relative',
        flex: '1',
        ...style
      }}
    />
  );
};

/**
 * Default empty chart options when component is not found or data is empty
 */
function getDefaultEmptyOptions(isDarkMode) {
  return {
    title: {
      text: 'No data available',
      left: 'center',
      top: 'middle',
      textStyle: {
        color: isDarkMode ? '#ccc' : '#666',
        fontSize: 14
      }
    },
    backgroundColor: 'transparent'
  };
}

export default EChartsContainer;