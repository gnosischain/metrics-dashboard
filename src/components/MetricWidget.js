import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';
import { addUniversalWatermark, removeUniversalWatermark } from '../utils/watermarkUtils';

const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const isMounted = useRef(true);
  const cardRef = useRef(null);

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
        enableZoom = false 
    } = metricConfig;

    let widgetType = 'chart';
    if (chartType === 'text') widgetType = 'text';
    if (chartType === 'number' || chartType === 'numberDisplay') widgetType = 'number';
    if (chartType === 'table') widgetType = 'table';
    
    return { type: widgetType, chartType, title: name, description, format, color, labelField, valueField, enableFiltering, enableZoom, config: metricConfig };
  }, [metricConfig]);

  useEffect(() => {
    const watermarkContainer = cardRef.current?.querySelector('.card-content');
    
    if (widgetConfig.type === 'chart' && watermarkContainer && !loading && !minimal) {
      const timer = setTimeout(() => {
        const hasZoom = widgetConfig.enableZoom;
        addUniversalWatermark({ current: watermarkContainer }, isDarkMode, {
          className: 'card-chart-watermark',
          preventDuplicates: true,
          customStyles: {
            bottom: hasZoom ? '40px' : '15px',
            right: '15px'
          }
        });
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (watermarkContainer) {
          removeUniversalWatermark({ current: watermarkContainer }, 'card-chart-watermark');
        }
      };
    }
  }, [widgetConfig.type, widgetConfig.enableZoom, cardRef, loading, isDarkMode, minimal, data]);

  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      if (!metricId || widgetConfig.type === 'error') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await metricsService.fetchMetricData(metricId);
        if (!isMounted.current) return;
        setData(fetchedData || []);
        if (widgetConfig.enableFiltering && widgetConfig.labelField && Array.isArray(fetchedData)) {
          const labels = [...new Set(fetchedData.map(item => item[widgetConfig.labelField]).filter(Boolean))];
          setAvailableLabels(labels);
          if (labels.length > 0) {
            setSelectedLabel(current => current ? current : labels[0]);
          }
        }
      } catch (err) {
        if (!isMounted.current) return;
        setError(err.message || 'Failed to load data');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted.current = false; };
  }, [metricId, widgetConfig.type, widgetConfig.enableFiltering, widgetConfig.labelField]);

  const handleLabelChange = useCallback((label) => setSelectedLabel(label), []);

  const filteredData = useMemo(() => {
    if (!widgetConfig.enableFiltering || !selectedLabel || !Array.isArray(data)) return data;
    return data.filter(item => item[widgetConfig.labelField] === selectedLabel);
  }, [data, selectedLabel, widgetConfig.enableFiltering, widgetConfig.labelField]);
  
  if (widgetConfig.type === 'error') {
    return <Card minimal={minimal} className={`metric-widget error ${className}`}><div className="error-message"><h3>Config Error</h3><p>{widgetConfig.error}</p></div></Card>;
  }
  if (loading) {
    return <Card minimal={minimal} className={`metric-widget loading ${className}`} title={widgetConfig.title}><div className="loading-indicator">Loading...</div></Card>;
  }
  if (error) {
    return <Card minimal={minimal} className={`metric-widget error ${className}`} title={widgetConfig.title}><div className="error-message"><h3>Error</h3><p>{error}</p></div></Card>;
  }

  const renderWidget = () => {
    switch(widgetConfig.type) {
      case 'chart':
        return (
          <Card 
            ref={cardRef}
            minimal={minimal} 
            title={widgetConfig.title} 
            subtitle={widgetConfig.description}
            headerControls={
              widgetConfig.enableFiltering && availableLabels.length > 1 && (
                <LabelSelector labels={availableLabels} selectedLabel={selectedLabel} onSelectLabel={handleLabelChange} labelField={widgetConfig.labelField} idPrefix={metricId} />
              )
            }
            contentClassName={widgetConfig.enableZoom ? 'has-zoom' : ''}
            className={`metric-widget chart ${className}`}
            expandable={true}
            isDarkMode={isDarkMode}
          >
            <EChartsContainer
              data={filteredData || []}
              chartType={widgetConfig.chartType}
              config={widgetConfig.config}
              isDarkMode={isDarkMode}
            />
          </Card>
        );
      case 'text':
        const content = typeof data === 'string' ? data : (data?.content || metricConfig.content || 'No content available');
        return (
            <Card ref={cardRef} minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
                <TextWidget content={content} />
            </Card>
        );
      case 'number':
        const value = typeof data === 'number' ? data : (data?.value || (Array.isArray(data) && data[0]?.[widgetConfig.valueField]) || 0);
        return (
            <Card ref={cardRef} minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
                <NumberWidget value={value} format={widgetConfig.format} color={widgetConfig.color} isDarkMode={isDarkMode} />
            </Card>
        );
      case 'table':
        return (
            <Card ref={cardRef} minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description} className={`metric-widget table ${className}`}>
                <TableWidget data={filteredData || []} config={widgetConfig.config} isDarkMode={isDarkMode} height="100%" />
            </Card>
        );
      default:
        return <Card minimal={minimal} title="Error"><div className="error-message">Invalid widget type.</div></Card>;
    }
  };

  return renderWidget();
};

export default MetricWidget;