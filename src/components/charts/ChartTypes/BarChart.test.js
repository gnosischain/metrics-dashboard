import { describe, expect, it } from 'vitest';
import { BarChart } from './BarChart';

describe('BarChart custom series colors and category sorting', () => {
  it('applies seriesColorsByName for multi-series bars', () => {
    const options = BarChart.getOptions([
      { label: 'Safe', flow: 'Outflow', amount_usd: -40 },
      { label: 'Safe', flow: 'Inflow', amount_usd: 90 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow',
      seriesColorsByName: {
        Inflow: '#22C55E',
        Outflow: '#EF4444'
      }
    }, false);

    const inflowSeries = options.series.find((series) => series.name === 'Inflow');
    const outflowSeries = options.series.find((series) => series.name === 'Outflow');

    expect(inflowSeries.itemStyle.color).toBe('#22C55E');
    expect(outflowSeries.itemStyle.color).toBe('#EF4444');
  });

  it('keeps named series color stable when one series is missing', () => {
    const options = BarChart.getOptions([
      { label: 'Safe', flow: 'Outflow', amount_usd: -25 },
      { label: 'EOA', flow: 'Outflow', amount_usd: -10 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow',
      seriesColorsByName: {
        Inflow: '#22C55E',
        Outflow: '#EF4444'
      }
    }, false);

    expect(options.series).toHaveLength(1);
    expect(options.series[0].name).toBe('Outflow');
    expect(options.series[0].itemStyle.color).toBe('#EF4444');
  });

  it('sorts categories by absolute net amount when categorySort is absNetDesc', () => {
    const options = BarChart.getOptions([
      { label: 'A', flow: 'Inflow', amount_usd: 100 },
      { label: 'A', flow: 'Outflow', amount_usd: -10 },
      { label: 'B', flow: 'Inflow', amount_usd: 40 },
      { label: 'B', flow: 'Outflow', amount_usd: -210 },
      { label: 'C', flow: 'Inflow', amount_usd: 60 },
      { label: 'C', flow: 'Outflow', amount_usd: -50 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow',
      categorySort: 'absNetDesc'
    }, false);

    expect(options.xAxis.data).toEqual(['B', 'A', 'C']);
  });

  it('keeps default category sorting unchanged when categorySort is not provided', () => {
    const options = BarChart.getOptions([
      { label: 'B', flow: 'Inflow', amount_usd: 40 },
      { label: 'A', flow: 'Inflow', amount_usd: 100 },
      { label: 'C', flow: 'Inflow', amount_usd: 60 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow'
    }, false);

    expect(options.xAxis.data).toEqual(['A', 'B', 'C']);
  });
});
