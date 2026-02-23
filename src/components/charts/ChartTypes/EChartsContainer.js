import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getChartComponent } from './chartRegistry';
import { addWatermark } from '../../../utils/echarts/chartUtils';

const GL_CHART_TYPES = ['3dbar', '3dmap', 'globe', 'geo-gl', 'scatter3d', 'surface', 'geo3d-map'];
const WORD_CLOUD_TYPES = ['wordcloud', 'word-cloud', 'wordcloud-chart', 'word-cloud-chart'];

const isWordCloudType = (type = '') => WORD_CLOUD_TYPES.includes(type);

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
  const hasRenderedRef = useRef(false);
  const previousChartTypeRef = useRef(chartType);
  const graphEdgeLegendListenerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [hasZoom, setHasZoom] = useState(false);
  const [requiresGL, setRequiresGL] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: undefined, height: undefined });

  const isWordCloud = isWordCloudType(chartType);

  const detachGraphEdgeLegendListener = () => {
    if (instanceRef.current && graphEdgeLegendListenerRef.current) {
      instanceRef.current.off('legendselectchanged', graphEdgeLegendListenerRef.current);
    }
    graphEdgeLegendListenerRef.current = null;
  };

  const applyGraphEdgeLegendSelection = (edgeLegendConfig, baseEdges, selectedMap = {}) => {
    if (!instanceRef.current || !edgeLegendConfig?.targetSeriesId) {
      return;
    }

    const allowedStyleNames = Array.isArray(edgeLegendConfig.styleNames)
      ? new Set(edgeLegendConfig.styleNames.map((name) => String(name)))
      : null;

    const filteredEdges = baseEdges.filter((edge) => {
      const edgeStyleValue = edge?.styleValue;
      if (edgeStyleValue === undefined || edgeStyleValue === null || edgeStyleValue === '') {
        return true;
      }

      const normalizedStyle = String(edgeStyleValue);
      if (allowedStyleNames && allowedStyleNames.size > 0 && !allowedStyleNames.has(normalizedStyle)) {
        return true;
      }

      return selectedMap[normalizedStyle] !== false;
    });

    instanceRef.current.setOption({
      series: [{
        id: edgeLegendConfig.targetSeriesId,
        edges: filteredEdges
      }]
    }, {
      lazyUpdate: true
    });
  };

  const bindGraphEdgeLegendSelection = (options) => {
    detachGraphEdgeLegendListener();

    const edgeLegendConfig = options?.__graphEdgeLegend;
    if (!edgeLegendConfig?.enabled || !instanceRef.current) {
      return;
    }

    const targetSeriesId = edgeLegendConfig.targetSeriesId;
    if (!targetSeriesId) {
      return;
    }

    const seriesOptions = Array.isArray(options?.series) ? options.series : [];
    const targetSeries = seriesOptions.find((series) => series?.id === targetSeriesId);
    const baseEdges = Array.isArray(targetSeries?.edges) ? targetSeries.edges : null;

    if (!baseEdges) {
      return;
    }

    const legendOptions = Array.isArray(options.legend) ? options.legend[0] : options.legend;
    const initialSelected = legendOptions?.selected && typeof legendOptions.selected === 'object'
      ? legendOptions.selected
      : {};

    const handleLegendSelectionChange = (params) => {
      applyGraphEdgeLegendSelection(edgeLegendConfig, baseEdges, params?.selected);
    };

    graphEdgeLegendListenerRef.current = handleLegendSelectionChange;
    instanceRef.current.on('legendselectchanged', handleLegendSelectionChange);

    applyGraphEdgeLegendSelection(edgeLegendConfig, baseEdges, initialSelected);
  };

  useEffect(() => {
    const normalizedType = (chartType || '').toLowerCase();
    const needsGL = GL_CHART_TYPES.includes(normalizedType);
    const chartTypeChanged = previousChartTypeRef.current !== normalizedType;

    setRequiresGL(needsGL);
    if (chartTypeChanged) {
      hasRenderedRef.current = false;
      previousChartTypeRef.current = normalizedType;
    }
  }, [chartType]);

  useEffect(() => {
    const handleResize = () => {
      if (instanceRef.current) {
        instanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      setContainerSize((previous) => {
        if (previous.width === next.width && previous.height === next.height) {
          return previous;
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

  useEffect(() => {
    if (!data || !chartType) {
      setError('Missing required data or chart type');
      setLoading(false);
      return;
    }

    if (requiresGL && !glLoaded) {
      if (!hasRenderedRef.current) {
        setLoading(true);
      }
      return;
    }

    let cancelled = false;

    const generateOptions = async () => {
      try {
        const shouldShowLoadingState = !hasRenderedRef.current;
        if (shouldShowLoadingState) {
          setLoading(true);
        }
        setError(null);

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

        const optionsPromise = ChartComponent.getOptions(data, mergedConfig, isDarkMode);
        const options = optionsPromise instanceof Promise ? await optionsPromise : optionsPromise;

        if (cancelled) return;

        const zoomEnabled = options?.dataZoom && options.dataZoom.length > 0;
        setHasZoom(zoomEnabled);

        const finalOptions = isWordCloud
          ? options
          : addWatermark(options, {
              hasZoom: zoomEnabled,
              isDarkMode,
              showWatermark
            });

        setChartOptions(finalOptions);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to generate chart options');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateOptions();

    return () => {
      cancelled = true;
    };
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
    containerSize.height,
    isWordCloud
  ]);

  useEffect(() => {
    if (!chartRef.current || !chartOptions || loading) {
      return;
    }

    try {
      if (!instanceRef.current) {
        instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
          renderer: 'canvas',
          useDirtyRect: !requiresGL && !isWordCloud,
          width: isWordCloud ? 'auto' : undefined,
          height: isWordCloud ? 'auto' : undefined
        });
      }

      const setOptionConfig = isWordCloud
        ? {
            notMerge: false,
            lazyUpdate: false,
            silent: false
          }
        : {
            notMerge: true
          };

      instanceRef.current.setOption(chartOptions, setOptionConfig);
      bindGraphEdgeLegendSelection(chartOptions);
      hasRenderedRef.current = true;

      if (isWordCloud) {
        setTimeout(() => {
          if (instanceRef.current && chartRef.current) {
            instanceRef.current.resize();
          }
        }, 200);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize chart');
    }
  }, [chartOptions, loading, isDarkMode, requiresGL, isWordCloud]);

  useEffect(() => {
    if (instanceRef.current && !loading && chartOptions) {
      if (isWordCloud) {
        return;
      }

      try {
        instanceRef.current.dispose();
      } catch {
        // no-op
      }

      instanceRef.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : null, {
        renderer: 'canvas',
        useDirtyRect: !requiresGL
      });

      instanceRef.current.setOption(chartOptions, {
        notMerge: true
      });
      bindGraphEdgeLegendSelection(chartOptions);
    }
  }, [isDarkMode, chartOptions, loading, requiresGL, isWordCloud]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.resize();
    }
  }, [containerSize.width, containerSize.height]);

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        detachGraphEdgeLegendListener();
        try {
          if (isWordCloud) {
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
        } catch {
          instanceRef.current = null;
        }
      }
    };
  }, [isWordCloud]);

  const containerClasses = [
    'echarts-container',
    isDynamicHeight ? 'dynamic-height' : '',
    requiresGL ? 'echarts-gl' : '',
    isWordCloud ? 'wordcloud' : '',
    error ? 'has-error' : '',
    loading ? 'is-loading' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`chart-container-wrapper ${hasZoom ? 'has-zoom' : ''}`} data-chart-type={chartType}>
      <div
        ref={chartRef}
        className={containerClasses}
        style={{
          width,
          height: isDynamicHeight ? '100%' : height,
          minHeight: isWordCloud ? '300px' : undefined,
          ...style
        }}
      >
        {loading && !hasRenderedRef.current && (
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
