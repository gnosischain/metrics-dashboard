/**
 * Radar Chart implementation for ECharts
 */

import { BaseChart } from './BaseChart';
import { formatValue } from '../../../utils';

export class RadarChart extends BaseChart {
  static getOptions(data, config, isDarkMode) {
    if (!this.validateData(data)) {
      return this.getEmptyChartOptions(isDarkMode);
    }

    const processedData = this.processData(data, config);
    if (processedData.indicator.length === 0 || processedData.series.length === 0) {
      return this.getEmptyChartOptions(isDarkMode);
    }
    const colors = this.resolveSeriesPalette(config, processedData.series.length, isDarkMode);

    return {
      ...this.getBaseOptions(isDarkMode),
      
      radar: {
        indicator: processedData.indicator,
        center: config.center || ['50%', '50%'],
        radius: config.radius || '70%',
        splitNumber: processedData.splitNumber,
        axisName: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: isDarkMode ? '#4b5563' : '#d1d5db'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDarkMode ? '#374151' : '#f3f4f6'
          }
        },
        splitArea: {
          areaStyle: {
            color: isDarkMode 
              ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] 
              : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)']
          }
        }
      },
      
      series: [{
        type: 'radar',
        data: processedData.series.map((series, index) => ({
          ...series,
          itemStyle: { 
            color: colors[index % colors.length] 
          },
          areaStyle: { 
            opacity: 0.3,
            color: colors[index % colors.length]
          },
          lineStyle: {
            color: colors[index % colors.length],
            width: 2
          }
        }))
      }],
      
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        extraCssText: isDarkMode
          ? 'box-shadow: 0 14px 28px -14px rgba(2, 6, 23, 0.75);'
          : 'box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.3);',
        padding: 12,
        formatter: (params) => {
          const tooltipRows = [];

          params.value.forEach((value, index) => {
            const indicator = processedData.indicator[index];
            if (indicator) {
              tooltipRows.push(`
                <div style="display:flex; justify-content:space-between; gap:12px; min-width:0;">
                  <span style="color:${isDarkMode ? '#CBD5E1' : '#475569'}; white-space:nowrap;">${indicator.name}</span>
                  <strong style="color:${isDarkMode ? '#F8FAFC' : '#0F172A'};">${formatValue(value, config.format)}</strong>
                </div>
              `);
            }
          });

          return `
            <div style="min-width:320px;">
              <div style="font-weight:700; margin-bottom:8px; color:${isDarkMode ? '#F8FAFC' : '#0F172A'};">
                ${params.name}
              </div>
              <div style="display:grid; grid-template-columns:repeat(2, minmax(130px, 1fr)); column-gap:16px; row-gap:6px;">
                ${tooltipRows.join('')}
              </div>
            </div>
          `;
        }
      },
      
      legend: this.getLegendConfig(isDarkMode, processedData.series.length, config)
    };
  }

  static processData(data, config) {
    const {
      nameField = 'name',
      valueFields,
      indicatorLabels = {},
      maxPaddingMultiplier = 1.2,
      minAxisMax = 1,
      useSharedMax = false
    } = config;
    
    if (!Array.isArray(data) || data.length === 0) {
      return { indicator: [], series: [] };
    }

    const toFiniteNumber = (value) => {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
      }
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const firstItem = data[0] || {};
    const candidateFields = Array.isArray(valueFields) && valueFields.length > 0
      ? valueFields
      : Object.keys(firstItem).filter((key) => key !== nameField);

    const numericFields = candidateFields.filter((field) =>
      data.some((item) => toFiniteNumber(item?.[field]) !== null)
    );

    if (numericFields.length === 0) {
      return { indicator: [], series: [] };
    }

    const fieldMaxima = numericFields.map((field) =>
      Math.max(...data.map((item) => toFiniteNumber(item?.[field]) ?? 0))
    );
    const paddedMaxima = fieldMaxima.map((value) =>
      Math.max(Math.ceil(value * maxPaddingMultiplier), minAxisMax)
    );
    const sharedMax = Math.max(...paddedMaxima, minAxisMax);
    const splitNumber = sharedMax <= 5 ? Math.max(1, Math.ceil(sharedMax)) : 5;

    // Create indicator (radar axes)
    const indicator = numericFields.map((field, index) => ({
      name: indicatorLabels[field] || field,
      max: useSharedMax ? sharedMax : paddedMaxima[index]
    }));

    // Create series data
    const series = data.map(item => ({
      name: item[nameField] || 'Unknown',
      value: numericFields.map((field) => toFiniteNumber(item?.[field]) ?? 0)
    }));

    return { indicator, series, splitNumber };
  }
}

export default RadarChart;
