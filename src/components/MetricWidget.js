import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, NumberWidget, TextWidget, TableWidget } from './index';
import EChartsContainer from './charts/ChartTypes/EChartsContainer';
import LabelSelector from './LabelSelector';
import metricsService from '../services/metrics';

const MetricWidget = ({ metricId, isDarkMode = false, minimal = false, className = '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  
  const isMounted = useRef(true);

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
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if metricsService has the getMetricData method
      if (!metricsService || typeof metricsService.getMetricData !== 'function') {
        throw new Error('Metrics service is not properly initialized');
      }
      
      const result = await metricsService.getMetricData(metricId);
      
      if (isMounted.current) {
        setData(result);
        
        if (widgetConfig.enableFiltering && result?.data?.length > 0) {
          const uniqueLabels = [...new Set(result.data.map(item => item[widgetConfig.labelField]))].filter(Boolean);
          setAvailableLabels(uniqueLabels);
          
          if (!selectedLabel && uniqueLabels.length > 0) {
            setSelectedLabel(uniqueLabels[0]);
          }
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message);
        console.error('Error fetching metric data:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [metricId, widgetConfig.enableFiltering, widgetConfig.labelField, selectedLabel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!data || !widgetConfig.enableFiltering || !selectedLabel) return data;
    
    return {
      ...data,
      data: data.data.filter(item => item[widgetConfig.labelField] === selectedLabel)
    };
  }, [data, widgetConfig.enableFiltering, widgetConfig.labelField, selectedLabel]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <Card minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card minimal={minimal} title={widgetConfig.title} subtitle={widgetConfig.description}>
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={handleRefresh} className="refresh-button">
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const renderContent = () => {
    switch (widgetConfig.type) {
      case 'text':
        return <TextWidget content={data?.content || 'No content available'} minimal={true} />;
      
      case 'number':
        return (
          <NumberWidget
            value={filteredData?.data?.[0]?.[widgetConfig.valueField || 'value'] || 0}
            format={widgetConfig.format}
            color={widgetConfig.color}
            minimal={true}
          />
        );
      
      case 'table':
        return <TableWidget data={filteredData?.data || []} minimal={true} />;
      
      case 'chart':
        return (
          <EChartsContainer
            data={filteredData?.data || []}
            chartType={widgetConfig.chartType}
            config={{
              ...widgetConfig.config,
              enableZoom: widgetConfig.enableZoom
            }}
            isDarkMode={isDarkMode}
            width="100%"
            height="100%"
            showWatermark={!minimal}
          />
        );
      
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const headerControls = widgetConfig.enableFiltering && availableLabels.length > 0 ? (
    <LabelSelector
      labels={availableLabels}
      selectedLabel={selectedLabel}
      onLabelChange={setSelectedLabel}
    />
  ) : undefined;

  return (
    <Card
      minimal={minimal}
      title={widgetConfig.title}
      subtitle={widgetConfig.description}
      className={`metric-widget ${className}`}
      headerControls={headerControls}
      expandable={widgetConfig.type === 'chart'}
      isDarkMode={isDarkMode}
    >
      {renderContent()}
    </Card>
  );
};

export default MetricWidget;