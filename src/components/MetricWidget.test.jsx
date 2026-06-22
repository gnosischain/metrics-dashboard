import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('echarts', () => ({
  getInstanceByDom: vi.fn()
}));

vi.mock('../services/metrics', () => ({
  default: {
    getMetricConfig: vi.fn(),
    getMetricData: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    loadMetricConfigs: vi.fn(() => Promise.resolve())
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
  TableWidget: ({ config = {}, height }) => (
    <div
      data-testid="table-widget"
      data-height={height || ''}
      data-pagination-size={String(config.paginationSize || '')}
      data-pagination-selector={Array.isArray(config.paginationSizeSelector) ? config.paginationSizeSelector.join('|') : String(config.paginationSizeSelector || '')}
      data-responsive-layout={String(config.responsiveLayout)}
      data-row-height={String(config.rowHeight || '')}
    ></div>
  )
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
  },
  table_metric: {
    id: 'table_metric',
    chartType: 'table',
    name: 'Table Metric',
    description: 'Table metric',
    tableConfig: {
      paginationSize: 100,
      paginationSizeSelector: false,
      responsiveLayout: 'collapse',
      rowHeight: 40,
    }
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

  it('passes scoped table overrides and height to TableWidget', async () => {
    metricsService.getMetricData.mockResolvedValue({
      data: [{ id: 1 }]
    });

    render(
      <MetricWidget
        metricId="table_metric"
        tableHeight="360px"
        tableConfigOverrides={{
          paginationSize: 10,
          paginationSizeSelector: [10, 25, 50],
          responsiveLayout: false,
          rowHeight: 36,
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-height', '360px');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-pagination-size', '10');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-pagination-selector', '10|25|50');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-responsive-layout', 'false');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-row-height', '36');
    });
  });

  it('keeps table defaults unchanged when scoped overrides are omitted', async () => {
    metricsService.getMetricData.mockResolvedValue({
      data: [{ id: 1 }]
    });

    render(<MetricWidget metricId="table_metric" />);

    await waitFor(() => {
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-height', '');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-pagination-size', '100');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-responsive-layout', 'collapse');
      expect(screen.getByTestId('table-widget')).toHaveAttribute('data-row-height', '40');
    });
  });
});

describe('MetricWidget resolution toggle (lazy variant configs)', () => {
  beforeAll(async () => {
    metricsService = (await import('../services/metrics')).default;
    MetricWidget = (await import('./MetricWidget')).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Regression: switching D/W/M swaps the metric id to a *_daily / *_monthly
  // sibling whose config is loaded lazily. Before the fix, the config memo was
  // keyed only on the id and never re-resolved when the variant landed, so the
  // widget got stuck on the "Unknown widget type" dead-end. It must instead
  // self-heal to the variant chart once the config arrives.
  it('renders the daily variant chart (never "Unknown widget type") when its config loads lazily after clicking D', async () => {
    const weekly = {
      id: 'pay_weekly',
      chartType: 'bar',
      name: 'Payments',
      description: 'Weekly',
      isTimeSeries: true,
      xField: 'date',
      yField: 'value',
      seriesField: 'label',
      resolutions: ['daily', 'weekly', 'monthly'],
      defaultResolution: 'weekly'
    };
    const daily = { ...weekly, id: 'pay_daily', description: 'Daily' };

    // weekly is cached up front; daily is only available once loadMetricConfigs runs.
    const cache = { pay_weekly: weekly };
    const lazy = { pay_daily: daily };
    let notify = null;

    metricsService.getMetricConfig.mockImplementation((id) => cache[id]);
    metricsService.subscribe.mockImplementation((cb) => {
      notify = cb;
      return () => { notify = null; };
    });
    metricsService.loadMetricConfigs.mockImplementation(async (ids = []) => {
      let changed = false;
      ids.forEach((id) => {
        if (lazy[id] && !cache[id]) {
          cache[id] = lazy[id];
          changed = true;
        }
      });
      if (changed && notify) notify(Date.now());
    });
    metricsService.getMetricData.mockResolvedValue({
      data: [{ date: '2026-06-20', label: 'EURe', value: 10 }]
    });

    render(<MetricWidget metricId="pay_weekly" enableResolutionToggle />);

    // Weekly chart renders first.
    await waitFor(() => {
      expect(screen.getByTestId('chart-data')).toBeInTheDocument();
    });

    // Toggle to daily — its config is not in the cache yet.
    fireEvent.click(screen.getByRole('button', { name: 'D' }));

    // It must recover to the chart and never surface the dead-end string.
    await waitFor(() => {
      expect(screen.getByTestId('chart-data')).toBeInTheDocument();
    });
    expect(screen.queryByText('Unknown widget type')).toBeNull();

    // The daily variant config was lazily requested and its data fetched.
    expect(metricsService.loadMetricConfigs).toHaveBeenCalledWith(['pay_daily']);
    await waitFor(() => {
      const fetchedDaily = metricsService.getMetricData.mock.calls.some((c) => c[0] === 'pay_daily');
      expect(fetchedDaily).toBe(true);
    });
  });
});
