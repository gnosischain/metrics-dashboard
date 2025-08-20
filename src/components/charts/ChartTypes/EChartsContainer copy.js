import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './index';
import { addWatermark } from '../../../utils/echarts/chartUtils';

const EChartsContainer = ({ 
  data, 
  chartType, 
  config = {}, 
  isDarkMode = false,
  width = '100%',
  height = '400px',
  showWatermark = true,
  className = '',
  style = {},
  cardSize = 'medium',
  isDynamicHeight = false,
  glLoaded = false
}) => {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [hasZoom, setHasZoom] = useState(false);
  const [requiresGL, setRequiresGL] = useState(false);

  console.log(`EChartsContainer: Rendering with chartType=${chartType}, dataLength=${data?.length}, isDarkMode=${isDarkMode}`);

  // Check if chart type requires GL
  useEffect(() => {
    const needsGL = ['3dbar', '3dmap', 'globe', 'geo-gl', 'scatter3d', 'surface', 'geo3d-map'].includes(chartType);
    setRequiresGL(needsGL);
    console.log(`EChartsContainer: Chart type ${chartType} requires GL: ${needsGL}`);
  }, [chartType]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate chart options
  useEffect(() => {
    if (!data || !chartType) {
      console.log(`EChartsContainer: Missing required props - data: ${!!data}, chartType: ${chartType}`);
      setError('Missing required data or chart type');
      setLoading(false);
      return;
    }

    // Don't proceed if GL is required but not loaded
    if (requiresGL && !glLoaded) {
      console.log('EChartsContainer: Waiting for GL to load...');
      setLoading(true);
      return;
    }

    const generateOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`EChartsContainer: Getting chart component for type: ${chartType}`);
        const ChartComponent = getChartComponent(chartType);
        
        if (!ChartComponent) {
          throw new Error(`Unsupported chart type: ${chartType}`);
        }

        const mergedConfig = {
          ...config,
          cardSize,
          isDynamicHeight
        };

        console.log(`EChartsContainer: Generating options with config:`, mergedConfig);
        const optionsPromise = ChartComponent.getOptions(data, mergedConfig, isDarkMode);
        const options = optionsPromise instanceof Promise ? await optionsPromise : optionsPromise;

        // Check if chart has zoom enabled
        const zoomEnabled = options?.dataZoom && options.dataZoom.length > 0;
        setHasZoom(zoomEnabled);

        // Apply watermark to ALL charts here, after options are built
        const finalOptions = addWatermark(options, {
          hasZoom: zoomEnabled,
          isDarkMode: isDarkMode,
          showWatermark: showWatermark
        });

        console.log(`EChartsContainer: Generated options:`, {
          hasOptions: !!finalOptions,
          hasData: !!finalOptions?.series?.length,
          hasZoom: zoomEnabled
        });

        setChartOptions(finalOptions);
      } catch (err) {
        console.error(`EChartsContainer: Error generating chart options:`, err);
        setError(err.message || 'Failed to generate chart options');
      } finally {
        setLoading(false);
      }
    };

    generateOptions();
  }, [data, chartType, config, isDarkMode, cardSize, isDynamicHeight, glLoaded, showWatermark, requiresGL]);

  // Initialize/update chart
  useEffect(() => {
    if (!chartRef.current || !chartOptions || loading) {
      console.log(`EChartsContainer: Skipping chart initialization`, {
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
        const renderer = requiresGL ? 'canvas' : 'canvas';
        instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: renderer,
          useDirtyRect: !requiresGL
        });
      }

      console.log(`EChartsContainer: Setting chart options`);
      instanceRef.current.setOption(chartOptions, { notMerge: true });
    } catch (err) {
      console.error(`EChartsContainer: Error initializing chart:`, err);
      setError(err.message || 'Failed to initialize chart');
    }
  }, [chartOptions, loading, isDarkMode, requiresGL]);

  // Update theme
  useEffect(() => {
    if (instanceRef.current && !loading && chartOptions) {
      console.log(`EChartsContainer: Updating theme to ${isDarkMode ? 'dark' : 'light'}`);
      instanceRef.current.dispose();
      const renderer = requiresGL ? 'canvas' : 'canvas';
      instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
        renderer: renderer,
        useDirtyRect: !requiresGL
      });
      instanceRef.current.setOption(chartOptions, { notMerge: true });
    }
  }, [isDarkMode, chartOptions, loading, requiresGL]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        console.log('EChartsContainer: Disposing chart instance');
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, []);

  const containerClasses = [
    'echarts-container',
    isDynamicHeight ? 'dynamic-height' : '',
    requiresGL ? 'echarts-gl' : '',
    error ? 'has-error' : '',
    loading ? 'is-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`chart-container-wrapper ${hasZoom ? 'has-zoom' : ''}`}>
      <div
        ref={chartRef}
        className={containerClasses}
        style={{
          width,
          height: isDynamicHeight ? '100%' : height,
          ...style
        }}
      >
        {loading && (
          <div className="echarts-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart...</p>
          </div>
        )}
        {error && (
          <div className="echarts-error">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EChartsContainer;