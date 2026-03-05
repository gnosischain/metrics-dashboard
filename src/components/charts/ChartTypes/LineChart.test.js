import { describe, expect, it } from 'vitest';
import { LineChart } from './LineChart';

describe('LineChart dashboard palette fallback', () => {
  const data = [
    { date: '2025-01-01', value: 10, label: 'A' },
    { date: '2025-01-02', value: 20, label: 'A' },
    { date: '2025-01-01', value: 15, label: 'B' },
    { date: '2025-01-02', value: 25, label: 'B' }
  ];
  const multiSeriesData = [
    { date: '2025-01-01', value: 10, label: 'A' },
    { date: '2025-01-01', value: 12, label: 'B' },
    { date: '2025-01-01', value: 14, label: 'C' }
  ];

  it('uses dashboard palette for series colors when metric colors are absent', () => {
    const options = LineChart.getOptions(
      data,
      {
        xField: 'date',
        yField: 'value',
        seriesField: 'label',
        dashboardPalette: {
          seriesLight: ['#111111', '#222222'],
          seriesDark: ['#eeeeee', '#dddddd']
        }
      },
      false
    );

    expect(options.series[0].lineStyle.color).toBe('#111111');
    expect(options.series[1].lineStyle.color).toBe('#222222');
  });

  it('keeps explicit metric colors over dashboard palette', () => {
    const options = LineChart.getOptions(
      data,
      {
        xField: 'date',
        yField: 'value',
        seriesField: 'label',
        colors: ['#ff0000', '#00ff00'],
        dashboardPalette: {
          seriesLight: ['#111111', '#222222'],
          seriesDark: ['#eeeeee', '#dddddd']
        }
      },
      false
    );

    expect(options.series[0].lineStyle.color).toBe('#ff0000');
    expect(options.series[1].lineStyle.color).toBe('#00ff00');
  });

  it('fills remaining explicit palette slots from standard palette before repeating', () => {
    const options = LineChart.getOptions(
      multiSeriesData,
      {
        xField: 'date',
        yField: 'value',
        seriesField: 'label',
        colors: ['#101010']
      },
      false
    );

    expect(options.series[0].lineStyle.color).toBe('#101010');
    expect(options.series[1].lineStyle.color).toBe('#4F46E5');
    expect(options.series[2].lineStyle.color).toBe('#10B981');
  });

  it('fills remaining dashboard palette slots from standard palette before repeating', () => {
    const options = LineChart.getOptions(
      multiSeriesData,
      {
        xField: 'date',
        yField: 'value',
        seriesField: 'label',
        dashboardPalette: {
          seriesLight: ['#202020'],
          seriesDark: ['#f0f0f0']
        }
      },
      false
    );

    expect(options.series[0].lineStyle.color).toBe('#202020');
    expect(options.series[1].lineStyle.color).toBe('#4F46E5');
    expect(options.series[2].lineStyle.color).toBe('#10B981');
  });
});
