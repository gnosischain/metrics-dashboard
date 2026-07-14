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

  it('paints only below-zero bars with negativeColor on a single series', () => {
    const options = BarChart.getOptions([
      { date: '2025-01-01', value: 5 },
      { date: '2025-01-02', value: 0 },
      { date: '2025-01-03', value: -3 }
    ], {
      xField: 'date',
      yField: 'value',
      negativeColor: '#ef4444'
    }, false);

    const data = options.series[0].data;
    // positive and zero stay plain numbers (default series color)
    expect(data[0]).toBe(5);
    expect(data[1]).toBe(0);
    // negative becomes an object carrying the red itemStyle
    expect(data[2]).toEqual({ value: -3, itemStyle: { color: '#ef4444' } });
  });

  it('is a no-op when negativeColor is not set (other charts unaffected)', () => {
    const options = BarChart.getOptions([
      { date: '2025-01-01', value: 5 },
      { date: '2025-01-03', value: -3 }
    ], {
      xField: 'date',
      yField: 'value'
    }, false);

    // data stays as plain numbers — identical to prior behavior
    expect(options.series[0].data).toEqual([5, -3]);
  });

  it('does not apply negativeColor to multi-series (stacked) bars', () => {
    const options = BarChart.getOptions([
      { label: 'A', flow: 'Inflow', amount_usd: 90 },
      { label: 'A', flow: 'Outflow', amount_usd: -40 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow',
      negativeColor: '#ef4444'
    }, false);

    // multi-series data remains plain numbers; negativeColor is single-series only
    for (const series of options.series) {
      for (const point of series.data) {
        expect(typeof point).toBe('number');
      }
    }
  });

  it('appends a line overlay series from lineOverlayField (one point per category)', () => {
    const options = BarChart.getOptions([
      { date: '2025-01-01', label: 'New', value: 3, active: 10 },
      { date: '2025-01-01', label: 'Returning', value: 5, active: 10 },
      { date: '2025-01-02', label: 'New', value: 4, active: 9 },
      { date: '2025-01-02', label: 'Returning', value: 4, active: 9 }
    ], {
      xField: 'date', yField: 'value', seriesField: 'label', stacked: true,
      lineOverlayField: 'active', lineOverlayLabel: 'Active'
    }, false);

    const line = options.series.find((s) => s.type === 'line');
    expect(line).toBeTruthy();
    expect(line.name).toBe('Active');
    expect(line.data).toEqual([10, 9]); // one Active value per date
    // the bar series are still present
    expect(options.series.filter((s) => s.type === 'bar').map((s) => s.name).sort()).toEqual(['New', 'Returning']);
  });

  it('adds no line series when lineOverlayField is unset (no-op)', () => {
    const options = BarChart.getOptions([
      { date: '2025-01-01', label: 'New', value: 3 },
      { date: '2025-01-01', label: 'Returning', value: 5 }
    ], { xField: 'date', yField: 'value', seriesField: 'label' }, false);
    expect(options.series.some((s) => s.type === 'line')).toBe(false);
  });

  it('reserves extra top grid space when a top legend is visible', () => {
    const options = BarChart.getOptions([
      { label: 'Safe', flow: 'Outflow', amount_usd: -40 },
      { label: 'Safe', flow: 'Inflow', amount_usd: 90 }
    ], {
      xField: 'label',
      yField: 'amount_usd',
      seriesField: 'flow'
    }, false);

    expect(options.legend.show).toBe(true);
    expect(options.grid.top).toBe('52px');
  });
});
