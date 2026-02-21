import { describe, expect, it } from 'vitest';
import { HeatmapChart } from './HeatmapChart';

describe('HeatmapChart palette scale resolution', () => {
  const data = [
    { x: '2025-01-01', y: 'A', value: 1 },
    { x: '2025-01-02', y: 'A', value: 2 },
    { x: '2025-01-01', y: 'B', value: 3 },
    { x: '2025-01-02', y: 'B', value: 4 }
  ];

  it('uses dashboard heatmap scale when metric scale is absent', () => {
    const options = HeatmapChart.getOptions(
      data,
      {
        xField: 'x',
        yField: 'y',
        valueField: 'value',
        dashboardPalette: {
          heatmapScaleLight: ['#111111', '#222222', '#333333'],
          heatmapScaleDark: ['#aaaaaa', '#bbbbbb', '#cccccc']
        }
      },
      false
    );

    expect(options.visualMap.inRange.color).toEqual(['#111111', '#222222', '#333333']);
  });

  it('keeps explicit metric heatmap scale over dashboard palette', () => {
    const options = HeatmapChart.getOptions(
      data,
      {
        xField: 'x',
        yField: 'y',
        valueField: 'value',
        heatmapScale: ['#ff0000', '#00ff00'],
        dashboardPalette: {
          heatmapScaleLight: ['#111111', '#222222', '#333333'],
          heatmapScaleDark: ['#aaaaaa', '#bbbbbb', '#cccccc']
        }
      },
      false
    );

    expect(options.visualMap.inRange.color).toEqual(['#ff0000', '#00ff00']);
  });
});
