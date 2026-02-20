import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MetricWidget from './MetricWidget';
import metricsService from '../services/metrics';

vi.mock('../services/metrics', () => ({
  default: {
    getMetricConfig: vi.fn(),
    getMetricData: vi.fn()
  }
}));

vi.mock('./index', () => ({
  Card: ({ children, title, subtitle }) => (
    <div data-testid="card">
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </div>
  ),
  NumberWidget: ({ value }) => <div data-testid="number-widget">{String(value)}</div>,
  TextWidget: ({ content }) => <div data-testid="text-widget">{content}</div>,
  TableWidget: ({ data }) => <div data-testid="table-widget">{Array.isArray(data) ? data.length : 0}</div>
}));

vi.mock('./LabelSelector', () => ({
  default: () => <div data-testid="label-selector"></div>
}));

vi.mock('./InfoPopover', () => ({
  default: () => <div data-testid="info-popover"></div>
}));

vi.mock('./charts/ChartTypes/EChartsContainer', () => ({
  default: ({ data }) => <div data-testid="chart-widget">chart-{Array.isArray(data) ? data.length : 0}</div>
}));

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('MetricWidget loading behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    metricsService.getMetricConfig.mockReturnValue({
      id: 'metric_test',
      chartType: 'line',
      name: 'Test Chart',
      description: 'Chart description',
      enableFiltering: false
    });
  });

  it('renders a skeleton during initial loading', async () => {
    const firstRequest = createDeferred();
    metricsService.getMetricData.mockImplementationOnce(() => firstRequest.promise);

    const { container } = render(<MetricWidget metricId="metric_test" />);

    expect(container.querySelector('.metric-skeleton')).toBeInTheDocument();

    firstRequest.resolve({
      data: [{ date: '2025-01-01', value: 10 }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    });
  });

  it('keeps previous content visible during refetch and shows subtle overlay', async () => {
    const secondRequest = createDeferred();

    metricsService.getMetricData
      .mockResolvedValueOnce({
        data: [{ date: '2025-01-01', token: 'AAA', value: 10 }]
      })
      .mockImplementationOnce(() => secondRequest.promise);

    const { rerender, container } = render(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="AAA"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    });

    rerender(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="BBB"
      />
    );

    expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-1');
    expect(container.querySelector('.loading-overlay-subtle')).toBeInTheDocument();

    secondRequest.resolve({
      data: [
        { date: '2025-01-01', token: 'BBB', value: 14 },
        { date: '2025-01-02', token: 'BBB', value: 16 }
      ]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });
  });

  it('ignores stale responses from older requests', async () => {
    const slowRequest = createDeferred();
    const fastRequest = createDeferred();

    metricsService.getMetricData
      .mockImplementationOnce(() => slowRequest.promise)
      .mockImplementationOnce(() => fastRequest.promise);

    const { rerender } = render(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="AAA"
      />
    );

    rerender(
      <MetricWidget
        metricId="metric_test"
        hasGlobalFilter={true}
        globalFilterField="token"
        globalFilterValue="BBB"
      />
    );

    fastRequest.resolve({
      data: [
        { date: '2025-01-01', token: 'BBB', value: 20 },
        { date: '2025-01-02', token: 'BBB', value: 22 }
      ]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });

    slowRequest.resolve({
      data: [{ date: '2025-01-01', token: 'AAA', value: 11 }]
    });

    await waitFor(() => {
      expect(screen.getByTestId('chart-widget')).toHaveTextContent('chart-2');
    });
  });
});

