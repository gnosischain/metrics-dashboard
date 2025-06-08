// EChartsContainer.js - Complete file with integrated watermark
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
  style = {},
  showWatermark = true
}) => {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [error, setError] = useState(null);
  const [cardSize, setCardSize] = useState('large');
  const [isDynamicHeight, setIsDynamicHeight] = useState(false);

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

  // Detect if container has dynamic height
  useEffect(() => {
    const detectDynamicHeight = () => {
      if (chartRef.current) {
        const container = chartRef.current;
        const parent = container.parentElement;
        
        // Check if parent has dynamic-height class
        const hasDynamicClass = parent?.classList.contains('dynamic-height');
        setIsDynamicHeight(hasDynamicClass);
        
        console.log(`EChartsContainer: Dynamic height detected: ${hasDynamicClass}`);
      }
    };

    detectDynamicHeight();
  }, []);

  const chartOptions = useMemo(() => {
    console.log(`EChartsContainer: Generating chart options for ${chartType}`);
    console.log(`EChartsContainer: Input data:`, { 
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      sampleData: Array.isArray(data) ? data.slice(0, 2) : data 
    });

    // Get the chart component class
    const ChartComponent = getChartComponent(chartType);
    
    if (!ChartComponent) {
      console.error(`EChartsContainer: No chart component found for type: ${chartType}`);
      setError(`Unsupported chart type: ${chartType}`);
      return null;
    }

    // Prepare chart data
    const chartData = Array.isArray(data) ? data : [];

    try {
      // Call the static getOptions method on the chart component class
      const options = ChartComponent.getOptions(chartData, {
        ...config,
        cardSize,
        isDynamicHeight
      }, isDarkMode);

      console.log(`EChartsContainer: Generated options:`, {
        hasOptions: !!options,
        hasData: !!options?.series?.[0]?.data
      });

      return options;
    } catch (error) {
      console.error(`EChartsContainer: Error generating chart options:`, error);
      setError(error.message || 'Failed to generate chart options');
      return null;
    }
  }, [data, chartType, config, cardSize, isDynamicHeight, isDarkMode]);

  // Initialize and update ECharts instance
  useEffect(() => {
    console.log(`EChartsContainer: Initializing/updating chart instance`);
    
    if (!chartRef.current || !chartOptions) {
      console.warn(`EChartsContainer: Missing requirements:`, {
        hasChartRef: !!chartRef.current,
        hasChartOptions: !!chartOptions
      });
      return;
    }

    try {
      // Initialize or get existing instance
      if (!instanceRef.current) {
        console.log(`EChartsContainer: Creating new ECharts instance`);
        instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: 'canvas',
          useDirtyRect: true
        });
      } else {
        console.log(`EChartsContainer: Using existing ECharts instance`);
      }

      // Set options with notMerge to ensure clean update
      console.log(`EChartsContainer: Setting chart options`);
      instanceRef.current.setOption(chartOptions, { notMerge: true });
      
      setError(null);

      // Call onReady callback if provided
      if (onReady && typeof onReady === 'function') {
        onReady(instanceRef.current);
      }
    } catch (err) {
      console.error(`EChartsContainer: Error initializing chart:`, err);
      setError(err.message || 'Failed to initialize chart');
    }
  }, [chartOptions, isDarkMode, onReady]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        console.log(`EChartsContainer: Resizing chart`);
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Also observe container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        console.log(`EChartsContainer: Disposing chart instance`);
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  // Update theme when isDarkMode changes
  useEffect(() => {
    if (instanceRef.current && chartOptions) {
      console.log(`EChartsContainer: Theme changed, recreating instance`);
      instanceRef.current.dispose();
      instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
        renderer: 'canvas',
        useDirtyRect: true
      });
      instanceRef.current.setOption(chartOptions, { notMerge: true });
    }
  }, [isDarkMode, chartOptions]);

  const containerClasses = [
    'echarts-container',
    isDynamicHeight ? 'dynamic-height' : '',
    className
  ].filter(Boolean).join(' ');

  if (error) {
    return (
      <div className="echarts-error" style={{ height, ...style }}>
        <div>Error loading chart: {error}</div>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef}
      className={containerClasses}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default EChartsContainer;