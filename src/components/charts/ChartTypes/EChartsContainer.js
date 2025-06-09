// EChartsContainer.js - Updated with GL support
import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './index';

// Lazy load echarts-gl only when needed
const loadEChartsGL = () => import('echarts-gl');

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
  const [loading, setLoading] = useState(true);
  const [chartOptions, setChartOptions] = useState(null);
  const [cardSize, setCardSize] = useState('large');
  const [isDynamicHeight, setIsDynamicHeight] = useState(false);
  const [glLoaded, setGlLoaded] = useState(false);

  // Check if chart type requires GL
  const requiresGL = chartType && (
    chartType.toLowerCase().includes('gl') || 
    chartType === 'gl-map' ||
    chartType === 'glmap' ||
    chartType === '3d-map'
  );

  // Load echarts-gl if required
  useEffect(() => {
    if (requiresGL && !glLoaded) {
      console.log('EChartsContainer: Loading echarts-gl...');
      loadEChartsGL()
        .then(() => {
          console.log('EChartsContainer: echarts-gl loaded successfully');
          setGlLoaded(true);
        })
        .catch(err => {
          console.error('EChartsContainer: Failed to load echarts-gl:', err);
          setError('Failed to load 3D visualization library');
        });
    } else if (!requiresGL) {
      setGlLoaded(true); // Mark as "loaded" for non-GL charts
    }
  }, [requiresGL, glLoaded]);

  // Detect card size based on container width
  useEffect(() => {
    const detectCardSize = () => {
      if (chartRef.current) {
        const containerRect = chartRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        
        const isSmallCard = containerWidth < 600;
        setCardSize(isSmallCard ? 'small' : 'large');
        
        console.log(`EChartsContainer: Detected card size: ${isSmallCard ? 'small' : 'large'} (width: ${containerWidth}px)`);
      }
    };

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
        
        const hasDynamicClass = parent?.classList.contains('dynamic-height');
        setIsDynamicHeight(hasDynamicClass);
        
        console.log(`EChartsContainer: Dynamic height detected: ${hasDynamicClass}`);
      }
    };

    detectDynamicHeight();
  }, []);

  // Generate chart options (now supports async and GL)
  useEffect(() => {
    if (!glLoaded) return; // Wait for GL to load if required

    const generateOptions = async () => {
      console.log(`EChartsContainer: Generating chart options for ${chartType}`);
      console.log(`EChartsContainer: Input data:`, { 
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        sampleData: Array.isArray(data) ? data.slice(0, 2) : data 
      });

      setLoading(true);
      setError(null);

      // Get the chart component class
      const ChartComponent = getChartComponent(chartType);
      
      if (!ChartComponent) {
        console.error(`EChartsContainer: No chart component found for type: ${chartType}`);
        setError(`Unsupported chart type: ${chartType}`);
        setLoading(false);
        return;
      }

      // Prepare chart data
      const chartData = Array.isArray(data) ? data : [];

      try {
        // Call the static getOptions method on the chart component class
        // Handle both sync and async getOptions methods
        const optionsPromise = ChartComponent.getOptions(chartData, {
          ...config,
          cardSize,
          isDynamicHeight
        }, isDarkMode);

        const options = optionsPromise instanceof Promise ? await optionsPromise : optionsPromise;

        console.log(`EChartsContainer: Generated options:`, {
          hasOptions: !!options,
          hasData: !!options?.series?.[0]?.data
        });

        setChartOptions(options);
        setLoading(false);
      } catch (error) {
        console.error(`EChartsContainer: Error generating chart options:`, error);
        setError(error.message || 'Failed to generate chart options');
        setLoading(false);
      }
    };

    generateOptions();
  }, [data, chartType, config, cardSize, isDynamicHeight, isDarkMode, glLoaded]);

  // Initialize and update ECharts instance
  useEffect(() => {
    console.log(`EChartsContainer: Initializing/updating chart instance`);
    
    if (!chartRef.current || !chartOptions || loading) {
      console.warn(`EChartsContainer: Missing requirements:`, {
        hasChartRef: !!chartRef.current,
        hasChartOptions: !!chartOptions,
        isLoading: loading
      });
      return;
    }

    try {
      // Initialize or get existing instance
      if (!instanceRef.current) {
        console.log(`EChartsContainer: Creating new ECharts instance`);
        const renderer = requiresGL ? 'canvas' : 'canvas'; // GL charts must use canvas
        instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: renderer,
          useDirtyRect: !requiresGL // Disable dirty rect for GL charts
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
  }, [chartOptions, isDarkMode, onReady, loading, requiresGL]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        console.log(`EChartsContainer: Resizing chart`);
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
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
    if (instanceRef.current && chartOptions && !loading) {
      console.log(`EChartsContainer: Theme changed, recreating instance`);
      instanceRef.current.dispose();
      const renderer = requiresGL ? 'canvas' : 'canvas';
      instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
        renderer: renderer,
        useDirtyRect: !requiresGL
      });
      instanceRef.current.setOption(chartOptions, { notMerge: true });
    }
  }, [isDarkMode, chartOptions, loading, requiresGL]);

  const containerClasses = [
    'echarts-container',
    isDynamicHeight ? 'dynamic-height' : '',
    requiresGL ? 'echarts-gl' : '',
    className
  ].filter(Boolean).join(' ');

  if (error) {
    return (
      <div className="echarts-error" style={{ height, ...style }}>
        <div>Error loading chart: {error}</div>
      </div>
    );
  }

  if (loading || (requiresGL && !glLoaded)) {
    return (
      <div className="echarts-loading" style={{ height, ...style }}>
        <div>{requiresGL && !glLoaded ? 'Loading 3D visualization...' : 'Loading chart data...'}</div>
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