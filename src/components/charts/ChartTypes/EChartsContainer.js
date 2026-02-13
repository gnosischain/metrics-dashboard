import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './chartRegistry';
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
  const [containerSize, setContainerSize] = useState({ width: undefined, height: undefined });

  console.log(`EChartsContainer: Rendering with chartType=${chartType}, dataLength=${data?.length}, isDarkMode=${isDarkMode}`);

  // Check if chart type requires GL or special handling
  useEffect(() => {
    const needsGL = ['3dbar', '3dmap', 'globe', 'geo-gl', 'scatter3d', 'surface', 'geo3d-map'].includes(chartType);
    const isWordCloud = ['wordcloud', 'word-cloud', 'wordcloud-chart', 'word-cloud-chart'].includes(chartType);
    
    setRequiresGL(needsGL);
    
    // Word cloud specific logging
    if (isWordCloud) {
      console.log(`EChartsContainer: Detected word cloud chart type: ${chartType}`);
    }
    
    console.log(`EChartsContainer: Chart type ${chartType} requires GL: ${needsGL}, is word cloud: ${isWordCloud}`);
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

  // Track container size for layout-sensitive charts (e.g., Sankey auto-fit)
  useEffect(() => {
    if (!chartRef.current) return;

    const node = chartRef.current;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };

      if (!next.width || !next.height) return;

      setContainerSize(prev => {
        if (prev.width === next.width && prev.height === next.height) {
          return prev;
        }
        return next;
      });
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
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
          isDynamicHeight,
          containerHeight: containerSize.height,
          containerWidth: containerSize.width
        };

        console.log(`EChartsContainer: Generating options with config:`, mergedConfig);
        const optionsPromise = ChartComponent.getOptions(data, mergedConfig, isDarkMode);
        const options = optionsPromise instanceof Promise ? await optionsPromise : optionsPromise;

        // Check if chart has zoom enabled
        const zoomEnabled = options?.dataZoom && options.dataZoom.length > 0;
        setHasZoom(zoomEnabled);

        // Word cloud specific processing
        const isWordCloud = ['wordcloud', 'word-cloud', 'wordcloud-chart', 'word-cloud-chart'].includes(chartType);
        
        let finalOptions;
        if (isWordCloud) {
          // For word clouds, don't apply watermark as it interferes with the word layout
          console.log('EChartsContainer: Skipping watermark for word cloud');
          finalOptions = options;
        } else {
          // Apply watermark to other chart types
          finalOptions = addWatermark(options, {
            hasZoom: zoomEnabled,
            isDarkMode: isDarkMode,
            showWatermark: showWatermark
          });
        }

        console.log(`EChartsContainer: Generated options:`, {
          hasOptions: !!finalOptions,
          hasData: !!finalOptions?.series?.length,
          hasZoom: zoomEnabled,
          isWordCloud: isWordCloud
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
  }, [
    data,
    chartType,
    config,
    isDarkMode,
    cardSize,
    isDynamicHeight,
    glLoaded,
    showWatermark,
    requiresGL,
    containerSize.width,
    containerSize.height
  ]);

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
      const isWordCloud = ['wordcloud', 'word-cloud', 'wordcloud-chart', 'word-cloud-chart'].includes(chartType);
      
      // Initialize or get existing instance
      if (!instanceRef.current) {
        console.log(`EChartsContainer: Creating new ECharts instance`);
        const renderer = requiresGL ? 'canvas' : 'canvas';
        
        instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: renderer,
          useDirtyRect: !requiresGL && !isWordCloud,
          width: isWordCloud ? 'auto' : undefined,
          height: isWordCloud ? 'auto' : undefined
        });
        
        if (isWordCloud) {
          console.log('EChartsContainer: Initialized with word cloud specific settings');
        }
      }

      console.log(`EChartsContainer: Setting chart options`);
      
      // For word cloud, use more stable options
      const setOptionConfig = isWordCloud ? {
        notMerge: false, // Use merge for word cloud to prevent re-layout
        lazyUpdate: false,
        silent: false
      } : {
        notMerge: true
      };
      
      instanceRef.current.setOption(chartOptions, setOptionConfig);
      
      // Word cloud specific post-render handling
      if (isWordCloud) {
        // Ensure the word cloud is properly sized after a brief delay
        setTimeout(() => {
          if (instanceRef.current && chartRef.current) {
            instanceRef.current.resize();
            // Prevent additional renders that might cause flickering
            console.log('EChartsContainer: Word cloud stabilized');
          }
        }, 200);
      }
      
    } catch (err) {
      console.error(`EChartsContainer: Error initializing chart:`, err);
      setError(err.message || 'Failed to initialize chart');
    }
  }, [chartOptions, loading, isDarkMode, requiresGL, chartType]);

  // Update theme - but avoid recreating for word clouds unless absolutely necessary
  useEffect(() => {
    if (instanceRef.current && !loading && chartOptions) {
      const isWordCloud = ['wordcloud', 'word-cloud', 'wordcloud-chart', 'word-cloud-chart'].includes(chartType);
      
      // For word clouds, avoid theme recreation as it causes flickering
      if (isWordCloud) {
        console.log(`EChartsContainer: Skipping theme recreation for word cloud to prevent flickering`);
        return;
      }
      
      console.log(`EChartsContainer: Updating theme to ${isDarkMode ? 'dark' : 'light'}`);
      
      // Safe disposal for non-word cloud charts
      try {
        instanceRef.current.dispose();
      } catch (err) {
        console.warn('EChartsContainer: Error during disposal:', err);
      }
      
      const renderer = requiresGL ? 'canvas' : 'canvas';
      
      instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
        renderer: renderer,
        useDirtyRect: !requiresGL
      });
      
      instanceRef.current.setOption(chartOptions, { 
        notMerge: true
      });
    }
  }, [isDarkMode, chartOptions, loading, requiresGL, chartType]);

  // Ensure chart resizes when container size changes (e.g., auto-fit layouts)
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.resize();
    }
  }, [containerSize.width, containerSize.height]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        console.log('EChartsContainer: Disposing chart instance');
        const isWordCloud = chartType && (
          chartType.includes('wordcloud') || 
          chartType.includes('word-cloud')
        );
        
        try {
          if (isWordCloud) {
            // Safe disposal for word cloud
            instanceRef.current.clear();
            setTimeout(() => {
              if (instanceRef.current) {
                instanceRef.current.dispose();
                instanceRef.current = null;
              }
            }, 50);
          } else {
            instanceRef.current.dispose();
            instanceRef.current = null;
          }
        } catch (err) {
          console.warn('EChartsContainer: Error during cleanup:', err);
          instanceRef.current = null;
        }
      }
    };
  }, [chartType]);

  const isWordCloud = chartType && (
    chartType.includes('wordcloud') || 
    chartType.includes('word-cloud')
  );

  const containerClasses = [
    'echarts-container',
    isDynamicHeight ? 'dynamic-height' : '',
    requiresGL ? 'echarts-gl' : '',
    isWordCloud ? 'wordcloud' : '',
    error ? 'has-error' : '',
    loading ? 'is-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`chart-container-wrapper ${hasZoom ? 'has-zoom' : ''}`} data-chart-type={chartType}>
      <div
        ref={chartRef}
        className={containerClasses}
        style={{
          width,
          height: isDynamicHeight ? '100%' : height,
          // Ensure word cloud has proper minimum dimensions
          minHeight: isWordCloud ? '300px' : undefined,
          ...style
        }}
      >
        {loading && (
          <div className="echarts-loading">
            <div className="loading-spinner"></div>
            <p>Loading {isWordCloud ? 'word cloud' : 'chart'}...</p>
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
