import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/metrics', () => ({
  default: {
    getMetricConfig: vi.fn(),
    getMetricData: vi.fn()
  }
}));

vi.mock('./index', () => ({
  Card: ({ children, headerControls }) => (
    <div>
      <div data-testid="header-controls">{headerControls}</div>
      <div data-testid="card-children">{children}</div>
    </div>
  ),
  NumberWidget: () => <div data-testid="number-widget"></div>,
  TextWidget: () => <div data-testid="text-widget"></div>,
  TableWidget: () => <div data-testid="table-widget"></div>
}));

vi.mock('./charts/ChartTypes/EChartsContainer', () => ({
  default: ({ data = [] }) => (
    <div
      data-testid="chart-data"
      data-rows={String(data.length)}
      data-signature={data.map((item) => `${item.window}/${item.symbol}/${item.label}/${item.flow}`).join(',')}
    ></div>
  )
}));

vi.mock('./LabelSelector', () => ({
  default: ({ labels = [], selectedLabel = '', onSelectLabel, labelField = 'label', idPrefix }) => (
    <div
      data-testid="label-selector"
      data-field={labelField}
      data-selected={selectedLabel}
      data-labels={labels.join('|')}
      data-id-prefix={idPrefix || ''}
    >
      {labels.map((label) => (
        <button key={label} type="button" onClick={() => onSelectLabel(label)}>
          {`${labelField}:${label}`}
        </button>
      ))}
    </div>
  )
}));

vi.mock('./InfoPopover', () => ({
  default: () => <div data-testid="info-popover"></div>
}));

vi.mock('./MetricWidgetSkeleton', () => ({
  default: () => <div data-testid="metric-widget-skeleton"></div>
}));

vi.mock('../utils/echarts/exportImage', () => ({
  downloadEChartInstanceAsPng: vi.fn()
}));

const metricConfigs = {
  flow_inout_metric: {
    id: 'flow_inout_metric',
    chartType: 'bar',
    name: 'Flow In/Out',
    description: 'Flow metric',
    format: 'formatCurrency',
    valueField: 'amount_usd',
    enableFiltering: true,
    labelField: 'window',
    localFilterFields: ['window', 'symbol']
  },
  legacy_filter_metric: {
    id: 'legacy_filter_metric',
    chartType: 'bar',
    name: 'Legacy Filter Metric',
    description: 'Legacy metric',
    format: 'formatCurrency',
    valueField: 'amount_usd',
    enableFiltering: true,
    labelField: 'window'
  }
};

const baseRows = [
  { window: '1D', symbol: 'EURe', label: 'Safe', flow: 'Inflow', amount_usd: 100 },
  { window: '1D', symbol: 'GBPe', label: 'Unknown', flow: 'Outflow', amount_usd: -20 },
  { window: '7D', symbol: 'EURe', label: 'Safe', flow: 'Inflow', amount_usd: 160 },
  { window: '7D', symbol: 'USDC.e', label: 'EOA', flow: 'Outflow', amount_usd: -35 }
];

const getSelectorByField = (fieldName) => (
  screen.getAllByTestId('label-selector').find((element) => element.getAttribute('data-field') === fieldName)
);

let MetricWidget;
let metricsService;

describe('MetricWidget local filter behavior', () => {
  beforeAll(async () => {
    metricsService = (await import('../services/metrics')).default;
    MetricWidget = (await import('./MetricWidget')).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    metricsService.getMetricConfig.mockImplementation((metricId) => metricConfigs[metricId]);
  });

  it('renders two local dropdowns and cascades symbol options from selected window', async () => {
    metricsService.getMetricData.mockResolvedValue({
      data: baseRows
    });

    render(<MetricWidget metricId="flow_inout_metric" />);

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getSelectorByField('window')).toHaveAttribute('data-labels', '1D|7D');
      expect(getSelectorByField('symbol')).toHaveAttribute('data-labels', 'EURe|GBPe');
    });

    fireEvent.click(screen.getByRole('button', { name: 'window:7D' }));

    await waitFor(() => {
      expect(getSelectorByField('symbol')).toHaveAttribute('data-labels', 'EURe|USDC.e');
    });
  });

  it('updates chart data client-side without additional API refetch when local filters change', async () => {
    metricsService.getMetricData.mockResolvedValue({
      data: baseRows
    });

    render(<MetricWidget metricId="flow_inout_metric" />);

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('chart-data')).toHaveAttribute('data-signature', '1D/EURe/Safe/Inflow');
    });

    fireEvent.click(screen.getByRole('button', { name: 'symbol:GBPe' }));
    await waitFor(() => {
      expect(screen.getByTestId('chart-data')).toHaveAttribute('data-signature', '1D/GBPe/Unknown/Outflow');
    });

    fireEvent.click(screen.getByRole('button', { name: 'window:7D' }));
    await waitFor(() => {
      expect(screen.getByTestId('chart-data')).toHaveAttribute('data-signature', '7D/EURe/Safe/Inflow');
    });

    fireEvent.click(screen.getByRole('button', { name: 'symbol:USDC.e' }));
    await waitFor(() => {
      expect(screen.getByTestId('chart-data')).toHaveAttribute('data-signature', '7D/USDC.e/EOA/Outflow');
    });

    expect(metricsService.getMetricData).toHaveBeenCalledTimes(1);
  });

  it('keeps legacy single local dropdown behavior for metrics without localFilterFields', async () => {
    metricsService.getMetricData.mockResolvedValue({
      data: [
        { window: '1D', amount_usd: 10 },
        { window: '7D', amount_usd: 20 }
      ]
    });

    render(<MetricWidget metricId="legacy_filter_metric" />);

    await waitFor(() => {
      expect(metricsService.getMetricData).toHaveBeenCalledTimes(1);
      expect(screen.getAllByTestId('label-selector')).toHaveLength(1);
    });
  });
});
