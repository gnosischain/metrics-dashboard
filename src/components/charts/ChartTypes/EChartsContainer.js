// ===========================================
// FILE 1: src/components/charts/ChartTypes/EChartsContainer.js
// ===========================================

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './index';

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
  const [cardSize, setCardSize] = useState('large');

  const ChartComponent = useMemo(() => {
    console.log(`EChartsContainer: Getting chart component for type: ${chartType}`);
    const component = getChartComponent(chartType);
    if (!component) {
      console.warn(`EChartsContainer: Unsupported chart type: ${chartType}`);
    }
    return component;
  }, [chartType]);

  // Detect card size based on container width
  useEffect(() => {
    const detectCardSize = () => {
      if (chartRef.current) {
        const containerRect = chartRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        
        // Determine if this is a small card (half-width) or large card (full-width)
        // Typical breakpoint: cards under 600px are considered small
        const isSmallCard = containerWidth < 600;
        setCardSize(isSmallCard ? 'small' : 'large');
        
        console.log(`EChartsContainer: Detected card size: ${isSmallCard ? 'small' : 'large'} (width: ${containerWidth}px)`);
      }
    };

    // Detect on mount and resize
    detectCardSize();
    
    const resizeObserver = new ResizeObserver(detectCardSize);
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const chartOptions = useMemo(() => {
    console.log(`EChartsContainer: Generating chart options for ${chartType}`);
    console.log(`EChartsContainer: Input data:`, { 
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      sampleData: Array.isArray(data) ? data.slice(0, 2) : data
    });
    
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

      // Enhanced config with card size information
      const enhancedConfig = {
        ...config,
        cardSize: cardSize,
        isHalfWidth: cardSize === 'small'
      };

      console.log(`EChartsContainer: Calling ${chartType}.getOptions with enhanced config`, {
        cardSize,
        isHalfWidth: cardSize === 'small'
      });
      
      const options = ChartComponent.getOptions(data, enhancedConfig, isDarkMode);
      
      console.log(`EChartsContainer: Generated chart options:`, {
        hasXAxis: !!options.xAxis,
        hasYAxis: !!options.yAxis,
        seriesCount: options.series?.length || 0,
        xAxisDataLength: options.xAxis?.data?.length || 0,
        seriesNames: options.series?.map(s => s.name) || [],
        firstSeriesDataLength: options.series?.[0]?.data?.length || 0,
        gridConfig: options.grid
      });
      
      return options;
    } catch (err) {
      console.error('EChartsContainer: Error generating chart options:', err);
      setError(err.message);
      return null;
    }
  }, [data, chartType, config, isDarkMode, ChartComponent, cardSize]);

  useEffect(() => {
    if (chartOptions) {
      setIsLoading(false);
    }
    
    if (chartRef.current && chartOptions && !isLoading) {
      console.log('EChartsContainer: Initializing chart...');
      
      try {
        // Dispose previous instance
        if (instanceRef.current) {
          instanceRef.current.dispose();
          instanceRef.current = null;
        }
        
        // Force a brief delay to ensure DOM is ready
        const timer = setTimeout(() => {
          if (!chartRef.current) return;
          
          // Calculate container dimensions
          const container = chartRef.current;
          const containerRect = container.getBoundingClientRect();
          
          // Initialize ECharts instance with calculated dimensions
          const chartInstance = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
            renderer: 'canvas',
            width: containerRect.width || 'auto',
            height: containerRect.height || 'auto'
          });

          console.log('EChartsContainer: Setting options...', chartOptions);
          
          // Set chart options with proper merge strategy
          chartInstance.setOption(chartOptions, {
            notMerge: true, // Don't merge with previous options
            replaceMerge: ['series', 'xAxis', 'yAxis'], // Replace these components
            silent: false
          });
          
          // Store reference to ECharts instance on container for modal resize
          container.__echarts__ = chartInstance;
          
          // Force resize after setting options
          setTimeout(() => {
            if (chartInstance && !chartInstance.isDisposed()) {
              chartInstance.resize();
            }
          }, 100);
          
          instanceRef.current = chartInstance;
          setError(null);

          console.log('EChartsContainer: Chart initialized successfully');

          if (onReady && typeof onReady === 'function') {
            onReady(chartInstance);
          }

          const handleResize = () => {
            if (chartInstance && !chartInstance.isDisposed()) {
              chartInstance.resize();
            }
          };
          window.addEventListener('resize', handleResize);

          return () => {
            window.removeEventListener('resize', handleResize);
            if (chartInstance && !chartInstance.isDisposed()) {
              chartInstance.dispose();
            }
          };
        }, 50);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('EChartsContainer: Error initializing chart:', err);
        setError(`Chart initialization failed: ${err.message}`);
      }
    }
  }, [chartOptions, isDarkMode, onReady, isLoading]);

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
        ...style
      }}
    />
  );
};

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